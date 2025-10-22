import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'foco-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './focoshop.component.html',
  styleUrls: ['./focoshop.component.css']
})
export class FocoShopComponent implements AfterViewInit {
  categorias = [
    { nombre: 'TECNOLOGÍA', imagen: 'assets/img/tecnologia.jpeg', subcategorias: ['Celulares', 'Computadoras', 'Accesorios'] },
    { nombre: 'VESTIMENTA', imagen: 'assets/img/emma.jpg', subcategorias: ['Hombres', 'Mujeres', 'Niños'] },
    { nombre: 'CALZADO', imagen: 'assets/img/calzadooo.png', subcategorias: ['Deporte', 'Casual', 'Botas'] },
    { nombre: 'VIDEOJUEGOS', imagen: 'assets/img/videojuegos.jpg', subcategorias: ['Consolas', 'Juegos', 'Accesorios'] },
    { nombre: 'JUGUETES', imagen: 'assets/img/juguetes.jpg', subcategorias: ['Educativos', 'Acción', 'Muñecos'] },
    { nombre: 'HOGAR', imagen: 'assets/img/hogar.jpg', subcategorias: ['Muebles', 'Decoración', 'Electrodomésticos'] },
    { nombre: 'DEPORTE', imagen: 'assets/img/deporte.jpg', subcategorias: ['Fitness', 'Bicicletas', 'Balones'] }
  ];

  productos = [
    { categoria: 'TECNOLOGÍA', nombre: 'Amazon Basics HDMI Cable', precio: 360, reviews: 894, imagen: 'assets/img/hdmi.jpg' },
    { categoria: 'TECNOLOGÍA', nombre: 'Portable Washing Machine', precio: 80, reviews: 728, imagen: 'assets/img/audifonos2.jpg' },
    { categoria: 'TECNOLOGÍA', nombre: 'TOZO T6 True Wireless Earbuds', precio: 70, reviews: 600, imagen: 'assets/img/teclado.jpg' },
    { categoria: 'TECNOLOGÍA', nombre: 'Dell Optiplex 7000x7480', precio: 250, reviews: 482, imagen: 'assets/img/monitor.jpg' },
    { categoria: 'JUGUETES', nombre: 'Lego Star Wars Set', precio: 120, reviews: 300, imagen: 'assets/img/lego.jpg' },
    { categoria: 'HOGAR', nombre: 'Aspiradora Robot', precio: 250, reviews: 150, imagen: 'assets/img/aspiradora.jpg' },
    { categoria: 'DEPORTE', nombre: 'Bicicleta Mountain Bike', precio: 450, reviews: 210, imagen: 'assets/img/bicicleta.jpg' }
  ];

  categoriaSeleccionada = 0;
  busqueda = '';
  menuAbierto = false;

  @ViewChild('categoriaGrid') categoriaGrid!: ElementRef;

  // ===== Usuario =====
  isLoggedIn = false;
  userName = '';
  userImage = 'assets/img/user-icon.png'; // icono por defecto

  constructor(private router: Router) {
    // 🔄 Escucha cambios del localStorage (por ejemplo, login desde otra ruta)
    window.addEventListener('storage', (event) => {
      if (event.key === 'user') {
        this.cargarUsuario();
      }
    });
  }

  ngAfterViewInit() {
    this.scrollCategoriaCentrada(this.categoriaSeleccionada);
    this.cargarUsuario();
  }

  // ===== Productos filtrados por categoría y búsqueda =====
  get productosFiltrados() {
    return this.productos.filter(
      p =>
        p.categoria === this.categorias[this.categoriaSeleccionada].nombre &&
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  // ===== Manejo de categorías =====
  seleccionarCategoria(index: number) {
    this.categoriaSeleccionada = index;
    this.scrollCategoriaCentrada(index);
    this.menuAbierto = false; // cierra menú lateral
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
    const cardWidth = 160 + 25; // ancho tarjeta + gap
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

  // ===== Manejo de usuario =====
  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.isLoggedIn = true;
        this.userName = parsed.nombre || 'Usuario';
        this.userImage = parsed.imagen || 'assets/img/user-icon.png';
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
    this.isLoggedIn = false;
    this.userName = '';
    this.userImage = 'assets/img/user-icon.png';
    this.router.navigate(['/']);
  }
}
