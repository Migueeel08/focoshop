import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isRegisterMode = false;
  nombre = '';
  apellido = '';
  email = '';
  contrasena = '';

  constructor(public router: Router, private http: HttpClient) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onSubmit() {
    if (this.isRegisterMode) {
      this.register();
    } else {
      this.login();
    }
  }

  register() {
    const user = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      contrasena: this.contrasena
    };

    this.http.post('http://localhost:8000/register', user).subscribe({
      next: (res) => {
        console.log('Usuario registrado:', res);
        alert('Registro exitoso');
        this.toggleMode();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        alert('Error al registrarte');
      }
    });
  }

  login() {
    const body = new URLSearchParams();
    body.set('username', this.email);
    body.set('password', this.contrasena);

    this.http.post('http://localhost:8000/token', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe({
      next: (res: any) => {
        console.log('Login exitoso:', res);
        alert('Inicio de sesión correcto');

        // 🔹 Crear datos de usuario (ajústalo según tu backend)
        const userData = {
          nombre: this.nombre || 'Usuario',
          email: this.email,
          imagen: 'assets/img/profile.jpeg' // Puedes cambiarlo si tu backend devuelve una imagen
        };

        // 🔹 Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // 🔹 Forzar evento para actualizar otros componentes
        window.dispatchEvent(new Event('storage'));

        // 🔹 Redirigir a inicio
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        alert('Credenciales incorrectas');
      }
    });
  }
}
