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
  userImage = 'assets/img/user-icon.png'; // icono por defecto
  userMenuOpen = false; // menú desplegable del usuario

  private storageListener = (event: StorageEvent) => {
    if (event.key === 'user' || event.key === null) {
      this.cargarUsuario();
    }
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarUsuario();
    window.addEventListener('storage', this.storageListener);

    // 🔹 Aquí más adelante se pueden cargar los productos desde la BD
    // Ejemplo:
    // this.productService.getProductos().subscribe(data => this.productos = data);
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

  seleccionarCategoria(index: number) {
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

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }

  // ✅ Ir a la pantalla de configuración del usuario
  irConfiguracion() {
    this.userMenuOpen = false;
    this.router.navigate(['/configuracion']);
  }

  // ✅ NUEVA FUNCIÓN: Ir a la pantalla "Mi perfil"
  irPerfil() {
    this.userMenuOpen = false;
    this.router.navigate(['/perfil']);
  }

  // ✅ Cargar datos del usuario desde localStorage
  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.isLoggedIn = true;

        // 🔹 Mostrar nombre real si existe, si no, usar parte del correo
        this.userName =
          parsed.nombre ||
          parsed.firstName ||
          parsed.username ||
          (parsed.email ? parsed.email.split('@')[0] : 'Usuario');

        // 🔹 Imagen del perfil (si no hay, usar la predeterminada)
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
    if (!clickedInsideUserInfo && this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }
}
