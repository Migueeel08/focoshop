import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8000/usuarios'; // Cambia según tu backend

  constructor(private http: HttpClient) {}

  obtenerUsuarioPorEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`);
  }

  // 🔹 Método para actualizar usuario completo
  actualizarUsuario(usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${usuario.id_usuario}`, usuario);
  }

  // 🔹 Método opcional para subir imagen de perfil (si tu backend soporta multipart/form-data)
  subirFotoPerfil(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', file);

    return this.http.post<any>(`${this.apiUrl}/${id}/foto`, formData);
  }
}
