import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Interfaces locales
interface ItemCarrito {
  id_carrito: number;
  id_usuario: number;
  id_producto: number;
  cantidad: number;
  color?: string | null;
  talla?: string | null;
  precio_unitario: number;
  fecha_agregado: string;
  fecha_actualizado: string;
  producto_nombre: string;
  producto_imagen: string | null;
  producto_disponible: boolean;
  producto_cantidad_disponible: number;
  subtotal: number;
}

interface CarritoResumen {
  id_usuario: number;
  total_items: number;
  total_productos: number;
  subtotal: number;
  items: ItemCarrito[];
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  
  private apiUrl = 'http://localhost:8000/api/carrito';
  
  // ===== DATOS DEL CARRITO =====
  carrito: CarritoResumen | null = null;
  cargando: boolean = true;
  
  // ===== USUARIO =====
  isLoggedIn: boolean = false;
  userId: number = 0;
  userName: string = '';
  userImage: string = 'assets/img/user-icon.png';
  userMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
    if (this.isLoggedIn) {
      this.cargarCarrito();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ===== CARGAR USUARIO =====
  cargarUsuario(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.isLoggedIn = true;
        this.userId = parsed.id;

        this.userName =
          parsed.nombre ||
          parsed.firstName ||
          parsed.username ||
          (parsed.email ? parsed.email.split('@')[0] : 'Usuario');

        this.userImage =
          parsed.imagen && parsed.imagen.trim() !== ''
            ? parsed.imagen
            : 'assets/img/profile.jpeg';
      } catch (error: unknown) {
        console.error('Error al cargar usuario:', error);
        this.logout();
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  // ===== CARGAR CARRITO =====
  cargarCarrito(): void {
    this.cargando = true;
    this.http.get<CarritoResumen>(`${this.apiUrl}/usuario/${this.userId}`).subscribe({
      next: (carrito: CarritoResumen) => {
        this.carrito = carrito;
        this.cargando = false;
        console.log('✅ Carrito cargado:', carrito);
      },
      error: (error: unknown) => {
        console.error('❌ Error al cargar carrito:', error);
        this.cargando = false;
        this.carrito = null;
      }
    });
  }

  // ===== INCREMENTAR CANTIDAD =====
  incrementarCantidad(item: ItemCarrito): void {
    if (item.cantidad >= item.producto_cantidad_disponible) {
      alert(`Solo hay ${item.producto_cantidad_disponible} unidades disponibles`);
      return;
    }

    this.http.put(
      `${this.apiUrl}/${item.id_carrito}?id_usuario=${this.userId}`,
      { cantidad: item.cantidad + 1 }
    ).subscribe({
      next: () => {
        this.cargarCarrito();
      },
      error: (error: unknown) => {
        console.error('Error al actualizar cantidad:', error);
        alert('Error al actualizar cantidad');
      }
    });
  }

  // ===== DECREMENTAR CANTIDAD =====
  decrementarCantidad(item: ItemCarrito): void {
    if (item.cantidad <= 1) {
      return;
    }

    this.http.put(
      `${this.apiUrl}/${item.id_carrito}?id_usuario=${this.userId}`,
      { cantidad: item.cantidad - 1 }
    ).subscribe({
      next: () => {
        this.cargarCarrito();
      },
      error: (error: unknown) => {
        console.error('Error al actualizar cantidad:', error);
        alert('Error al actualizar cantidad');
      }
    });
  }

  // ===== ELIMINAR ITEM =====
  eliminarItem(item: ItemCarrito): void {
    if (!confirm(`¿Eliminar ${item.producto_nombre} del carrito?`)) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${item.id_carrito}?id_usuario=${this.userId}`).subscribe({
      next: () => {
        this.cargarCarrito();
        console.log('✅ Producto eliminado del carrito');
      },
      error: (error: unknown) => {
        console.error('Error al eliminar item:', error);
        alert('Error al eliminar producto');
      }
    });
  }

  // ===== VACIAR CARRITO =====
  vaciarCarrito(): void {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/usuario/${this.userId}`).subscribe({
      next: () => {
        this.cargarCarrito();
        console.log('✅ Carrito vaciado');
      },
      error: (error: unknown) => {
        console.error('Error al vaciar carrito:', error);
        alert('Error al vaciar carrito');
      }
    });
  }

  // ===== VERIFICAR DISPONIBILIDAD =====
  verificarDisponibilidad(): void {
    this.http.get(`${this.apiUrl}/verificar?id_usuario=${this.userId}`).subscribe({
      next: (verificacion: any) => {
        if (!verificacion.todos_disponibles) {
          if (verificacion.items_no_disponibles.length > 0) {
            alert('Algunos productos ya no están disponibles. Por favor, elimínalos del carrito.');
            return;
          }
          if (verificacion.items_sin_stock.length > 0) {
            alert('Algunos productos no tienen suficiente stock. Por favor, ajusta las cantidades.');
            return;
          }
        }
        // Navegar al checkout
        this.router.navigate(['/checkout']);
      },
      error: (error: unknown) => {
        console.error('Error al verificar disponibilidad:', error);
        alert('Error al verificar disponibilidad');
      }
    });
  }

  // ===== PROCEDER AL PAGO =====
  procederAlPago(): void {
    this.verificarDisponibilidad();
  }

  // ===== CONTINUAR COMPRANDO =====
  continuarComprando(): void {
    this.router.navigate(['/']);
  }

  // ===== CONSTRUIR URL IMAGEN =====
  construirUrlImagen(imagen: string | null): string {
    if (!imagen) return 'assets/img/producto-default.jpg';
    if (imagen.startsWith('http')) return imagen;
    if (imagen.startsWith('assets/')) return imagen;
    if (imagen.startsWith('data:image')) return imagen;
    if (imagen.startsWith('/uploads/')) return `http://localhost:8000${imagen}`;
    return 'assets/img/producto-default.jpg';
  }

  // ===== IR A PRODUCTO =====
  irAProducto(idProducto: number): void {
    this.router.navigate(['/producto', idProducto]);
  }

  // ===== NAVEGACIÓN =====
  volverInicio(): void {
    this.router.navigate(['/']);
  }

  // ===== USUARIO MENÚ =====
  logout(): void {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    this.isLoggedIn = false;
    this.userName = '';
    this.userImage = 'assets/img/profile.jpeg';
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  irPerfil(): void {
    this.userMenuOpen = false;
    this.router.navigate(['/perfil']);
  }

  irVender(): void {
    this.userMenuOpen = false;
    this.router.navigate(['/vender']);
  }

  irConfiguracion(): void {
    this.userMenuOpen = false;
    this.router.navigate(['/configuracion']);
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideUserInfo = target.closest('.user-info');
    
    if (!clickedInsideUserInfo && this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }
}