import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { MetodosPagoService } from '../services/metodos-pago.service'; // 🆕 Nuevo servicio
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './configuracionperfil.component.html',
  styleUrls: ['./configuracionperfil.component.css'],
})
export class ConfiguracionComponent implements OnInit {
  usuario: any = null;
  metodoPago: any = null; // 🆕 Método de pago desde la API
  cargando = true;
  
  // Variables para el modal de eliminación
  mostrarModalEliminar = false;
  textoConfirmacion = '';
  errorConfirmacion = false;

  constructor(
    private usuarioService: UsuariosService,
    private metodosPagoService: MetodosPagoService, // 🆕 Inyectar servicio
    private router: Router
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    let email: string | null = null;

    if (userString) {
      const user = JSON.parse(userString);
      this.usuario = {
        id: user.id || user.id_usuario,
        id_usuario: user.id || user.id_usuario,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        lada: user.lada || '+52',
        imagen: this.obtenerUrlImagen(user.imagen),
        direccion: user.direccion || '',
        tarjeta: user.tarjeta || '',
        tipo_tarjeta: user.tipo_tarjeta || '',
        rol: user.rol || 'user'
      };
      email = user.email;
      this.cargando = false;
    }

    if (!email) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuarioPorEmail(email).subscribe({
      next: (data: any) => {
        const userId = data.id || data.id_usuario || this.usuario.id;
        
        this.usuario = {
          id: userId,
          id_usuario: userId,
          nombre: data.nombre || this.usuario.nombre,
          apellido: data.apellido || this.usuario.apellido,
          email: data.email || this.usuario.email,
          telefono: data.telefono || this.usuario.telefono,
          lada: data.lada || this.usuario.lada || '+52',
          imagen: this.obtenerUrlImagen(data.imagen) || this.usuario.imagen,
          direccion: data.direccion || this.usuario.direccion,
          tarjeta: data.tarjeta || this.usuario.tarjeta,
          tipo_tarjeta: data.tipo_tarjeta || this.usuario.tipo_tarjeta,
          rol: data.rol || this.usuario.rol || 'user'
        };
        this.cargando = false;

        console.log('💾 Guardando usuario completo:', this.usuario);
        localStorage.setItem('user', JSON.stringify(this.usuario));
        this.usuarioService.setUsuarioActual(this.usuario);

        // 🆕 Cargar método de pago desde la API
        this.cargarMetodoPago();
      },
      error: (err: any) => {
        console.error('Error cargando usuario desde backend:', err);
        this.cargando = false;
      }
    });
  }

  // 🆕 Nuevo método para cargar desde la API
  cargarMetodoPago(): void {
    if (!this.usuario?.id && !this.usuario?.id_usuario) {
      return;
    }

    const userId = this.usuario.id || this.usuario.id_usuario;

    this.metodosPagoService.obtenerMetodosPago(userId).subscribe({
      next: (metodos: any[]) => {
        if (metodos && metodos.length > 0) {
          // Buscar el predeterminado o tomar el primero
          this.metodoPago = metodos.find(m => m.es_predeterminado === 1) || metodos[0];
          console.log('💳 Método de pago cargado:', this.metodoPago);
        }
      },
      error: (err) => {
        console.log('ℹ️ No hay métodos de pago guardados o error:', err);
      }
    });
  }

  // 🆕 Getter para mostrar el número de tarjeta
  get numeroTarjeta(): string {
    if (this.metodoPago?.ultimos_digitos) {
      return `**** **** **** ${this.metodoPago.ultimos_digitos}`;
    }
    // Fallback a los datos antiguos si existen
    if (this.usuario?.tarjeta) {
      return `**** **** **** ${this.usuario.tarjeta}`;
    }
    return '**** **** **** 0000';
  }

  // 🆕 Getter para el tipo de tarjeta
  get tipoTarjeta(): string {
    if (this.metodoPago?.tipo_tarjeta) {
      return this.metodoPago.tipo_tarjeta;
    }
    // Fallback
    return this.usuario?.tipo_tarjeta || 'VISA';
  }

  // 🆕 Getter para el color de la tarjeta
  get colorTarjeta(): string {
    if (this.metodoPago?.color_tarjeta) {
      return this.metodoPago.color_tarjeta;
    }
    // Color por defecto
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // 🆕 Getter para el banco
  get bancoTarjeta(): string {
    return this.metodoPago?.banco || '';
  }

  // 🆕 Getter para el nombre del titular
  get titularTarjeta(): string {
    if (this.metodoPago?.nombre_titular) {
      return this.metodoPago.nombre_titular;
    }
    return `${this.usuario?.nombre || ''} ${this.usuario?.apellido || ''}`.trim().toUpperCase();
  }

  obtenerUrlImagen(imagen: string | null | undefined): string {
    if (!imagen || imagen.trim() === '') {
      return 'assets/img/avatar.png';
    }

    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }

    if (imagen.startsWith('/') || imagen.startsWith('uploads/')) {
      const baseUrl = 'http://localhost:8000';
      return `${baseUrl}${imagen.startsWith('/') ? imagen : '/' + imagen}`;
    }

    if (imagen.startsWith('assets/')) {
      return imagen;
    }

    return 'assets/img/avatar.png';
  }

  // Funciones para el modal de eliminación
  abrirModalEliminar(): void {
    this.mostrarModalEliminar = true;
    this.textoConfirmacion = '';
    this.errorConfirmacion = false;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.textoConfirmacion = '';
    this.errorConfirmacion = false;
  }

  confirmarEliminacion(): void {
    if (this.textoConfirmacion !== 'ELIMINAR') {
      this.errorConfirmacion = true;
      return;
    }

    const userId = this.usuario.id || this.usuario.id_usuario;
    
    if (!userId) {
      alert('Error: No se pudo identificar el usuario');
      return;
    }

    if (confirm('¿Estás absolutamente seguro? Esta acción NO se puede deshacer.')) {
      this.usuarioService.eliminarUsuario(userId).subscribe({
        next: () => {
          alert('Tu cuenta ha sido eliminada permanentemente');
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Error al eliminar cuenta:', err);
          alert('No se pudo eliminar la cuenta: ' + (err.error?.detail || 'Error desconocido'));
        }
      });
    }
  }

  editarCuenta() {
    this.router.navigate(['/perfil/editar'], { 
      queryParams: { seccion: 'cuenta' } 
    });
  }

  editarDireccion() {
    this.router.navigate(['/perfil/editar-direccion']);
  }

  editarPago() {
    this.router.navigate(['/perfil/editar-pago']);
  }

  volver() {
    this.router.navigate(['/inicio']);
  }

  cerrarSesion() { 
    localStorage.clear(); 
    this.router.navigate(['/login']); 
  }
}