import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8000';
  
  private usuarioSubject = new BehaviorSubject<any>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage();
  }

  get usuarioActual() {
    return this.usuarioSubject.value;
  }

  private cargarUsuarioDesdeStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      this.usuarioSubject.next(userData);
    }
  }

  setUsuarioActual(usuario: any) {
    this.usuarioSubject.next(usuario);
    localStorage.setItem('user', JSON.stringify(usuario));
  }

  actualizarUsuario(userId: number, datosUsuario: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(
      `${this.apiUrl}/usuarios/${userId}`,
      datosUsuario,
      { headers }
    ).pipe(
      tap((usuarioActualizado: any) => {
        const currentUser = this.usuarioActual || {};
        const updatedUser = { ...currentUser, ...usuarioActualizado };
        this.setUsuarioActual(updatedUser);
      })
    );
  }

  subirFotoPerfil(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/usuarios/${userId}/foto`,
      formData,
      { headers }
    );
  }

  obtenerUsuarioPorEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/email/${email}`);
  }

  obtenerUsuarioPorId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${userId}`);
  }

  // 🗑️ MÉTODO PARA ELIMINAR USUARIO
  eliminarUsuario(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(
      `${this.apiUrl}/usuarios/${userId}`,
      { headers }
    );
  }

  // 📍 MÉTODO PARA AGREGAR DIRECCIÓN
  agregarDireccion(userId: number, direccion: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Agregar el id_usuario al objeto de dirección
    const direccionConUsuario = {
      ...direccion,
      id_usuario: userId
    };

    return this.http.post(
      `${this.apiUrl}/api/direcciones`,
      direccionConUsuario,
      { headers }
    );
  }

  // 📍 MÉTODO PARA OBTENER DIRECCIONES
  obtenerDirecciones(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/usuarios/${userId}/direcciones`,
      { headers }
    );
  }

  // 📍 MÉTODO PARA ELIMINAR DIRECCIÓN
  eliminarDireccion(userId: number, direccionId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(
      `${this.apiUrl}/usuarios/${userId}/direcciones/${direccionId}`,
      { headers }
    );
  }
}