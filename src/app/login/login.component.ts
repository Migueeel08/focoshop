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

  constructor(private router: Router) {}

  login() {
    console.log('Intentando iniciar sesión con:', this.email);
    // Simulación de login correcto
    this.router.navigate(['/']);
  }

  loginWithGoogle() {
    console.log('Iniciar sesión con Google');
    // Aquí va tu lógica de autenticación con Google (Firebase u otro método)
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
