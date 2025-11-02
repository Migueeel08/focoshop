import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api';

  user: any = {
    id: null,
    nombre: 'Usuario',
    email: '',
    imagen: 'assets/img/profile.jpeg',
  };

  productosVendiendo: any[] = [];
  productosVendidos: any[] = [];
  compras: any[] = [];

  tabSeleccionado: 'vendiendo' | 'vendidos' | 'compras' = 'vendiendo';
  cargando = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarUsuario();
    this.cargarProductosDelUsuario();
    
    // ✅ Escuchar cambios en localStorage
    window.addEventListener('storage', () => {
      this.cargarUsuario();
      this.cargarProductosDelUsuario();
    });
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.user.id = parsed.id;
        this.user.nombre =
          parsed.nombre ||
          parsed.firstName ||
          parsed.username ||
          (parsed.email ? parsed.email.split('@')[0] : 'Usuario');
        this.user.email = parsed.email || '';
        this.user.imagen = this.obtenerUrlImagen(parsed.imagen);
        
        console.log('Usuario cargado en perfil:', this.user);
      } catch (e) {
        console.error('Error cargando usuario:', e);
      }
    }
  }

  cargarProductosDelUsuario() {
    if (!this.user.id) {
      console.warn('No hay ID de usuario disponible');
      return;
    }

    this.cargando = true;

    // Cargar productos en venta
    this.http.get<any[]>(`${this.apiUrl}/productos/usuario/${this.user.id}/vendiendo`)
      .subscribe({
        next: (productos) => {
          this.productosVendiendo = productos.map(p => this.normalizarProducto(p));
          console.log('Productos en venta:', this.productosVendiendo);
        },
        error: (error) => {
          console.error('Error cargando productos en venta:', error);
          this.productosVendiendo = [];
        }
      });

    // Cargar productos vendidos
    this.http.get<any[]>(`${this.apiUrl}/productos/usuario/${this.user.id}/vendidos`)
      .subscribe({
        next: (productos) => {
          this.productosVendidos = productos.map(p => this.normalizarProducto(p));
          console.log('Productos vendidos:', this.productosVendidos);
        },
        error: (error) => {
          console.error('Error cargando productos vendidos:', error);
          this.productosVendidos = [];
        }
      });

    // Cargar compras
    this.http.get<any[]>(`${this.apiUrl}/productos/usuario/${this.user.id}/compras`)
      .subscribe({
        next: (productos) => {
          this.compras = productos.map(p => this.normalizarProducto(p));
          console.log('Compras:', this.compras);
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando compras:', error);
          this.compras = [];
          this.cargando = false;
        }
      });
  }

  normalizarProducto(producto: any): any {
    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: this.obtenerUrlImagenProducto(producto.imagen),
      categoria: producto.categoria,
      vendedor: producto.vendedor || producto.usuario?.nombre,
      estado: producto.estado,
      fecha_venta: producto.fecha_venta
    };
  }

  obtenerUrlImagenProducto(imagenPath: string | null | undefined): string {
    const apiUrl = 'http://localhost:8000';
    const defaultImage = 'assets/img/producto-default.jpg';
    
    if (!imagenPath || imagenPath.trim() === '') {
      return defaultImage;
    }
    
    if (imagenPath.startsWith('http://') || imagenPath.startsWith('https://')) {
      return imagenPath;
    }
    
    if (imagenPath.startsWith('assets/')) {
      return imagenPath;
    }
    
    if (imagenPath.startsWith('/uploads')) {
      return `${apiUrl}${imagenPath}`;
    }
    
    if (imagenPath.startsWith('data:image')) {
      return imagenPath;
    }
    
    return defaultImage;
  }

  obtenerUrlImagen(imagenPath: string | null | undefined): string {
    const apiUrl = 'http://localhost:8000';
    const defaultImage = 'assets/img/profile.jpeg';
    
    if (!imagenPath || imagenPath.trim() === '') {
      return defaultImage;
    }
    
    if (imagenPath.startsWith('http://') || imagenPath.startsWith('https://')) {
      return imagenPath;
    }
    
    if (imagenPath.startsWith('assets/')) {
      return imagenPath;
    }
    
    if (imagenPath.startsWith('/uploads')) {
      return `${apiUrl}${imagenPath}`;
    }
    
    if (imagenPath.startsWith('data:image')) {
      return imagenPath;
    }
    
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

  verDetalleProducto(producto: any) {
    this.router.navigate(['/producto', producto.id]);
  }
}