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

  // 🔹 Propiedades para la alerta
  alertaVisible = false;
  mensajeAlerta = '';
  tipoAlerta: 'exito' | 'error' | 'info' = 'info';

  constructor(public router: Router, private http: HttpClient) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  mostrarAlerta(mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.alertaVisible = true;

    // Se oculta automáticamente después de 3 segundos
    setTimeout(() => {
      this.alertaVisible = false;
    }, 10000);
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
        this.mostrarAlerta('Registro exitoso 🎉', 'exito');
        this.toggleMode();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.mostrarAlerta('Error al registrarte 😢', 'error');
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

        // 🔹 Obtener datos completos del usuario desde el backend
        this.http.get<any>(`http://localhost:8000/api/usuario?email=${encodeURIComponent(this.email)}`)
          .subscribe(
            userRes => {
              const nombreUsuario = userRes.nombre || 'Usuario';
              const userData = {
                nombre: nombreUsuario,
                apellido: userRes.apellido || '',
                email: this.email,
                imagen: userRes.imagen || 'assets/img/profile.jpeg'
              };

              // 🔹 Guardamos en localStorage para ConfiguracionComponent
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('email', this.email);
              window.dispatchEvent(new Event('storage'));

              // Mostrar alerta con el nombre del usuario
              this.mostrarAlerta(`¡Hola ${nombreUsuario}! Inicio de sesión correcto 🔥`, 'exito');

              setTimeout(() => this.router.navigate(['/']), 1000); // Espera a mostrar la alerta
            },
            err => {
              console.error('Error al obtener usuario desde backend:', err);
              const userData = {
                nombre: 'Usuario',
                apellido: '',
                email: this.email,
                imagen: 'assets/img/profile.jpeg'
              };
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('email', this.email);
              window.dispatchEvent(new Event('storage'));

              this.mostrarAlerta('¡Hola Usuario! Inicio de sesión correcto 🔥', 'exito');
              setTimeout(() => this.router.navigate(['/']), 1000);
            }
          );
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.mostrarAlerta('Credenciales incorrectas ❌', 'error');
      }
    });
  }
}
