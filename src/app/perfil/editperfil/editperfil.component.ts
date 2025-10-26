import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-editperfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editperfil.component.html',
  styleUrls: ['./editperfil.component.css']
})
export class EditPerfilComponent implements OnInit {
  user: any = {
    id: null,
    id_usuario: null,
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    lada: '+52',
    imagen: 'assets/img/avatar.png'
  };

  selectedFile: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;

  // ✅ Propiedades para la alerta
  mostrarAlerta = false;
  mensajeAlerta = '';

  constructor(
    private router: Router,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      this.user = { 
        ...userData,
        id_usuario: userData.id || userData.id_usuario,
        lada: userData.lada || '+52'
      };
      
      console.log('Usuario cargado:', this.user);
    } else {
      const usuarioLocal = this.usuarioService.usuarioActual;
      if (usuarioLocal) {
        this.user = { 
          ...usuarioLocal,
          id_usuario: usuarioLocal.id || usuarioLocal.id_usuario,
          lada: usuarioLocal.lada || '+52'
        };
      }
    }

    const userId = this.user.id || this.user.id_usuario;
    
    if (!userId) {
      console.error('No se encontró ID del usuario:', this.user);
      alert('No se encontró el ID del usuario. Vuelve a iniciar sesión.');
      this.router.navigate(['/login']);
      return;
    }

    this.user.id = userId;
    this.user.id_usuario = userId;

    console.log('ID del usuario confirmado:', userId);
  }

  guardarCambios(): void {
    const userId = this.user.id || this.user.id_usuario;

    if (!userId) {
      alert('Error: No se encontró el ID del usuario');
      return;
    }

    let telefonoCompleto = this.user.telefono;

    if (this.user.lada && this.user.telefono) {
      telefonoCompleto = `${this.user.lada} ${this.user.telefono}`.trim();
    }

    // 🔹 Limpiar y formatear el teléfono
    if (telefonoCompleto) {
      // Eliminar espacios
      telefonoCompleto = telefonoCompleto.replace(/\s+/g, '');
      // Eliminar + duplicados y mantener solo uno al inicio
      telefonoCompleto = telefonoCompleto.replace(/\++/g, '+');
      if (!telefonoCompleto.startsWith('+')) {
        telefonoCompleto = '+' + telefonoCompleto;
      }
      // Limitar a 20 caracteres para no romper la columna MySQL
      telefonoCompleto = telefonoCompleto.substring(0, 20);
    }

    const usuarioActualizar = {
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      telefono: telefonoCompleto
    };

    console.log('Actualizando usuario ID:', userId);
    console.log('Datos a enviar:', usuarioActualizar);

    this.usuarioService.actualizarUsuario(userId, usuarioActualizar).subscribe({
      next: (usuarioActualizado) => {
        console.log('Usuario actualizado:', usuarioActualizado);

        if (this.selectedFile) {
          this.usuarioService.subirFotoPerfil(userId, this.selectedFile).subscribe({
            next: (res) => {
              console.log('Foto subida correctamente:', res);
              if (res.foto_url) {
                this.user.imagen = `http://localhost:8000${res.foto_url}`;
              }
              this.finalizarActualizacion();
            },
            error: (err) => {
              console.error('Error al subir foto:', err);
              this.finalizarActualizacion();
            }
          });
        } else {
          this.finalizarActualizacion();
        }
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        alert('No se pudo actualizar el perfil: ' + (err.error?.detail || 'Error desconocido'));
      }
    });
  }

  finalizarActualizacion(): void {
    const apiUrl = 'http://localhost:8000';
    
    let imagenFinal = this.user.imagen;
    
    if (imagenFinal && !imagenFinal.startsWith('http') && !imagenFinal.startsWith('assets') && !imagenFinal.startsWith('data:image')) {
      if (imagenFinal.startsWith('/uploads')) {
        imagenFinal = `${apiUrl}${imagenFinal}`;
      }
    }

    const userData = {
      id: this.user.id || this.user.id_usuario,
      id_usuario: this.user.id || this.user.id_usuario,
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      email: this.user.email,
      telefono: this.user.telefono,
      lada: this.user.lada,
      imagen: imagenFinal,
      rol: this.user.rol || 'user'
    };

    console.log('Guardando en localStorage:', userData);

    localStorage.setItem('user', JSON.stringify(userData));
    this.usuarioService.setUsuarioActual(userData);
    window.dispatchEvent(new Event('storage'));

    // ✅ Mostrar alerta animada
    this.mensajeAlerta = '¡Perfil actualizado correctamente!';
    this.mostrarAlerta = true;

    // ✅ Redirigir después de 2.5 segundos
    setTimeout(() => {
      this.router.navigate(['/perfil']);
    }, 2500);
  }

  volver(): void {
    this.router.navigate(['/perfil']);
  }

  abrirSelectorFoto(): void {
    const input: HTMLElement | null = document.getElementById('fotoInput');
    input?.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Por favor selecciona una imagen válida (JPG, PNG, GIF, WEBP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
        this.user.imagen = this.imagenPreview as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
