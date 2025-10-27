import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vender.component.html',
  styleUrls: ['./vender.component.css']
})
export class VenderComponent implements OnInit {
  // Usuario
  userName = '';
  userImage = 'assets/img/profile.jpeg';

  // Producto
  nombreProducto = '';
  precio = 0;
  categoria = '';
  subcategoria = '';
  color = '';
  talla = '';
  marca = '';
  condicion = 'nuevo';
  descripcion = '';
  cantidad = 1;
  disponible = true;
  imagenes: string[] = [];

  // Opciones
  categorias = [
    { nombre: 'TECNOLOGÍA', subcategorias: ['Celulares', 'Computadoras', 'Accesorios'] },
    { nombre: 'VESTIMENTA', subcategorias: ['Hombres', 'Mujeres', 'Niños'] },
    { nombre: 'CALZADO', subcategorias: ['Deporte', 'Casual', 'Botas'] },
    { nombre: 'VIDEOJUEGOS', subcategorias: ['Consolas', 'Juegos', 'Accesorios'] },
    { nombre: 'JUGUETES', subcategorias: ['Educativos', 'Acción', 'Muñecos'] },
    { nombre: 'HOGAR', subcategorias: ['Muebles', 'Decoración', 'Electrodomésticos'] },
    { nombre: 'DEPORTE', subcategorias: ['Fitness', 'Bicicletas', 'Balones'] }
  ];

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
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
      }
    }
  }

  getSubcategorias(): string[] {
    const cat = this.categorias.find(c => c.nombre === this.categoria);
    return cat ? cat.subcategorias : [];
  }

  // Verificar si la categoría necesita talla
  necesitaTalla(): boolean {
    const categoriasConTalla = ['VESTIMENTA', 'CALZADO', 'DEPORTE'];
    return categoriasConTalla.includes(this.categoria);
  }

  // Verificar si la categoría necesita color
  necesitaColor(): boolean {
    const categoriasConColor = ['VESTIMENTA', 'CALZADO', 'TECNOLOGÍA', 'DEPORTE'];
    return categoriasConColor.includes(this.categoria);
  }

  // Verificar si la categoría necesita marca
  necesitaMarca(): boolean {
    const categoriasConMarca = ['TECNOLOGÍA', 'VESTIMENTA', 'CALZADO', 'VIDEOJUEGOS', 'DEPORTE'];
    return categoriasConMarca.includes(this.categoria);
  }

  onImageUpload(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenes.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
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

    if (!this.categoria) {
      alert('Por favor selecciona una categoría');
      return;
    }

    if (this.imagenes.length === 0) {
      alert('Por favor agrega al menos una imagen');
      return;
    }

    // Crear objeto producto
    const producto = {
      nombre: this.nombreProducto,
      precio: this.precio,
      categoria: this.categoria,
      subcategoria: this.subcategoria,
      color: this.color,
      talla: this.talla,
      marca: this.marca,
      condicion: this.condicion,
      descripcion: this.descripcion,
      cantidad: this.cantidad,
      disponible: this.disponible,
      imagenes: this.imagenes,
      vendedor: this.userName,
      fechaPublicacion: new Date().toISOString()
    };

    console.log('Producto a publicar:', producto);

    // Aquí deberías enviar el producto a tu backend
    // Por ahora solo mostramos un mensaje
    alert('¡Producto publicado exitosamente!');
    
    // Limpiar formulario
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nombreProducto = '';
    this.precio = 0;
    this.categoria = '';
    this.subcategoria = '';
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