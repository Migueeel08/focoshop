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

  // ===== CATEGORÍAS (serán cargadas desde la BD) =====
  categorias: any[] = [];
  categoriasCargadas = false;

  // ===== PRODUCTOS (cargados desde la base de datos) =====
  productos: any[] = [];
  productosCargando = false;

  categoriaSeleccionada = 0;
  busqueda = '';
  menuAbierto = false;

  @ViewChild('categoriaGrid') categoriaGrid!: ElementRef;

  // ===== Usuario =====
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

  // ===== CARGAR CATEGORÍAS DESDE EL BACKEND =====
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
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        // Usar categorías por defecto en caso de error
        this.categorias = [
          { nombre: 'TECNOLOGÍA', imagen: 'assets/img/tecnologia.jpeg', subcategorias: [] },
          { nombre: 'VESTIMENTA', imagen: 'assets/img/emma.jpg', subcategorias: [] },
          { nombre: 'CALZADO', imagen: 'assets/img/calzadooo.png', subcategorias: [] }
        ];
        this.categoriasCargadas = true;
      }
    });
  }

  // Asignar imágenes a las categorías (puedes personalizar esto)
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

  // ===== CARGAR PRODUCTOS DESDE EL BACKEND =====
  cargarProductos() {
    this.productosCargando = true;
    const url = `${this.apiUrl}/productos`;
    console.log('Intentando cargar productos desde:', url);
    
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos del backend:', data);
        this.productos = data.map(prod => ({
          id_producto: prod.id_producto,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          imagen: prod.imagen || 'assets/img/tecnologia.jpeg',
          categoria: prod.categoria?.nombre || '',
          subcategoria: prod.subcategoria?.nombre || '',
          disponible: prod.disponible,
          cantidad_disponible: prod.cantidad_disponible,
          vendedor: prod.vendedor?.nombre || 'Vendedor',
          vistas: prod.vistas || 0,
          estado: prod.estado,
          reviews: Math.floor(Math.random() * 100) + 1 // Temporal hasta que tengas reviews reales
        }));
        this.productosCargando = false;
        console.log('Productos procesados:', this.productos);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        console.error('Detalles del error:', error.error);
        this.productosCargando = false;
        this.productos = [];
      }
    });
  }

  // Función auxiliar para normalizar texto (quitar acentos)
  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  // ===== FILTRAR PRODUCTOS =====
  get productosFiltrados() {
    if (!this.categoriasCargadas || this.categorias.length === 0) {
      console.log('❌ Categorías no cargadas');
      return [];
    }

    const categoriaActual = this.categorias[this.categoriaSeleccionada];
    if (!categoriaActual) {
      console.log('❌ No hay categoría actual');
      return [];
    }

    console.log('🔍 Filtrando productos:');
    console.log('   - Categoría actual:', categoriaActual.nombre);
    console.log('   - Total productos:', this.productos.length);
    console.log('   - Búsqueda:', this.busqueda);

    const categoriaNormalizada = this.normalizarTexto(categoriaActual.nombre);
    const busquedaNormalizada = this.normalizarTexto(this.busqueda);

    const filtrados = this.productos.filter(p => {
      // 1. Filtro de categoría
      const productoCategoriaNormalizada = this.normalizarTexto(p.categoria);
      const coincideCategoria = productoCategoriaNormalizada === categoriaNormalizada;

      // 2. Filtro de búsqueda (solo si hay texto de búsqueda)
      let coincideBusqueda = true;
      if (busquedaNormalizada) {
        const nombreNormalizado = this.normalizarTexto(p.nombre);
        const descripcionNormalizada = this.normalizarTexto(p.descripcion || '');
        coincideBusqueda = nombreNormalizado.includes(busquedaNormalizada) || 
                          descripcionNormalizada.includes(busquedaNormalizada);
      }

      // 3. Filtro de disponibilidad
      // ✅ CORREGIDO: Verificar disponible Y que cantidad_disponible > 0
      // Estado puede ser: 'activo', 'Activo', 'disponible', null, undefined
      const tieneStock = p.cantidad_disponible > 0;
      const estaActivo = !p.estado || 
                        p.estado.toLowerCase() === 'activo' || 
                        p.estado.toLowerCase() === 'disponible';
      const estaDisponible = (p.disponible === true || p.disponible === 1) && tieneStock && estaActivo;

      // Log detallado solo si debug está activo
      if (this.productos.length < 10) { // Solo loguear si hay pocos productos
        console.log(`   - Producto "${p.nombre}":`, {
          categoria: p.categoria,
          categoriaNormalizada: productoCategoriaNormalizada,
          categoriaEsperada: categoriaNormalizada,
          coincideCategoria,
          coincideBusqueda,
          disponible: p.disponible,
          cantidad: p.cantidad_disponible,
          estado: p.estado,
          tieneStock,
          estaActivo,
          estaDisponible,
          pasaFiltro: coincideCategoria && coincideBusqueda && estaDisponible
        });
      }

      return coincideCategoria && coincideBusqueda && estaDisponible;
    });

    console.log('✅ Productos filtrados:', filtrados.length);
    if (filtrados.length === 0 && this.productos.length > 0) {
      console.warn('⚠️ No hay productos que cumplan los filtros. Revisa:');
      console.warn('   - Categoría del producto coincide con:', categoriaNormalizada);
      console.warn('   - Productos tienen disponible=true y cantidad > 0');
      console.warn('   - Estado del producto es "activo" o similar');
    }
    return filtrados;
  }

  // ===== NAVEGACIÓN DE CATEGORÍAS =====
  seleccionarCategoria(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
  }

  seleccionarDesdeCarrusel(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
    this.menuAbierto = false;
  }

  anterior() {
    this.categoriaSeleccionada =
      (this.categoriaSeleccionada - 1 + this.categorias.length) % this.categorias.length;
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
  }

  siguiente() {
    this.categoriaSeleccionada = (this.categoriaSeleccionada + 1) % this.categorias.length;
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
  }

  scrollCategoriaCentrada(index: number) {
    if (!this.categoriaGrid) return;
    const cardWidth = 160 + 25;
    const scrollPosition = cardWidth * index - (this.categoriaGrid.nativeElement.offsetWidth / 2 - cardWidth / 2);
    this.categoriaGrid.nativeElement.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  }

  // ===== VER DETALLES DEL PRODUCTO =====
  verDetalleProducto(producto: any) {
    // Navegar a la página de detalles del producto
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