import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  user: any = {
    nombre: 'Usuario',
    email: '',
    imagen: 'assets/img/profile.jpeg',
  };

  productosVendiendo: any[] = [];
  productosVendidos: any[] = [];
  compras: any[] = [];

  tabSeleccionado: 'vendiendo' | 'vendidos' | 'compras' = 'vendiendo';

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.user.nombre =
          parsed.nombre ||
          parsed.firstName ||
          parsed.username ||
          (parsed.email ? parsed.email.split('@')[0] : 'Usuario');
        this.user.email = parsed.email || '';
        this.user.imagen =
          parsed.imagen && parsed.imagen.trim() !== ''
            ? parsed.imagen
            : 'assets/img/profile.jpeg';
      } catch (e) {
        console.error('Error cargando usuario:', e);
      }
    }
  }

  editarPerfil() {
    this.router.navigate(['/perfil/editar']);
  }

  volverInicio() {
    this.router.navigate(['/']);
  }

  seleccionarTab(tab: 'vendiendo' | 'vendidos' | 'compras') {
    this.tabSeleccionado = tab;
  }

  obtenerProductosActivos() {
    switch (this.tabSeleccionado) {
      case 'vendiendo': return this.productosVendiendo;
      case 'vendidos': return this.productosVendidos;
      case 'compras': return this.compras;
      default: return [];
    }
  }
}
