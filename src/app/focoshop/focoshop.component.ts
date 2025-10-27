import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'foco-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './focoshop.component.html',
  styleUrls: ['./focoshop.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FocoShopComponent implements AfterViewInit, OnInit, OnDestroy {

  // ===== CATEGORÍAS =====
  categorias = [
    { nombre: 'TECNOLOGÍA', imagen: 'assets/img/tecnologia.jpeg', subcategorias: ['Celulares', 'Computadoras', 'Accesorios'] },
    { nombre: 'VESTIMENTA', imagen: 'assets/img/emma.jpg', subcategorias: ['Hombres', 'Mujeres', 'Niños'] },
    { nombre: 'CALZADO', imagen: 'assets/img/calzadooo.png', subcategorias: ['Deporte', 'Casual', 'Botas'] },
    { nombre: 'VIDEOJUEGOS', imagen: 'assets/img/videojuegos.jpg', subcategorias: ['Consolas', 'Juegos', 'Accesorios'] },
    { nombre: 'JUGUETES', imagen: 'assets/img/juguetes.jpg', subcategorias: ['Educativos', 'Acción', 'Muñecos'] },
    { nombre: 'HOGAR', imagen: 'assets/img/hogar.jpg', subcategorias: ['Muebles', 'Decoración', 'Electrodomésticos'] },
    { nombre: 'DEPORTE', imagen: 'assets/img/deporte.jpg', subcategorias: ['Fitness', 'Bicicletas', 'Balones'] }
  ];

  // ===== PRODUCTOS (serán cargados desde la base de datos) =====
  productos: any[] = [];

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarUsuario();
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageListener);
  }

  ngAfterViewInit() {
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
  }

  get productosFiltrados() {
    return this.productos.filter(
      p =>
        p.categoria === this.categorias[this.categoriaSeleccionada].nombre &&
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  // ✅ CORREGIDO: Ya no cierra el menú al seleccionar categoría desde el menú lateral
  seleccionarCategoria(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
    // ❌ REMOVIDO: this.menuAbierto = false;
  }

  // 🆕 NUEVO: Método específico para seleccionar desde el carrusel (cierra el menú)
  seleccionarDesdeCarrusel(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
    this.menuAbierto = false; // Solo cierra desde el carrusel
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

  // 🆕 NUEVA FUNCIÓN: Navegar a la página de vender
  irVender() {
    this.userMenuOpen = false;
    this.router.navigate(['/vender']);
  }

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
    
    // ✅ MEJORADO: También evita cerrar el menú de categorías si se hace clic dentro de él
    const clickedInsideMenu = target.closest('.menu-categorias');
    const clickedMenuButton = target.closest('.btn-menu-categorias');
    
    if (!clickedInsideUserInfo && this.userMenuOpen) {
      this.userMenuOpen = false;
    }

    // 🆕 Cierra el menú lateral solo si se hace clic fuera de él
    if (!clickedInsideMenu && !clickedMenuButton && this.menuAbierto) {
      const clickedOverlay = target.closest('.menu-overlay');
      if (clickedOverlay) {
        this.menuAbierto = false;
      }
    }
  }
}