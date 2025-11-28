import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  success: boolean = false;
  error: string = '';
  tokenValido: boolean = false;
  verificandoToken: boolean = true;

  private apiUrl = environment.apiUrl + '/api'; // ✅ Con /api

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    if (!this.token) {
      this.error = 'Token no válido';
      this.verificandoToken = false;
      return;
    }

    this.verificarToken();
  }

  verificarToken() {
    console.log('🔍 Verificando token...');
    this.http.get(`${this.apiUrl}/usuarios/verificar-token-reset/${this.token}`)
      .subscribe({
        next: (response: any) => {
          this.tokenValido = response.valido;
          this.verificandoToken = false;
          if (!this.tokenValido) {
            this.error = 'El enlace ha expirado o no es válido';
          }
          console.log('✅ Token válido:', response.valido);
        },
        error: (error) => {
          this.verificandoToken = false;
          this.tokenValido = false;
          this.error = 'Error al verificar el token';
          console.error('❌ Error:', error);
        }
      });
  }

  onSubmit() {
    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('🔐 Enviando nueva contraseña...');

    this.http.post(`${this.apiUrl}/usuarios/reset-password`, {
      token: this.token,
      nueva_contrasena: this.password
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        console.log('✅ Contraseña actualizada');
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.detail || 'Error al actualizar contraseña';
        console.error('❌ Error:', error);
      }
    });
  }
}