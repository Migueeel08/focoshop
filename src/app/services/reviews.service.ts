import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id_review?: number;
  id_producto: number;
  id_usuario: number;
  id_pedido?: number;
  calificacion: number;
  comentario?: string;
  fecha_review?: Date;
  verificado?: boolean;
  util_count?: number;
  usuario_nombre?: string;
  usuario_apellido?: string;
  usuario_imagen?: string;
}

export interface ProductoCalificacion {
  id_producto: number;
  calificacion_promedio: number;
  total_reviews: number;
  distribucion: { [key: number]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva review
   */
  crearReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, review);
  }

  /**
   * Obtener reviews de un producto
   */
  obtenerReviewsProducto(
    idProducto: number,
    orden: 'recientes' | 'antiguos' | 'mejores' | 'peores' = 'recientes',
    skip: number = 0,
    limit: number = 50
  ): Observable<Review[]> {
    const params = new HttpParams()
      .set('orden', orden)
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<Review[]>(
      `${this.apiUrl}/reviews/producto/${idProducto}`,
      { params }
    );
  }

  /**
   * Obtener estadísticas de calificación de un producto
   */
  obtenerEstadisticasProducto(idProducto: number): Observable<ProductoCalificacion> {
    return this.http.get<ProductoCalificacion>(
      `${this.apiUrl}/reviews/producto/${idProducto}/estadisticas`
    );
  }

  /**
   * Obtener reviews de un usuario
   */
  obtenerReviewsUsuario(
    idUsuario: number,
    skip: number = 0,
    limit: number = 50
  ): Observable<Review[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<Review[]>(
      `${this.apiUrl}/reviews/usuario/${idUsuario}`,
      { params }
    );
  }

  /**
   * Actualizar una review
   */
  actualizarReview(idReview: number, data: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${idReview}`, data);
  }

  /**
   * Eliminar una review
   */
  eliminarReview(idReview: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${idReview}`);
  }

  /**
   * Marcar review como útil
   */
  marcarReviewUtil(idReview: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews/${idReview}/util`, {});
  }
}