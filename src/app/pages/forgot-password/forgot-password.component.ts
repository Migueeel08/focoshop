import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  loading: boolean = false;
  success: boolean = false;
  error: string = '';

  private apiUrl = environment.apiUrl + '/api'; // ✅ CORREGIDO: Agregado /api

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.email) {
      this.error = 'Por favor ingresa tu email';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    console.log('📧 Enviando solicitud a:', `${this.apiUrl}/usuarios/solicitar-reset-password`);
    console.log('📧 Email:', this.email);

    this.http.post(`${this.apiUrl}/usuarios/solicitar-reset-password`, { email: this.email })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = true;
          console.log('✅ Email de recuperación enviado:', response);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.detail || 'Error al enviar email';
          console.error('❌ Error completo:', error);
        }
      });
  }
}