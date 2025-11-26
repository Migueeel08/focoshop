import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CriterioTOPSIS {
  peso: number;
  tipo: 'beneficio' | 'costo';
}

export interface ProductoTOPSIS {
  id_producto: number;
  nombre: string;
  precio: number;
  calificacion: number;
  reviews: number;
  stock: number;
  condicion: string;
  marca?: string;
  imagen?: string;
  vendedor_nombre?: string;
  ventas_vendedor: number;
  criterios_valores: { [key: string]: number };
  criterios_normalizados: { [key: string]: number };
  score_topsis: number;
  ranking: number;
  distancia_ideal_positiva: number;
  distancia_ideal_negativa: number;
}

export interface SolucionIdeal {
  valores: { [key: string]: number };
}

export interface ResultadoTOPSIS {
  productos: ProductoTOPSIS[];
  ideal_positivo: SolucionIdeal;
  ideal_negativo: SolucionIdeal;
  criterios_utilizados: { [key: string]: CriterioTOPSIS };
  producto_ganador: ProductoTOPSIS;
  mensaje: string;
}

export interface RequestComparacion {
  productos_ids: number[];
  criterios?: { [key: string]: CriterioTOPSIS };
}

@Injectable({
  providedIn: 'root'
})
export class TopsisService {
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  compararProductos(
    productosIds: number[],
    criterios?: { [key: string]: CriterioTOPSIS }
  ): Observable<ResultadoTOPSIS> {
    const body: RequestComparacion = {
      productos_ids: productosIds,
      criterios: criterios
    };

    return this.http.post<ResultadoTOPSIS>(`${this.apiUrl}/topsis/comparar`, body);
  }

  obtenerCriteriosDefault(): Observable<{ [key: string]: CriterioTOPSIS }> {
    return this.http.get<{ [key: string]: CriterioTOPSIS }>(`${this.apiUrl}/topsis/criterios-default`);
  }
}
