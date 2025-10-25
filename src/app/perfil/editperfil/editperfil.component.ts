import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editperfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editperfil.component.html',
  styleUrls: ['./editperfil.component.css']
})
export class EditPerfilComponent {
  user = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    imagen: 'assets/img/profile.jpeg'
  };

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  volver() {
    this.router.navigate(['/perfil']);
  }

  abrirSelectorFoto() {
    const input = document.getElementById('fotoInput') as HTMLInputElement;
    input.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.user.imagen = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  guardarCambios() {
    localStorage.setItem('user', JSON.stringify(this.user));
    alert('✅ Cambios guardados correctamente');
    this.router.navigate(['/perfil']);
  }
}
