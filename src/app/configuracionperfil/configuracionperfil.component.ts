import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './configuracionperfil.component.html',
  styleUrls: ['./configuracionperfil.component.css'],
})
export class ConfiguracionComponent implements OnInit {
  usuario: any = null;
  cargando = true;

  constructor(
    private usuarioService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔹 Cargar primero desde localStorage
    const userString = localStorage.getItem('user');
    let email: string | null = null;

    if (userString) {
      const user = JSON.parse(userString);
      this.usuario = {
        nombre: user.nombre || '',
        apellido: user.apellido || '',      // ✅ apellido incluido
        email: user.email || '',
        telefono: user.telefono || '',
        imagen: user.imagen || 'assets/img/avatar.png',
        direccion: user.direccion || '',
        tarjeta: user.tarjeta || '',
        tipo_tarjeta: user.tipo_tarjeta || ''
      };
      email = user.email;
      this.cargando = false;
    }

    // 🔹 Si no hay email, redirigir al login
    if (!email) {
      this.router.navigate(['/login']);
      return;
    }

    // 🔹 Actualizar datos desde backend
    this.usuarioService.obtenerUsuarioPorEmail(email).subscribe({
      next: (data) => {
        this.usuario = {
          nombre: data.nombre || this.usuario.nombre,
          apellido: data.apellido || this.usuario.apellido,
          email: data.email || this.usuario.email,
          telefono: data.telefono || this.usuario.telefono,
          imagen: data.imagen || this.usuario.imagen,
          direccion: data.direccion || this.usuario.direccion,
          tarjeta: data.tarjeta || this.usuario.tarjeta,
          tipo_tarjeta: data.tipo_tarjeta || this.usuario.tipo_tarjeta
        };
        this.cargando = false;

        // Actualizar localStorage con los datos más recientes
        localStorage.setItem('user', JSON.stringify(this.usuario));
      },
      error: (err) => {
        console.error('Error cargando usuario desde backend:', err);
        this.cargando = false;
      }
    });
  }

  // 🔹 Navegar al componente de edición pasando la sección correspondiente
  editarCuenta() {
    this.router.navigate(['/perfil/editar'], { queryParams: { seccion: 'cuenta' } });
  }

  editarDireccion() {
    this.router.navigate(['/perfil/editar'], { queryParams: { seccion: 'direccion' } });
  }

  editarPago() {
    this.router.navigate(['/perfil/editar'], { queryParams: { seccion: 'pago' } });
  }

  volver() {
    this.router.navigate(['/inicio']);
  }

  cerrarSesion() { 
    localStorage.clear(); 
    this.router.navigate(['/login']); 
  }
}
