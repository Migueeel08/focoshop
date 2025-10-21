import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'foco-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './focoshop.component.html',
  styleUrls: ['./focoshop.component.css']
})
export class FocoShopComponent {
  categorias = [
    { nombre: 'TECNOLOGÍA', imagen: 'assets/img/tecnologia.jpg' },
    { nombre: 'VESTIMENTA', imagen: 'assets/img/vestimenta.jpg' },
    { nombre: 'CALZADO', imagen: 'assets/img/calzado.jpg' },
    { nombre: 'VIDEOJUEGOS', imagen: 'assets/img/videojuegos.jpg' }
  ];

  productos = [
    { categoria: 'TECNOLOGÍA', nombre: 'Amazon Basics HDMI Cable', precio: 360, reviews: 894, imagen: 'assets/img/hdmi.jpg' },
    { categoria: 'TECNOLOGÍA', nombre: 'Portable Washing Machine', precio: 80, reviews: 728, imagen: 'assets/img/audifonos2.jpg' },
    { categoria: 'TECNOLOGÍA', nombre: 'TOZO T6 True Wireless Earbuds', precio: 70, reviews: 600, imagen: 'assets/img/teclado.jpg' },
    { categoria: 'TECNOLOGÍA', nombre: 'Dell Optiplex 7000x7480', precio: 250, reviews: 482, imagen: 'assets/img/monitor.jpg' }
  ];

  categoriaSeleccionada = 0;
  busqueda = '';

  get productosFiltrados() {
    return this.productos.filter(
      p =>
        p.categoria === this.categorias[this.categoriaSeleccionada].nombre &&
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) // <-- corregido 'includes'
    );
  }

  seleccionarCategoria(index: number) {
    this.categoriaSeleccionada = index;
  }

  anterior() {
    this.categoriaSeleccionada =
      (this.categoriaSeleccionada - 1 + this.categorias.length) % this.categorias.length;
  }

  siguiente() {
    this.categoriaSeleccionada = (this.categoriaSeleccionada + 1) % this.categorias.length;
  }
}
