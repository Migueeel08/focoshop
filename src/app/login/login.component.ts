import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✅ AGREGADO RouterModule
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule], // ✅ AGREGADO RouterModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  // ===== MODOS =====
  isRegisterMode = false;
  
  // ===== CAMPOS DEL FORMULARIO =====
  nombre = '';
  apellido = '';
  email = '';
  contrasena = '';
  confirmarContrasena = '';
  recordarme = false;
  
  // ===== CONTROL DE VISIBILIDAD DE CONTRASEÑAS =====
  mostrarContrasena = false;
  mostrarConfirmarContrasena = false;
  
  // ===== VALIDACIONES =====
  nombreInvalido = false;
  apellidoInvalido = false;
  emailInvalido = false;
  emailValido = false;
  emailMensaje = '';
  contrasenaInvalida = false;
  contrasenaValida = false;
  confirmarContrasenaInvalida = false;
  confirmarContrasenaValida = false;
  
  // ===== SEGURIDAD DE CONTRASEÑA =====
  fuerzaContrasena = 0;
  nivelSeguridad: 'débil' | 'media' | 'fuerte' = 'débil';
  requisitos = {
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  };
  
  // ===== ALERTA =====
  alertaVisible = false;
  mensajeAlerta = '';
  tipoAlerta: 'exito' | 'error' | 'info' = 'info';
  
  // ===== CARGANDO =====
  cargando = false;

  // ===== API =====
  private apiUrl = environment.apiUrl + '/api';
  private baseUrl = environment.apiUrl;

  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoogleScript();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeGoogleSignIn();
    }, 500);
  }

  // ===========================
  // GOOGLE SIGN-IN
  // ===========================
  loadGoogleScript(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '287808420980-s2poeedgd6veoojkev5j3huia9no8uh2.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('buttonDiv'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    }
  }

  handleCredentialResponse(response: any): void {
    const payload = this.parseJwt(response.credential);
    
    console.log('📦 Payload completo de Google:', payload);

    const userData = {
      email: payload.email,
      nombre: payload.given_name || payload.name || 'Usuario',
      apellido: payload.family_name || '',
      imagen: payload.picture || 'assets/img/profile.jpeg',
      google_id: payload.sub,
      email_verified: payload.email_verified || false
    };

    console.log('📤 Datos que se enviarán al backend:', userData);

    this.http.post<any>(`${this.apiUrl}/usuarios/google-login`, userData)
      .subscribe({
        next: (response) => {
          console.log('✅ Login con Google exitoso:', response);

          let imagenUrl = response.imagen;
          
          if (response.imagen && !response.imagen.startsWith('http')) {
            if (response.imagen.startsWith('/uploads')) {
              imagenUrl = `${this.baseUrl}${response.imagen}`;
            } else if (response.imagen.startsWith('uploads')) {
              imagenUrl = `${this.baseUrl}/${response.imagen}`;
            } else if (response.imagen.startsWith('assets/')) {
              imagenUrl = response.imagen;
            } else {
              imagenUrl = `${this.baseUrl}/uploads/perfiles/${response.imagen}`;
            }
          }

          const userDataFinal = {
            id: response.id_usuario,
            id_usuario: response.id_usuario,
            nombre: response.nombre,
            apellido: response.apellido || '',
            email: response.email,
            telefono: response.telefono || '',
            imagen: imagenUrl,
            rol: response.rol
          };

          console.log('💾 Guardando en localStorage:', userDataFinal);

          localStorage.setItem('user', JSON.stringify(userDataFinal));
          localStorage.setItem('email', response.email);
          localStorage.setItem('userId', response.id_usuario.toString());
          
          window.dispatchEvent(new Event('storage'));

          if (response.rol === 'admin') {
            console.log('🔐 Usuario ADMIN detectado, redirigiendo al panel admin...');
            this.mostrarAlerta(`¡Bienvenido Admin ${response.nombre}! 👑`, 'exito');
            setTimeout(() => {
              this.router.navigate(['/admin']);
            }, 1500);
          } else {
            console.log('👤 Usuario NORMAL detectado, redirigiendo a la tienda...');
            this.mostrarAlerta(`¡Hola ${response.nombre}! Bienvenido 🎉`, 'exito');
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          }
        },
        error: (error) => {
          console.error('❌ Error completo:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error detail:', error.error);
          this.mostrarAlerta('Error al iniciar sesión con Google', 'error');
        }
      });
  }

  parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  // ===========================
  // VALIDACIONES
  // ===========================
  validarNombre() {
    this.nombreInvalido = this.nombre.trim() === '';
  }

  validarApellido() {
    this.apellidoInvalido = this.apellido.trim() === '';
  }

  validarEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (this.email.trim() === '') {
      this.emailInvalido = true;
      this.emailValido = false;
      this.emailMensaje = 'El email es obligatorio';
    } else if (!emailRegex.test(this.email)) {
      this.emailInvalido = true;
      this.emailValido = false;
      this.emailMensaje = 'Formato de email inválido';
    } else {
      this.emailInvalido = false;
      this.emailValido = true;
      this.emailMensaje = '';
    }
  }

  validarContrasena() {
    if (this.isRegisterMode) {
      // Validación completa para registro
      this.requisitos.longitud = this.contrasena.length >= 8;
      this.requisitos.mayuscula = /[A-Z]/.test(this.contrasena);
      this.requisitos.minuscula = /[a-z]/.test(this.contrasena);
      this.requisitos.numero = /[0-9]/.test(this.contrasena);
      this.requisitos.especial = /[!@#$%^&*(),.?":{}|<>]/.test(this.contrasena);
      
      // Calcular fuerza
      let fuerza = 0;
      if (this.requisitos.longitud) fuerza += 20;
      if (this.requisitos.mayuscula) fuerza += 20;
      if (this.requisitos.minuscula) fuerza += 20;
      if (this.requisitos.numero) fuerza += 20;
      if (this.requisitos.especial) fuerza += 20;
      
      this.fuerzaContrasena = fuerza;
      
      // Determinar nivel
      if (fuerza <= 40) {
        this.nivelSeguridad = 'débil';
      } else if (fuerza <= 80) {
        this.nivelSeguridad = 'media';
      } else {
        this.nivelSeguridad = 'fuerte';
      }
      
      // Validación general
      const todosRequisitos = Object.values(this.requisitos).every(r => r);
      this.contrasenaInvalida = !todosRequisitos;
      this.contrasenaValida = todosRequisitos;
      
      // Revalidar confirmación si ya se ingresó
      if (this.confirmarContrasena) {
        this.validarConfirmarContrasena();
      }
    } else {
      // Validación simple para login
      this.contrasenaInvalida = this.contrasena.length < 6;
      this.contrasenaValida = this.contrasena.length >= 6;
    }
  }

  validarConfirmarContrasena() {
    if (this.confirmarContrasena === '') {
      this.confirmarContrasenaInvalida = false;
      this.confirmarContrasenaValida = false;
    } else if (this.contrasena !== this.confirmarContrasena) {
      this.confirmarContrasenaInvalida = true;
      this.confirmarContrasenaValida = false;
    } else {
      this.confirmarContrasenaInvalida = false;
      this.confirmarContrasenaValida = true;
    }
  }

  formularioValido(): boolean {
    if (this.isRegisterMode) {
      return (
        this.nombre.trim() !== '' &&
        this.apellido.trim() !== '' &&
        this.emailValido &&
        this.contrasenaValida &&
        this.confirmarContrasenaValida &&
        !this.cargando
      );
    } else {
      return (
        this.emailValido &&
        this.contrasena.length >= 6 &&
        !this.cargando
      );
    }
  }

  // ===========================
  // TOGGLE PASSWORD VISIBILITY
  // ===========================
  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarConfirmarContrasena() {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  // ===========================
  // CAMBIAR MODO
  // ===========================
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.limpiarCampos();
  }

  switchToLogin() {
    this.isRegisterMode = false;
    this.limpiarCampos();
  }

  switchToRegister() {
    this.isRegisterMode = true;
    this.limpiarCampos();
  }

  limpiarCampos() {
    this.nombre = '';
    this.apellido = '';
    this.email = '';
    this.contrasena = '';
    this.confirmarContrasena = '';
    this.recordarme = false;
    
    // Reset validaciones
    this.nombreInvalido = false;
    this.apellidoInvalido = false;
    this.emailInvalido = false;
    this.emailValido = false;
    this.contrasenaInvalida = false;
    this.contrasenaValida = false;
    this.confirmarContrasenaInvalida = false;
    this.confirmarContrasenaValida = false;
    
    // Reset seguridad
    this.fuerzaContrasena = 0;
    this.nivelSeguridad = 'débil';
    this.requisitos = {
      longitud: false,
      mayuscula: false,
      minuscula: false,
      numero: false,
      especial: false
    };
  }

  // ===========================
  // ALERTA
  // ===========================
  mostrarAlerta(mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.alertaVisible = true;
    setTimeout(() => this.alertaVisible = false, 3000);
  }

  cerrarAlerta() {
    this.alertaVisible = false;
  }

  // ===========================
  // SUBMIT
  // ===========================
  onSubmit() {
    if (!this.formularioValido()) {
      this.mostrarAlerta('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    if (this.isRegisterMode) {
      this.register();
    } else {
      this.login();
    }
  }

  // ===========================
  // REGISTRO
  // ===========================
  register() {
    this.cargando = true;

    const user = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.contrasena
    };

    this.http.post(`${this.apiUrl}/usuarios/register`, user).subscribe({
      next: (res) => {
        console.log('Usuario registrado:', res);
        this.cargando = false;
        this.mostrarAlerta('¡Registro exitoso! Revisa tu email para verificar tu cuenta 📧', 'exito');
        setTimeout(() => {
          this.switchToLogin();
        }, 2000);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.cargando = false;
        const mensaje = err.error?.detail || 'Error al registrarte. Intenta de nuevo';
        this.mostrarAlerta(mensaje, 'error');
      }
    });
  }

  // ===========================
  // LOGIN
  // ===========================
  login() {
    this.cargando = true;

    const credentials = {
      email: this.email,
      password: this.contrasena
    };

    console.log('🔐 Intentando login con:', credentials.email);

    this.http.post<any>(`${this.apiUrl}/usuarios/login`, credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        console.log('✅ Rol del usuario:', response.rol);

        let imagenUrl = 'assets/img/profile.jpeg';
        
        if (response.imagen && response.imagen.trim() !== '') {
          if (response.imagen.startsWith('/uploads')) {
            imagenUrl = `${this.baseUrl}${response.imagen}`;
          } else if (response.imagen.startsWith('uploads')) {
            imagenUrl = `${this.baseUrl}/${response.imagen}`;
          } else if (response.imagen.startsWith('http')) {
            imagenUrl = response.imagen;
          } else if (response.imagen.startsWith('assets/')) {
            imagenUrl = response.imagen;
          } else if (!response.imagen.includes('/')) {
            imagenUrl = `${this.baseUrl}/uploads/perfiles/${response.imagen}`;
          } else {
            imagenUrl = `${this.baseUrl}${response.imagen}`;
          }
        }

        const userData = {
          id: response.id_usuario,
          id_usuario: response.id_usuario,
          nombre: response.nombre,
          apellido: response.apellido || '',
          email: response.email,
          telefono: response.telefono || '',
          imagen: imagenUrl,
          rol: response.rol
        };

        console.log('💾 Guardando en localStorage:', userData);

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('email', response.email);
        localStorage.setItem('userId', response.id_usuario.toString());
        
        window.dispatchEvent(new Event('storage'));

        this.cargando = false;

        if (response.rol === 'admin') {
          console.log('🔐 Usuario ADMIN detectado, redirigiendo al panel admin...');
          this.mostrarAlerta(`¡Bienvenido Admin ${response.nombre}! 👑`, 'exito');
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1500);
        } else {
          console.log('👤 Usuario NORMAL detectado, redirigiendo a la tienda...');
          this.mostrarAlerta(`¡Hola ${response.nombre}! Bienvenido 🎉`, 'exito');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        }
      },
      error: (err) => {
        console.error('❌ Error al iniciar sesión:', err);
        this.cargando = false;
        const mensaje = err.error?.detail || 'Credenciales incorrectas. Verifica tu email y contraseña';
        this.mostrarAlerta(mensaje, 'error');
      }
    });
  }
}