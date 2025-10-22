import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  nombre = '';
  isLogin = true; // Alterna entre login y registro

  constructor(private router: Router) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  login() {
    console.log('Iniciar sesión con:', this.email);
    this.router.navigate(['/']);
  }

  register() {
    console.log('Registrando usuario:', this.nombre, this.email);
    this.router.navigate(['/']);
  }

  loginWithGoogle() {
    console.log('Iniciar sesión con Google');
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
