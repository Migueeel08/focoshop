import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'foco-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './focoshop.component.html',
  styleUrls: ['./focoshop.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FocoShopComponent implements AfterViewInit, OnInit, OnDestroy {

  // ===== API =====
  private apiUrl = 'http://localhost:8000/api';

  // ===== CATEGORÍAS =====
  categorias: any[] = [];
  categoriasCargadas = false;

  // ===== PRODUCTOS =====
  productos: any[] = [];
  productosCargando = false;
  productosFiltrados: any[] = [];

  categoriaSeleccionada = 0;
  busqueda = '';
  menuAbierto = false;

  @ViewChild('categoriaGrid') categoriaGrid!: ElementRef;

  // ===== FILTROS =====
  filtros = {
    nuevo: false,
    usado: false,
    precioMin: null as number | null,
    precioMax: null as number | null,
    marcas: [] as string[],
    calificacion: null as string | null
  };

  // ===== ORDENAMIENTO =====
  ordenamiento: string = 'relevantes';

  // ===== MARCAS DISPONIBLES =====
  marcasDisponibles: string[] = [];
  buscarMarca: string = '';

  // ===== USUARIO =====
  isLoggedIn = false;
  userName = '';
  userImage = 'assets/img/user-icon.png';
  userMenuOpen = false;

  private storageListener = (event: StorageEvent) => {
    if (event.key === 'user' || event.key === null) {
      this.cargarUsuario();
    }
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.cargarUsuario();
    this.cargarCategorias();
    this.cargarProductos();
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageListener);
  }

  ngAfterViewInit() {
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
  }

  // ===== CARGAR CATEGORÍAS =====
  cargarCategorias() {
    this.http.get<any[]>(`${this.apiUrl}/categorias`).subscribe({
      next: (data) => {
        this.categorias = data.map(cat => ({
          id_categoria: cat.id_categoria,
          nombre: cat.nombre,
          imagen: this.getImagenCategoria(cat.nombre),
          subcategorias: cat.subcategorias || []
        }));
        this.categoriasCargadas = true;
        console.log('Categorías cargadas:', this.categorias);
        this.filtrarProductos();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.categorias = [
          { nombre: 'TECNOLOGÍA', imagen: 'assets/img/tecnologia.jpeg', subcategorias: [] },
          { nombre: 'VESTIMENTA', imagen: 'assets/img/emma.jpg', subcategorias: [] },
          { nombre: 'CALZADO', imagen: 'assets/img/calzadooo.png', subcategorias: [] }
        ];
        this.categoriasCargadas = true;
        this.filtrarProductos();
      }
    });
  }

  getImagenCategoria(nombre: string): string {
    const imagenes: any = {
      'TECNOLOGÍA': 'assets/img/tecnologia.jpeg',
      'VESTIMENTA': 'assets/img/emma.jpg',
      'CALZADO': 'assets/img/calzadooo.png',
      'VIDEOJUEGOS': 'assets/img/videojuegos.jpg',
      'JUGUETES': 'assets/img/juguetes.jpg',
      'HOGAR': 'assets/img/hogar.jpg',
      'DEPORTE': 'assets/img/deporte.jpg'
    };
    return imagenes[nombre.toUpperCase()] || 'assets/img/tecnologia.jpeg';
  }

  // ===== CARGAR PRODUCTOS =====
  cargarProductos() {
    this.productosCargando = true;
    const url = `${this.apiUrl}/productos`;
    
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos del backend:', data);
        this.productos = data.map(prod => ({
          id_producto: prod.id_producto,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          imagen: this.construirUrlImagen(prod.imagen),
          categoria: prod.categoria || '',
          subcategoria: prod.subcategoria || '',
          disponible: prod.disponible,
          cantidad_disponible: prod.cantidad_disponible,
          vendedor: prod.vendedor_nombre || 'Vendedor',
          vistas: prod.vistas || 0,
          estado: prod.estado,
          reviews: prod.reviews || 0, // ✅ Ahora usa el valor real o 0
          marca: prod.marca || null,
          calificacion: prod.calificacion || 0, // ✅ 0 si no ha sido calificado
          condicion: prod.condicion || 'nuevo',
          precio_anterior: prod.precio_anterior || null,
          descuento: prod.descuento || null,
          envio_gratis: prod.envio_gratis || false
        }));
        
        this.productosCargando = false;
        this.extraerMarcas();
        this.filtrarProductos();
        console.log('Productos procesados:', this.productos);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.productosCargando = false;
        this.productos = [];
        this.filtrarProductos();
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
   * Extraer marcas únicas de los productos
   */
  extraerMarcas() {
    const marcas = this.productos
      .map(p => p.marca)
      .filter(m => m !== null && m !== undefined && m !== '');
    
    this.marcasDisponibles = [...new Set(marcas)].sort();
  }

  /**
   * Toggle marca en filtros
   */
  toggleMarca(marca: string) {
    const index = this.filtros.marcas.indexOf(marca);
    if (index > -1) {
      this.filtros.marcas.splice(index, 1);
    } else {
      this.filtros.marcas.push(marca);
    }
    this.aplicarFiltros();
  }

  /**
   * Normalizar texto (quitar acentos)
   */
  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  /**
   * ===== FILTRAR Y ORDENAR PRODUCTOS =====
   */
  filtrarProductos() {
    if (!this.categoriasCargadas || this.categorias.length === 0) {
      this.productosFiltrados = [];
      return;
    }

    const categoriaActual = this.categorias[this.categoriaSeleccionada];
    if (!categoriaActual) {
      this.productosFiltrados = [];
      return;
    }

    const categoriaNormalizada = this.normalizarTexto(categoriaActual.nombre);
    const busquedaNormalizada = this.normalizarTexto(this.busqueda);

    let filtrados = this.productos.filter(p => {
      // 1. Filtro de categoría
      const productoCategoriaNormalizada = this.normalizarTexto(p.categoria);
      const coincideCategoria = productoCategoriaNormalizada === categoriaNormalizada;

      // 2. Filtro de búsqueda
      let coincideBusqueda = true;
      if (busquedaNormalizada) {
        const nombreNormalizado = this.normalizarTexto(p.nombre);
        const descripcionNormalizada = this.normalizarTexto(p.descripcion || '');
        coincideBusqueda = nombreNormalizado.includes(busquedaNormalizada) || 
                          descripcionNormalizada.includes(busquedaNormalizada);
      }

      // 3. Filtro de disponibilidad
      const tieneStock = p.cantidad_disponible > 0;
      const estaActivo = !p.estado || 
                        p.estado.toLowerCase() === 'activo' || 
                        p.estado.toLowerCase() === 'disponible';
      const estaDisponible = (p.disponible === true || p.disponible === 1) && tieneStock && estaActivo;

      // 4. Filtro de condición (nuevo/usado)
      let coincideCondicion = true;
      if (this.filtros.nuevo || this.filtros.usado) {
        coincideCondicion = 
          (this.filtros.nuevo && p.condicion === 'nuevo') ||
          (this.filtros.usado && p.condicion === 'usado');
      }

      // 5. Filtro de precio
      let coincidePrecio = true;
      if (this.filtros.precioMin !== null && p.precio < this.filtros.precioMin) {
        coincidePrecio = false;
      }
      if (this.filtros.precioMax !== null && p.precio > this.filtros.precioMax) {
        coincidePrecio = false;
      }

      // 6. Filtro de marca
      let coincideMarca = true;
      if (this.filtros.marcas.length > 0) {
        coincideMarca = this.filtros.marcas.includes(p.marca);
      }

      // 7. Filtro de calificación
      let coincideCalificacion = true;
      if (this.filtros.calificacion !== null) {
        const minCalificacion = parseInt(this.filtros.calificacion);
        coincideCalificacion = p.calificacion >= minCalificacion;
      }

      return coincideCategoria && 
             coincideBusqueda && 
             estaDisponible && 
             coincideCondicion && 
             coincidePrecio && 
             coincideMarca && 
             coincideCalificacion;
    });

    // Aplicar ordenamiento
    filtrados = this.ordenarProductosArray(filtrados);

    this.productosFiltrados = filtrados;
    console.log('✅ Productos filtrados:', filtrados.length);
  }

  /**
   * Aplicar filtros (llama a filtrarProductos)
   */
  aplicarFiltros() {
    this.filtrarProductos();
  }

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros() {
    this.filtros = {
      nuevo: false,
      usado: false,
      precioMin: null,
      precioMax: null,
      marcas: [],
      calificacion: null
    };
    this.aplicarFiltros();
  }

  /**
   * Ordenar productos
   */
  ordenarProductos() {
    this.productosFiltrados = this.ordenarProductosArray(this.productosFiltrados);
  }

  /**
   * Ordenar array de productos según el criterio seleccionado
   */
  ordenarProductosArray(productos: any[]): any[] {
    const copia = [...productos];

    switch (this.ordenamiento) {
      case 'menor-precio':
        return copia.sort((a, b) => a.precio - b.precio);
      
      case 'mayor-precio':
        return copia.sort((a, b) => b.precio - a.precio);
      
      case 'mas-vendidos':
        return copia.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      
      case 'relevantes':
      default:
        // Ordenar por calificación * reviews (productos más relevantes)
        return copia.sort((a, b) => {
          const relevanciaA = (a.calificacion || 0) * (a.reviews || 0);
          const relevanciaB = (b.calificacion || 0) * (b.reviews || 0);
          return relevanciaB - relevanciaA;
        });
    }
  }

  // ===== NAVEGACIÓN DE CATEGORÍAS =====
  seleccionarCategoria(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
    this.limpiarFiltros(); // Limpiar filtros al cambiar de categoría
    this.filtrarProductos();
  }

  seleccionarDesdeCarrusel(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
    this.menuAbierto = false;
    this.limpiarFiltros();
    this.filtrarProductos();
  }

  anterior() {
    this.categoriaSeleccionada =
      (this.categoriaSeleccionada - 1 + this.categorias.length) % this.categorias.length;
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
    this.limpiarFiltros();
    this.filtrarProductos();
  }

  siguiente() {
    this.categoriaSeleccionada = (this.categoriaSeleccionada + 1) % this.categorias.length;
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
    this.limpiarFiltros();
    this.filtrarProductos();
  }

  scrollCategoriaCentrada(index: number) {
    if (!this.categoriaGrid) return;
    const cardWidth = 160 + 25;
    const scrollPosition = cardWidth * index - (this.categoriaGrid.nativeElement.offsetWidth / 2 - cardWidth / 2);
    this.categoriaGrid.nativeElement.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  }

  onBusquedaChange() {
    this.filtrarProductos();
  }

  // ===== VER DETALLES DEL PRODUCTO =====
  verDetalleProducto(producto: any) {
    this.router.navigate(['/producto', producto.id_producto]);
  }

  // ===== MENÚ Y NAVEGACIÓN =====
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }

  irConfiguracion() {
    this.userMenuOpen = false;
    this.router.navigate(['/configuracion']);
  }

  irPerfil() {
    this.userMenuOpen = false;
    this.router.navigate(['/perfil']);
  }

  irVender() {
    this.userMenuOpen = false;
    this.router.navigate(['/vender']);
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

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideUserInfo = target.closest('.user-info');
    const clickedInsideMenu = target.closest('.menu-categorias');
    const clickedMenuButton = target.closest('.btn-menu-categorias');
    
    if (!clickedInsideUserInfo && this.userMenuOpen) {
      this.userMenuOpen = false;
    }

    if (!clickedInsideMenu && !clickedMenuButton && this.menuAbierto) {
      const clickedOverlay = target.closest('.menu-overlay');
      if (clickedOverlay) {
        this.menuAbierto = false;
      }
    }
  }
}