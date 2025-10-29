import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

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

  alertaVisible = false;
  mensajeAlerta = '';
  tipoAlerta: 'exito' | 'error' | 'info' = 'info';

  // 🔹 URL base del backend
  private apiUrl = 'http://localhost:8000/api/usuarios';
  private baseUrl = 'http://localhost:8000'; // URL base para imágenes

  constructor(public router: Router, private http: HttpClient) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  mostrarAlerta(mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.alertaVisible = true;
    setTimeout(() => this.alertaVisible = false, 3000);
  }

  onSubmit() {
    if (this.isRegisterMode) {
      this.register();
    } else {
      this.login();
    }
  }

  // ===========================
  // Registro de usuario
  // ===========================
  register() {
    const user = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.contrasena
    };

    // ✅ Ruta: /api/usuarios/usuarios/register
    this.http.post(`${this.apiUrl}/usuarios/register`, user).subscribe({
      next: (res) => {
        console.log('Usuario registrado:', res);
        this.mostrarAlerta('Registro exitoso 🎉', 'exito');
        // Limpiar campos
        this.nombre = '';
        this.apellido = '';
        this.email = '';
        this.contrasena = '';
        // Cambiar a modo login
        this.toggleMode();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        const mensaje = err.error?.detail || 'Error al registrarte 😢';
        this.mostrarAlerta(mensaje, 'error');
      }
    });
  }

  // ===========================
  // Login
  // ===========================
  login() {
    const body = new URLSearchParams();
    body.set('username', this.email);
    body.set('password', this.contrasena);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    // ✅ CORREGIDO: /api/usuarios/usuarios/token
    this.http.post<any>(`${this.apiUrl}/usuarios/token`, body.toString(), { headers }).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);

        // 🔹 Guardamos el token JWT
        localStorage.setItem('token', res.access_token);

        // ✅ Ruta: /api/usuarios/usuarios/email/{email}
        this.http.get<any>(`${this.apiUrl}/usuarios/email/${encodeURIComponent(this.email)}`).subscribe({
          next: (userRes) => {
            console.log('Datos del usuario desde backend:', userRes);
            console.log('Imagen del usuario (raw):', userRes.imagen);
            
            const nombreUsuario = userRes.nombre || 'Usuario';
            
            // ✅ Construir URL completa de la imagen
            let imagenUrl = 'assets/img/profile.jpeg'; // Imagen por defecto
            
            if (userRes.imagen && userRes.imagen.trim() !== '') {
              // Si la imagen empieza con /uploads, agregar la URL base del servidor
              if (userRes.imagen.startsWith('/uploads')) {
                imagenUrl = `${this.baseUrl}${userRes.imagen}`;
              }
              // Si empieza con uploads (sin barra inicial)
              else if (userRes.imagen.startsWith('uploads')) {
                imagenUrl = `${this.baseUrl}/${userRes.imagen}`;
              }
              // Si ya es una URL completa (http:// o https://)
              else if (userRes.imagen.startsWith('http')) {
                imagenUrl = userRes.imagen;
              }
              // Si es una ruta de assets local
              else if (userRes.imagen.startsWith('assets/')) {
                imagenUrl = userRes.imagen;
              }
              // Si es solo el nombre del archivo, asumir que está en /uploads/perfiles/
              else if (!userRes.imagen.includes('/')) {
                imagenUrl = `${this.baseUrl}/uploads/perfiles/${userRes.imagen}`;
              }
              // Cualquier otra ruta relativa
              else {
                imagenUrl = `${this.baseUrl}${userRes.imagen}`;
              }
            }
            
            console.log('URL de imagen construida:', imagenUrl);
            
            const userData = {
              id: userRes.id_usuario,
              id_usuario: userRes.id_usuario,
              nombre: nombreUsuario,
              apellido: userRes.apellido || '',
              email: this.email,
              telefono: userRes.telefono || '',
              imagen: imagenUrl, // ✅ URL completa
              rol: userRes.rol || 'user'
            };

            console.log('Datos guardados en localStorage:', userData);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('email', this.email);
            localStorage.setItem('userId', userRes.id_usuario.toString());
            
            window.dispatchEvent(new Event('storage'));

            this.mostrarAlerta(`¡Hola ${nombreUsuario}! Inicio de sesión correcto 🔥`, 'exito');
            setTimeout(() => this.router.navigate(['/']), 1000);
          },
          error: (err) => {
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
        });
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        const mensaje = err.error?.detail || 'Credenciales incorrectas ❌';
        this.mostrarAlerta(mensaje, 'error');
      }
    });
  }
}