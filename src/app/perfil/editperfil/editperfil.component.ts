import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importa FormsModule
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-editperfil',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- FormsModule para ngModel
  templateUrl: './editperfil.component.html',
  styleUrls: ['./editperfil.component.css']
})
export class EditPerfilComponent implements OnInit {
  user: any = {
    id_usuario: null,
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    lada: '+52', // <-- lada por defecto
    imagen: 'assets/img/avatar.png'
  };

  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit(): void {
    // Cargar usuario desde localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
      // Si no existe lada en el localStorage, asignar por defecto
      if (!this.user.lada) {
        this.user.lada = '+52';
      }
    }

    // Suscribirse a query params si es necesario para secciones
    this.route.queryParams.subscribe(params => {
      // opcional: manejar secciones
    });
  }

  guardarCambios() {
    // Concatenar lada + teléfono antes de enviar al backend
    const usuarioActualizar = { ...this.user };
    usuarioActualizar.telefono = `${this.user.lada} ${this.user.telefono}`;

    this.usuarioService.actualizarUsuario(usuarioActualizar).subscribe({
      next: () => {
        // Subir foto si fue seleccionada
        if (this.selectedFile) {
          this.usuarioService.subirFotoPerfil(this.user.id_usuario, this.selectedFile).subscribe({
            next: () => console.log('Foto subida correctamente'),
            error: (err: any) => console.error('Error al subir foto:', err)
          });
        }

        // Actualizar localStorage con datos nuevos
        localStorage.setItem('user', JSON.stringify(usuarioActualizar));
        alert('Perfil actualizado correctamente');
        this.router.navigate(['/perfil']);
      },
      error: (err: any) => {
        console.error('Error al actualizar usuario:', err);
        alert('No se pudo actualizar el perfil');
      }
    });
  }

  volver() {
    this.router.navigate(['/perfil']);
  }

  abrirSelectorFoto() {
    const input: any = document.getElementById('fotoInput');
    input.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.user.imagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
