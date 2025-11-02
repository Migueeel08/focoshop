import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css'
})
export class DetalleProductoComponent implements OnInit {
  
  // ===== API =====
  private apiUrl = 'http://localhost:8000/api';

  // ===== PRODUCTO =====
  producto: any = null;
  cargando: boolean = true;
  productId: number = 0;

  // ===== SELECCIONES DEL USUARIO =====
  imagenSeleccionada: number = 0;
  colorSeleccionado: string = '';
  tallaSeleccionada: string = '';
  cantidadComprar: number = 1;
  esFavorito: boolean = false;

  // ===== USUARIO =====
  isLoggedIn: boolean = false;
  userName: string = '';
  userImage: string = 'assets/img/user-icon.png';
  userMenuOpen: boolean = false;

  // ===== BÚSQUEDA =====
  busqueda: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Obtener ID del producto de la URL
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.cargarProducto();
      }
    });

    this.cargarUsuario();
    this.verificarFavorito();
  }

  // ===== CARGAR PRODUCTO =====
  cargarProducto() {
    this.cargando = true;
    const url = `${this.apiUrl}/productos/${this.productId}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        console.log('✅ Producto cargado:', data);
        
        this.producto = {
          id_producto: data.id_producto,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          imagen: this.construirUrlImagen(data.imagen),
          categoria: data.categoria || '',
          subcategoria: data.subcategoria || '',
          disponible: data.disponible,
          cantidad_disponible: data.cantidad_disponible,
          vendedor: data.vendedor_nombre || 'Vendedor',
          vistas: data.vistas || 0,
          estado: data.estado,
          reviews: data.reviews || 0,
          marca: data.marca || null,
          calificacion: data.calificacion || 0,
          condicion: data.condicion || 'nuevo',
          precio_anterior: data.precio_anterior || null,
          descuento: data.descuento || null,
          color: data.color || null,
          talla: data.talla || null
        };

        // Inicializar selecciones
        this.colorSeleccionado = this.producto.color;
        this.tallaSeleccionada = this.producto.talla;

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.cargando = false;
        this.producto = null;
      }
    });
  }

  /**
   * Construir URL completa para las imágenes
   */
  construirUrlImagen(imagen: string | null): string {
    if (!imagen) {
      return 'assets/img/producto-default.jpg';
    }
    if (imagen.startsWith('http')) {
      return imagen;
    }
    if (imagen.startsWith('assets/')) {
      return imagen;
    }
    if (imagen.startsWith('data:image')) {
      return imagen;
    }
    if (imagen.startsWith('/uploads/')) {
      return `http://localhost:8000${imagen}`;
    }
    return 'assets/img/producto-default.jpg';
  }

  /**
   * Obtener color hexadecimal
   */
  getColorHex(colorNombre: string): string {
    const colores: any = {
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'rojo': '#FF0000',
      'azul': '#0000FF',
      'verde': '#00FF00',
      'amarillo': '#FFFF00',
      'rosa': '#FFC0CB',
      'gris': '#808080',
      'naranja': '#FFA500',
      'morado': '#800080',
    };
    return colores[colorNombre?.toLowerCase()] || '#667eea';
  }

  // ===== NAVEGACIÓN =====
  volverInicio() {
    this.router.navigate(['/']);
  }

  volverCategoria() {
    this.router.navigate(['/']);
  }

  buscarProductos() {
    if (this.busqueda.trim()) {
      this.router.navigate(['/'], { queryParams: { q: this.busqueda } });
    }
  }

  // ===== IMÁGENES =====
  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }

  // ===== FAVORITOS =====
  toggleFavorito() {
    this.esFavorito = !this.esFavorito;
    
    if (this.esFavorito) {
      this.agregarAFavoritos();
    } else {
      this.quitarDeFavoritos();
    }
  }

  verificarFavorito() {
    const favoritos = localStorage.getItem('favoritos');
    if (favoritos) {
      const listaFavoritos = JSON.parse(favoritos);
      this.esFavorito = listaFavoritos.includes(this.productId);
    }
  }

  agregarAFavoritos() {
    let favoritos = [];
    const favoritosStr = localStorage.getItem('favoritos');
    
    if (favoritosStr) {
      favoritos = JSON.parse(favoritosStr);
    }
    
    if (!favoritos.includes(this.productId)) {
      favoritos.push(this.productId);
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
      console.log('✅ Producto agregado a favoritos');
    }
  }

  quitarDeFavoritos() {
    const favoritosStr = localStorage.getItem('favoritos');
    
    if (favoritosStr) {
      let favoritos = JSON.parse(favoritosStr);
      favoritos = favoritos.filter((id: number) => id !== this.productId);
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
      console.log('❌ Producto quitado de favoritos');
    }
  }

  // ===== CANTIDAD =====
  incrementarCantidad() {
    if (this.cantidadComprar < this.producto.cantidad_disponible) {
      this.cantidadComprar++;
    }
  }

  decrementarCantidad() {
    if (this.cantidadComprar > 1) {
      this.cantidadComprar--;
    }
  }

  // ===== COMPRAR =====
  comprarAhora() {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para comprar');
      this.router.navigate(['/login']);
      return;
    }

    // Crear orden de compra directa
    const ordenCompra = {
      producto: this.producto,
      cantidad: this.cantidadComprar,
      color: this.colorSeleccionado,
      talla: this.tallaSeleccionada,
      total: this.producto.precio * this.cantidadComprar
    };

    // Guardar en sessionStorage para el checkout
    sessionStorage.setItem('ordenCompra', JSON.stringify(ordenCompra));

    // Navegar a checkout
    this.router.navigate(['/checkout']);
    
    console.log('🛒 Compra directa:', ordenCompra);
  }

  agregarAlCarrito() {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para agregar al carrito');
      this.router.navigate(['/login']);
      return;
    }

    // Obtener carrito actual
    let carrito = [];
    const carritoStr = localStorage.getItem('carrito');
    
    if (carritoStr) {
      carrito = JSON.parse(carritoStr);
    }

    // Buscar si el producto ya está en el carrito
    const index = carrito.findIndex((item: any) => 
      item.producto.id_producto === this.producto.id_producto &&
      item.color === this.colorSeleccionado &&
      item.talla === this.tallaSeleccionada
    );

    if (index > -1) {
      // Actualizar cantidad
      carrito[index].cantidad += this.cantidadComprar;
    } else {
      // Agregar nuevo item
      carrito.push({
        producto: this.producto,
        cantidad: this.cantidadComprar,
        color: this.colorSeleccionado,
        talla: this.tallaSeleccionada
      });
    }

    // Guardar carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(carrito));

    alert('✅ Producto agregado al carrito');
    console.log('🛒 Carrito actualizado:', carrito);
  }

  // ===== USUARIO =====
  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.isLoggedIn = true;

        this.userName =
          parsed.nombre ||
          parsed.firstName ||
          parsed.username ||
          (parsed.email ? parsed.email.split('@')[0] : 'Usuario');

        this.userImage =
          parsed.imagen && parsed.imagen.trim() !== ''
            ? parsed.imagen
            : 'assets/img/profile.jpeg';
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        this.logout();
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  logout() {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    this.isLoggedIn = false;
    this.userName = '';
    this.userImage = 'assets/img/profile.jpeg';
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
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

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideUserInfo = target.closest('.user-info');
    
    if (!clickedInsideUserInfo && this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }
}