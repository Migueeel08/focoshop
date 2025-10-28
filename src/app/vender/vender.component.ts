import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-vender',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './vender.component.html',
  styleUrls: ['./vender.component.css']
})
export class VenderComponent implements OnInit {
  // Usuario
  userName = '';
  userImage = 'assets/img/profile.jpeg';
  userId = 0;

  // Producto
  nombreProducto = '';
  precio = 0;
  categoriaId = 0;
  categoria = '';
  subcategoriaId = 0;
  subcategoria = '';
  color = '';
  talla = '';
  marca = '';
  condicion = 'nuevo';
  descripcion = '';
  cantidad = 1;
  disponible = true;
  imagenes: string[] = [];

  // Opciones desde el backend
  categorias: any[] = [];
  subcategorias: any[] = [];
  
  colores = [
    { nombre: 'Negro', hex: '#000000' },
    { nombre: 'Blanco', hex: '#FFFFFF' },
    { nombre: 'Gris', hex: '#808080' },
    { nombre: 'Rojo', hex: '#FF0000' },
    { nombre: 'Azul', hex: '#0000FF' },
    { nombre: 'Verde', hex: '#00FF00' },
    { nombre: 'Amarillo', hex: '#FFFF00' },
    { nombre: 'Rosa', hex: '#FFC0CB' },
    { nombre: 'Morado', hex: '#800080' },
    { nombre: 'Naranja', hex: '#FFA500' }
  ];

  private apiUrl = 'http://localhost:8000/api'; // Con /api

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.cargarUsuario();
    this.cargarCategorias();
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        
        this.userId = parsed.id_usuario || parsed.id || 0;
        this.userName = parsed.nombre || parsed.firstName || parsed.username || 
                        (parsed.email ? parsed.email.split('@')[0] : 'Usuario');
        this.userImage = parsed.imagen && parsed.imagen.trim() !== '' 
                         ? parsed.imagen 
                         : 'assets/img/profile.jpeg';

        if (this.userId === 0) {
          alert('Error: No se pudo obtener el ID del usuario');
          this.router.navigate(['/login']);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        this.router.navigate(['/login']);
      }
    } else {
      alert('Debes iniciar sesión para vender productos');
      this.router.navigate(['/login']);
    }
  }

  cargarCategorias() {
    this.http.get<any[]>(`${this.apiUrl}/categorias`).subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        alert('Error al cargar las categorías');
      }
    });
  }

  onCategoriaChange() {
    const categoriaSeleccionada = this.categorias.find(c => c.id_categoria === Number(this.categoriaId));
    
    if (categoriaSeleccionada) {
      this.categoria = categoriaSeleccionada.nombre;
      this.cargarSubcategorias(this.categoriaId);
    }
    
    // Limpiar subcategoría al cambiar categoría
    this.subcategoriaId = 0;
    this.subcategoria = '';
  }

  cargarSubcategorias(idCategoria: number) {
    this.http.get<any[]>(`${this.apiUrl}/subcategorias/categoria/${idCategoria}`).subscribe({
      next: (data) => {
        this.subcategorias = data;
        console.log('Subcategorías cargadas:', this.subcategorias);
      },
      error: (error) => {
        console.error('Error al cargar subcategorías:', error);
        this.subcategorias = [];
      }
    });
  }

  onSubcategoriaChange() {
    const subcategoriaSeleccionada = this.subcategorias.find(s => s.id_subcategoria === Number(this.subcategoriaId));
    if (subcategoriaSeleccionada) {
      this.subcategoria = subcategoriaSeleccionada.nombre;
    }
  }

  // Verificar si la categoría necesita talla
  necesitaTalla(): boolean {
    const categoriasConTalla = ['VESTIMENTA', 'CALZADO', 'DEPORTE'];
    return categoriasConTalla.includes(this.categoria.toUpperCase());
  }

  // Verificar si la categoría necesita color
  necesitaColor(): boolean {
    const categoriasConColor = ['VESTIMENTA', 'CALZADO', 'TECNOLOGÍA', 'DEPORTE'];
    return categoriasConColor.includes(this.categoria.toUpperCase());
  }

  // Verificar si la categoría necesita marca
  necesitaMarca(): boolean {
    const categoriasConMarca = ['TECNOLOGÍA', 'VESTIMENTA', 'CALZADO', 'VIDEOJUEGOS', 'DEPORTE'];
    return categoriasConMarca.includes(this.categoria.toUpperCase());
  }

  onImageUpload(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenes = [e.target.result];
      };
      reader.readAsDataURL(files[0]);
    }
  }

  removeImage(index: number) {
    this.imagenes.splice(index, 1);
  }

  incrementarCantidad() {
    this.cantidad++;
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  toggleDisponibilidad() {
    this.disponible = !this.disponible;
  }

  publicarProducto() {
    // Validaciones
    if (!this.nombreProducto) {
      alert('Por favor ingresa el nombre del producto');
      return;
    }

    if (!this.precio || this.precio <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }

    if (!this.categoriaId) {
      alert('Por favor selecciona una categoría');
      return;
    }

    if (this.imagenes.length === 0) {
      alert('Por favor agrega al menos una imagen');
      return;
    }

    // Crear objeto producto para el backend
    const producto = {
      nombre: this.nombreProducto,
      descripcion: this.descripcion,
      precio: this.precio,
      cantidad_disponible: this.cantidad,
      disponible: this.disponible,
      id_categoria: Number(this.categoriaId),
      id_subcategoria: this.subcategoriaId ? Number(this.subcategoriaId) : null,
      id_vendedor: this.userId,
      color: this.color || null,
      talla: this.talla || null,
      marca: this.marca || null,
      condicion: this.condicion,
      imagen: this.imagenes[0] // Solo una imagen
    };

    console.log('Producto a publicar:', producto);

    // Enviar al backend
    this.http.post(`${this.apiUrl}/productos`, producto).subscribe({
      next: (response) => {
        console.log('Producto publicado exitosamente:', response);
        alert('¡Producto publicado exitosamente!');
        this.limpiarFormulario();
        this.router.navigate(['/']); // Redirigir al inicio
      },
      error: (error) => {
        console.error('Error al publicar producto:', error);
        alert('Error al publicar el producto: ' + (error.error?.detail || 'Error desconocido'));
      }
    });
  }

  limpiarFormulario() {
    this.nombreProducto = '';
    this.precio = 0;
    this.categoriaId = 0;
    this.categoria = '';
    this.subcategoriaId = 0;
    this.subcategoria = '';
    this.subcategorias = [];
    this.color = '';
    this.talla = '';
    this.marca = '';
    this.condicion = 'nuevo';
    this.descripcion = '';
    this.cantidad = 1;
    this.disponible = true;
    this.imagenes = [];
  }

  volver() {
    this.router.navigate(['/']);
  }
}