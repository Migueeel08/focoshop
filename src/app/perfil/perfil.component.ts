import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  user: any = {
    nombre: 'Usuario',
    email: '',
    imagen: 'assets/img/profile.jpeg',
  };

  productosVendiendo: any[] = [];
  productosVendidos: any[] = [];
  compras: any[] = [];

  tabSeleccionado: 'vendiendo' | 'vendidos' | 'compras' = 'vendiendo';

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarUsuario();
    
    // ✅ Escuchar cambios en localStorage
    window.addEventListener('storage', () => {
      this.cargarUsuario();
    });
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.user.nombre =
          parsed.nombre ||
          parsed.firstName ||
          parsed.username ||
          (parsed.email ? parsed.email.split('@')[0] : 'Usuario');
        this.user.email = parsed.email || '';
        
        // ✅ Manejar la imagen correctamente
        this.user.imagen = this.obtenerUrlImagen(parsed.imagen);
        
        console.log('Usuario cargado en perfil:', this.user);
      } catch (e) {
        console.error('Error cargando usuario:', e);
      }
    }
  }

  // ✅ Función auxiliar para obtener la URL completa de la imagen
  obtenerUrlImagen(imagenPath: string | null | undefined): string {
    const apiUrl = 'http://localhost:8000';
    const defaultImage = 'assets/img/profile.jpeg';
    
    if (!imagenPath || imagenPath.trim() === '') {
      return defaultImage;
    }
    
    // Si ya es una URL completa
    if (imagenPath.startsWith('http://') || imagenPath.startsWith('https://')) {
      return imagenPath;
    }
    
    // Si es una imagen de assets
    if (imagenPath.startsWith('assets/')) {
      return imagenPath;
    }
    
    // Si empieza con /uploads, construir URL completa
    if (imagenPath.startsWith('/uploads')) {
      return `${apiUrl}${imagenPath}`;
    }
    
    // Si es data:image (base64)
    if (imagenPath.startsWith('data:image')) {
      return imagenPath;
    }
    
    // Por defecto, retornar imagen por defecto
    return defaultImage;
  }

  editarPerfil() {
    this.router.navigate(['/perfil/editar']);
  }

  volverInicio() {
    this.router.navigate(['/']);
  }

  seleccionarTab(tab: 'vendiendo' | 'vendidos' | 'compras') {
    this.tabSeleccionado = tab;
  }

  obtenerProductosActivos() {
    switch (this.tabSeleccionado) {
      case 'vendiendo': return this.productosVendiendo;
      case 'vendidos': return this.productosVendidos;
      case 'compras': return this.compras;
      default: return [];
    }
  }
}