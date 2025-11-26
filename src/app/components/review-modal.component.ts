import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Review {
  id_review?: number;
  id_producto: number;
  id_usuario: number;
  id_pedido?: number | null;
  calificacion: number;
  comentario?: string;
}

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.css']
})
export class ReviewModalComponent {
  private apiUrl = 'https://focoshop-backend-production.up.railway.app/api';

  @Input() visible: boolean = false;
  @Input() idProducto!: number;
  @Input() idUsuario!: number;
  @Input() idPedido: number | null = null;
  @Input() nombreProducto: string = '';
  @Input() imagenProducto: string = '';
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() reviewCreada = new EventEmitter<Review>();

  calificacion: number = 0;
  comentario: string = '';
  hoverCalificacion: number = 0;
  enviando: boolean = false;
  error: string = '';

  // Array de estrellas para el template
  estrellas: number[] = [1, 2, 3, 4, 5];

  constructor(private http: HttpClient) {}

  // Establece la calificación al hacer clic
  setCalificacion(estrellas: number): void {
    this.calificacion = estrellas;
  }

  // Muestra preview al pasar el mouse
  setHoverCalificacion(estrellas: number): void {
    this.hoverCalificacion = estrellas;
  }

  // Resetea el hover
  resetHoverCalificacion(): void {
    this.hoverCalificacion = 0;
  }

  // Obtiene el número de estrellas a mostrar
  getEstrellasMostrar(): number {
    return this.hoverCalificacion || this.calificacion;
  }

  // Obtiene el texto de la calificación
  getTextoCalificacion(): string {
    const textos: { [key: number]: string } = {
      1: '😞 Muy malo',
      2: '😕 Malo',
      3: '😐 Regular',
      4: '😊 Bueno',
      5: '🤩 ¡Excelente!'
    };
    return textos[this.calificacion] || '';
  }

  // Valida el formulario
  validarFormulario(): boolean {
    this.error = '';

    if (this.calificacion === 0) {
      this.error = 'Por favor selecciona una calificación';
      return false;
    }

    if (this.comentario && this.comentario.trim().length > 0 && this.comentario.trim().length < 10) {
      this.error = 'El comentario debe tener al menos 10 caracteres';
      return false;
    }

    return true;
  }

  // Envía la review
  enviarReview(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.enviando = true;
    this.error = '';

    const reviewData: Review = {
      id_producto: this.idProducto,
      id_usuario: this.idUsuario,
      id_pedido: this.idPedido,
      calificacion: this.calificacion,
      comentario: this.comentario.trim() || undefined
    };

    console.log('📤 Enviando review:', reviewData);

    this.http.post<Review>(`${this.apiUrl}/reviews`, reviewData).subscribe({
      next: (review) => {
        console.log('✅ Review creada:', review);
        this.reviewCreada.emit(review);
        this.resetFormulario();
      },
      error: (err) => {
        console.error('❌ Error al crear review:', err);
        this.error = err.error?.detail || 'Error al enviar la calificación. Intenta de nuevo.';
        this.enviando = false;
      }
    });
  }

  // Cierra el modal
  cerrarModal(): void {
    this.resetFormulario();
    this.cerrar.emit();
  }

  // Omite la calificación
  omitirCalificacion(): void {
    this.cerrarModal();
  }

  // Resetea el formulario
  private resetFormulario(): void {
    this.calificacion = 0;
    this.comentario = '';
    this.hoverCalificacion = 0;
    this.error = '';
    this.enviando = false;
  }
}