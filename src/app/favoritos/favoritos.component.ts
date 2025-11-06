import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  subcategoria: string;
  disponible: boolean;
  cantidad_disponible: number;
  marca: string | null;
  calificacion: number;
  reviews: number;
  descuento: number;
  precio_anterior: number | null;
  vendedor_nombre: string;
  id_vendedor: number;
}

interface Favorito {
  id_favorito: number;
  id_usuario: number;
  id_producto: number;
  fecha_agregado: string;
  producto: Producto;
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit, OnDestroy {

  // ===== API =====
  private apiUrl = 'http://localhost:8000/api';

  // ===== DATOS =====
  favoritos: Favorito[] = [];
  favoritosFiltrados: Favorito[] = [];
  contadorFavoritos: number = 0;
  contadorCarrito: number = 0;

  // ===== ESTADO =====
  cargando: boolean = false;
  filtroActivo: string = 'todos';
  busqueda: string = '';
  mostrarModalConfirmacion: boolean = false;

  // ===== USUARIO =====
  userId: number = 0;
  userName: string = '';
  userImage: string = 'assets/img/user-icon.png';
  userMenuOpen: boolean = false;
  isLoggedIn: boolean = false;

  private storageListener = (event: StorageEvent) => {
    if (event.key === 'user' || event.key === null) {
      this.verificarUsuario();
    }
  };

  private favoritosListener = () => {
    this.cargarFavoritos();
  };

  private carritoListener = () => {
    this.cargarContadorCarrito();
  };

  constructor(private router: Router, private http: HttpClient) {
    console.log('🔧 Constructor de FavoritosComponent ejecutado');
  }

  ngOnInit() {
    console.log('🚀 ngOnInit ejecutado');
    this.verificarUsuario();
    
    if (this.userId) {
      console.log('👤 Usuario ID:', this.userId);
      this.cargarFavoritos();
      this.cargarContadorCarrito();
    } else {
      console.warn('⚠️ No hay usuario logueado');
    }

    window.addEventListener('storage', this.storageListener);
    window.addEventListener('favoritosActualizado', this.favoritosListener as EventListener);
    window.addEventListener('carritoActualizado', this.carritoListener as EventListener);
  }

  ngOnDestroy() {
    console.log('🔚 ngOnDestroy ejecutado');
    window.removeEventListener('storage', this.storageListener);
    window.removeEventListener('favoritosActualizado', this.favoritosListener as EventListener);
    window.removeEventListener('carritoActualizado', this.carritoListener as EventListener);
  }

  // ===== VERIFICAR USUARIO =====
  verificarUsuario() {
    console.log('🔍 Verificando usuario...');
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      console.warn('❌ No hay datos de usuario, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      this.userId = parsed.id;
      this.isLoggedIn = true;
      this.userName = parsed.nombre || parsed.firstName || parsed.username || 'Usuario';
      this.userImage = parsed.imagen && parsed.imagen.trim() !== '' 
        ? parsed.imagen 
        : 'assets/img/profile.jpeg';
      
      console.log('✅ Usuario verificado:', {
        userId: this.userId,
        userName: this.userName,
        isLoggedIn: this.isLoggedIn
      });
    } catch (error) {
      console.error('❌ Error al parsear usuario:', error);
      this.router.navigate(['/login']);
    }
  }

  // ===== CARGAR FAVORITOS =====
  cargarFavoritos() {
    if (!this.userId) {
      console.warn('⚠️ No se puede cargar favoritos sin userId');
      return;
    }

    console.log('📥 Cargando favoritos para usuario:', this.userId);
    this.cargando = true;
    
    const url = `${this.apiUrl}/favoritos?id_usuario=${this.userId}`;
    console.log('🔗 URL:', url);

    this.http.get<Favorito[]>(url).subscribe({
      next: (data) => {
        console.log('✅ Favoritos recibidos:', data);
        console.log('📊 Cantidad:', data.length);
        
        this.favoritos = data.map(fav => ({
          ...fav,
          producto: {
            ...fav.producto,
            imagen: this.construirUrlImagen(fav.producto.imagen)
          }
        }));
        
        this.contadorFavoritos = this.favoritos.length;
        this.aplicarFiltro();
        this.cargando = false;
        
        console.log('✅ Favoritos procesados:', this.favoritos);
      },
      error: (error) => {
        console.error('❌ Error al cargar favoritos:', error);
        console.error('📝 Status:', error.status);
        console.error('📝 Message:', error.message);
        console.error('📝 Error completo:', error);
        
        this.favoritos = [];
        this.contadorFavoritos = 0;
        this.cargando = false;
      }
    });
  }

  // ===== CONSTRUIR URL DE IMAGEN =====
  construirUrlImagen(imagen: string | null): string {
    if (!imagen) return 'assets/img/producto-default.jpg';
    if (imagen.startsWith('http')) return imagen;
    if (imagen.startsWith('assets/')) return imagen;
    if (imagen.startsWith('data:image')) return imagen;
    if (imagen.startsWith('/uploads/')) return `http://localhost:8000${imagen}`;
    return 'assets/img/producto-default.jpg';
  }

  // ===== CARGAR CONTADOR DEL CARRITO =====
  cargarContadorCarrito() {
    if (!this.userId) return;
    
    this.http.get<any>(`${this.apiUrl}/carrito/count?id_usuario=${this.userId}`).subscribe({
      next: (data) => {
        this.contadorCarrito = data.total_productos || 0;
        console.log('🛒 Contador carrito:', this.contadorCarrito);
      },
      error: (error) => {
        console.error('Error al cargar contador del carrito:', error);
        this.contadorCarrito = 0;
      }
    });
  }

  // ===== CAMBIAR FILTRO =====
  cambiarFiltro(filtro: string) {
    console.log('🔄 Cambiando filtro a:', filtro);
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  // ===== APLICAR FILTRO =====
  aplicarFiltro() {
    console.log('🔍 Aplicando filtro:', this.filtroActivo);
    
    switch (this.filtroActivo) {
      case 'todos':
        this.favoritosFiltrados = [...this.favoritos];
        break;

      case 'disponibles':
        this.favoritosFiltrados = this.favoritos.filter(
          fav => fav.producto.disponible && fav.producto.cantidad_disponible > 0
        );
        break;

      case 'rebajados':
        this.favoritosFiltrados = this.favoritos.filter(
          fav => fav.producto.descuento > 0 || 
                 (fav.producto.precio_anterior && fav.producto.precio_anterior > fav.producto.precio)
        );
        break;

      case 'recientes':
        this.favoritosFiltrados = [...this.favoritos].sort((a, b) => {
          return new Date(b.fecha_agregado).getTime() - new Date(a.fecha_agregado).getTime();
        });
        break;

      default:
        this.favoritosFiltrados = [...this.favoritos];
    }
    
    console.log('✅ Productos filtrados:', this.favoritosFiltrados.length);
  }

  // ===== ELIMINAR FAVORITO =====
  eliminarFavorito(idFavorito: number, event: Event) {
    event.stopPropagation();

    if (!confirm('¿Eliminar este producto de tus favoritos?')) return;

    console.log('🗑️ Eliminando favorito:', idFavorito);

    this.http.delete(`${this.apiUrl}/favoritos/${idFavorito}`).subscribe({
      next: () => {
        console.log('✅ Favorito eliminado');
        this.favoritos = this.favoritos.filter(fav => fav.id_favorito !== idFavorito);
        this.contadorFavoritos = this.favoritos.length;
        this.aplicarFiltro();
        
        window.dispatchEvent(new Event('favoritosActualizado'));
      },
      error: (error) => {
        console.error('❌ Error al eliminar favorito:', error);
        alert('Error al eliminar el favorito. Intenta de nuevo.');
      }
    });
  }

  // ===== CONFIRMAR ELIMINAR TODOS =====
  confirmarEliminarTodos() {
    this.mostrarModalConfirmacion = true;
  }

  // ===== ELIMINAR TODOS LOS FAVORITOS =====
  eliminarTodosFavoritos() {
    console.log('🗑️ Eliminando todos los favoritos del usuario:', this.userId);
    
    this.http.delete(`${this.apiUrl}/favoritos/usuario/${this.userId}`).subscribe({
      next: () => {
        console.log('✅ Todos los favoritos eliminados');
        this.favoritos = [];
        this.favoritosFiltrados = [];
        this.contadorFavoritos = 0;
        this.cerrarModal();
        
        window.dispatchEvent(new Event('favoritosActualizado'));
      },
      error: (error) => {
        console.error('❌ Error al eliminar favoritos:', error);
        alert('Error al eliminar los favoritos. Intenta de nuevo.');
        this.cerrarModal();
      }
    });
  }

  // ===== AGREGAR AL CARRITO =====
  agregarAlCarrito(producto: Producto, event: Event) {
    event.stopPropagation();

    if (!this.userId) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      this.router.navigate(['/login']);
      return;
    }

    const item = {
      id_usuario: this.userId,
      id_producto: producto.id_producto,
      cantidad: 1
    };

    console.log('🛒 Agregando al carrito:', item);

    this.http.post(`${this.apiUrl}/carrito`, item).subscribe({
      next: () => {
        console.log('✅ Producto agregado al carrito');
        alert(`${producto.nombre} agregado al carrito`);
        
        this.cargarContadorCarrito();
        window.dispatchEvent(new Event('carritoActualizado'));
      },
      error: (error) => {
        console.error('❌ Error al agregar al carrito:', error);
        if (error.status === 400) {
          alert('Este producto ya está en tu carrito');
        } else {
          alert('Error al agregar al carrito. Intenta de nuevo.');
        }
      }
    });
  }

  // ===== BÚSQUEDA =====
  buscarProducto() {
    if (this.busqueda.trim() === '') return;
    this.router.navigate(['/'], { queryParams: { q: this.busqueda } });
  }

  // ===== NAVEGACIÓN =====
  verDetalleProducto(idProducto: number) {
    console.log('🔗 Navegando a producto:', idProducto);
    this.router.navigate(['/producto', idProducto]);
  }

  irInicio() {
    this.router.navigate(['/']);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  irPerfil() {
    this.userMenuOpen = false;
    this.router.navigate(['/perfil']);
  }

  irVender() {
    this.userMenuOpen = false;
    this.router.navigate(['/vender']);
  }

  irConfiguracion() {
    this.userMenuOpen = false;
    this.router.navigate(['/configuracion']);
  }

  // ===== MODAL =====
  cerrarModal() {
    this.mostrarModalConfirmacion = false;
  }

  // ===== MENÚ USUARIO =====
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideUserInfo = target.closest('.user-info');
    
    if (!clickedInsideUserInfo && this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  // ===== LOGOUT =====
  logout() {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    this.router.navigate(['/login']);
  }
}