import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TopsisService, ResultadoTOPSIS, CriterioTOPSIS, ProductoTOPSIS } from '../../services/topsis.service';

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  imagen?: string;
  imagen_url?: string;
  calificacion?: number;
  calificacion_promedio?: number;
  reviews?: number;
  num_reviews?: number;
  marca?: string;
  cantidad_disponible?: number;
}

interface Criterio {
  nombre: string;
  label: string;
  icon: string;
  tipo: 'beneficio' | 'costo';
  peso: number;
  activo: boolean;
  color: string;
}

@Component({
  selector: 'app-comparador-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparador-productos.component.html',
  styleUrls: ['./comparador-productos.component.css']
})
export class ComparadorProductosComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api';

  // Productos seleccionados (solo los que vienen por parámetro)
  productosSeleccionados: Producto[] = [];
  
  // Resultado de TOPSIS
  resultadoTOPSIS: ResultadoTOPSIS | null = null;
  
  // Criterios de comparación
  criterios: Criterio[] = [
    {
      nombre: 'precio',
      label: 'Precio',
      icon: '$',
      tipo: 'costo',
      peso: 30,
      activo: true,
      color: 'text-red-500'
    },
    {
      nombre: 'calificacion',
      label: 'Calificación',
      icon: '★',
      tipo: 'beneficio',
      peso: 25,
      activo: true,
      color: 'text-green-500'
    },
    {
      nombre: 'reviews',
      label: 'Reviews',
      icon: '🗨',
      tipo: 'beneficio',
      peso: 20,
      activo: true,
      color: 'text-green-500'
    },
    {
      nombre: 'reputacion_vendedor',
      label: 'Popularidad',
      icon: '🔥',
      tipo: 'beneficio',
      peso: 15,
      activo: true,
      color: 'text-green-500'
    },
    {
      nombre: 'stock',
      label: 'Stock',
      icon: '📦',
      tipo: 'beneficio',
      peso: 10,
      activo: true,
      color: 'text-green-500'
    }
  ];

  // Estados de UI
  cargando = false;
  error: string | null = null;
  modoDistribucionAutomatica = true;

  constructor(
    private topsisService: TopsisService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Solo cargar productos que vienen por parámetros
    this.route.queryParams.subscribe(params => {
      const idsParam = params['ids'];
      
      if (idsParam) {
        const ids = idsParam.split(',').map((id: string) => parseInt(id));
        this.cargarProductosEspecificos(ids);
      } else {
        // Si no hay IDs, mostrar mensaje de error
        this.mostrarError('No se han seleccionado productos para comparar');
      }
    });
  }

  /**
   * Carga productos específicos por IDs
   */
  cargarProductosEspecificos(ids: number[]) {
    this.cargando = true;
    console.log('📦 Cargando productos específicos:', ids);

    // Cargar cada producto individualmente
    const requests = ids.map(id => 
      this.http.get<Producto>(`${this.apiUrl}/productos/${id}`)
    );

    // Esperar a que todos se carguen
    Promise.all(requests.map(req => req.toPromise()))
      .then(productos => {
        this.productosSeleccionados = productos.filter(p => p != null) as Producto[];
        console.log('✅ Productos cargados:', this.productosSeleccionados.length);
        
        // Si hay menos de 2 productos, mostrar error
        if (this.productosSeleccionados.length < 2) {
          this.mostrarError('Se necesitan al menos 2 productos para comparar');
        }
        
        this.cargando = false;
      })
      .catch(error => {
        console.error('❌ Error al cargar productos:', error);
        this.mostrarError('Error al cargar los productos seleccionados');
        this.cargando = false;
      });
  }

  /**
   * Construye la URL correcta para las imágenes
   */
  private construirUrlImagen(imagen: string | undefined): string {
    if (!imagen) return '';
    
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    
    if (imagen.startsWith('/uploads/')) {
      return `http://localhost:8000${imagen}`;
    }
    
    return `http://localhost:8000/uploads/${imagen}`;
  }

  /**
   * Quita un producto de la lista de comparación
   */
  quitarProducto(producto: { id_producto: number }) {
    this.productosSeleccionados = this.productosSeleccionados.filter(
      p => p.id_producto !== producto.id_producto
    );
    
    // Si quedan menos de 2 productos, limpiar resultado
    if (this.productosSeleccionados.length < 2) {
      this.resultadoTOPSIS = null;
      this.mostrarError('Se necesitan al menos 2 productos para comparar');
    }
    
    console.log('✅ Producto removido. Quedan:', this.productosSeleccionados.length);
  }

  /**
   * Activa/desactiva un criterio
   */
  toggleCriterio(criterio: Criterio) {
    criterio.activo = !criterio.activo;
    
    const criteriosActivos = this.criterios.filter(c => c.activo);
    if (criteriosActivos.length === 0) {
      criterio.activo = true;
      this.mostrarError('Debe haber al menos un criterio activo');
      return;
    }
    
    if (this.modoDistribucionAutomatica) {
      this.distribuirPesosAutomaticamente();
    }
  }

  /**
   * Distribuye los pesos automáticamente entre criterios activos
   */
  distribuirPesosAutomaticamente() {
    const criteriosActivos = this.criterios.filter(c => c.activo);
    
    if (criteriosActivos.length === 0) return;
    
    const pesoBase = Math.floor(100 / criteriosActivos.length);
    const resto = 100 - (pesoBase * criteriosActivos.length);
    
    criteriosActivos.forEach((criterio, index) => {
      criterio.peso = pesoBase + (index < resto ? 1 : 0);
    });
    
    this.criterios.filter(c => !c.activo).forEach(c => c.peso = 0);
    this.modoDistribucionAutomatica = true;
  }

  /**
   * Ajusta manualmente el peso de un criterio
   */
  ajustarPeso(criterio: Criterio, event: Event) {
    const input = event.target as HTMLInputElement;
    const nuevoPeso = Number(input.value);
    
    if (nuevoPeso < 0) {
      criterio.peso = 0;
    } else if (nuevoPeso > 100) {
      criterio.peso = 100;
    } else {
      criterio.peso = nuevoPeso;
    }
    
    this.modoDistribucionAutomatica = false;
  }

  /**
   * Construye el objeto de criterios para enviar al backend
   */
  construirCriterios(): { [key: string]: CriterioTOPSIS } {
    const criteriosObj: { [key: string]: CriterioTOPSIS } = {};
    
    this.criterios
      .filter(c => c.activo)
      .forEach(c => {
        criteriosObj[c.nombre] = {
          peso: c.peso / 100,
          tipo: c.tipo
        };
      });
    
    return criteriosObj;
  }

  /**
   * Ejecuta la comparación TOPSIS
   */
  compararProductos() {
    if (this.productosSeleccionados.length < 2) {
      this.mostrarError('Selecciona al menos 2 productos');
      return;
    }

    if (this.productosSeleccionados.length > 5) {
      this.mostrarError('Máximo 5 productos para comparar');
      return;
    }

    const totalPesos = this.pesoTotal;
    if (Math.abs(totalPesos - 100) > 0.1) {
      this.mostrarError(`Los pesos deben sumar 100% (actualmente: ${totalPesos}%)`);
      return;
    }

    this.cargando = true;
    this.error = null;

    const criterios = this.construirCriterios();
    const productosIds = this.productosSeleccionados.map(p => p.id_producto);

    console.log('🔍 Iniciando comparación TOPSIS');
    console.log('📦 Productos:', productosIds);
    console.log('⚖️ Criterios:', criterios);

    this.topsisService.compararProductos(productosIds, criterios).subscribe({
      next: (resultado) => {
        console.log('✅ Comparación completada exitosamente');
        console.log('🏆 Producto ganador:', resultado.producto_ganador);
        
        this.resultadoTOPSIS = resultado;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error en comparación TOPSIS:', error);
        
        let mensajeError = 'Error al comparar productos';
        if (error.error?.detail) {
          mensajeError = error.error.detail;
        }
        
        this.mostrarError(mensajeError);
        this.cargando = false;
      }
    });
  }

  /**
   * Navega al detalle de un producto
   */
  verDetalleProducto(idProducto: number) {
    this.router.navigate(['/productos', idProducto]);
  }

  /**
   * Vuelve a la página de productos
   */
  volverAProductos() {
    this.router.navigate(['/productos']);
  }

  /**
   * Muestra un mensaje de error temporal
   */
  mostrarError(mensaje: string) {
    this.error = mensaje;
    console.warn('⚠️ Error:', mensaje);
    
    setTimeout(() => {
      this.error = null;
    }, 5000);
  }

  /**
   * Calcula el peso total de los criterios activos
   */
  get pesoTotal(): number {
    return this.criterios
      .filter(c => c.activo)
      .reduce((sum, c) => sum + c.peso, 0);
  }

  /**
   * Verifica si se puede ejecutar la comparación
   */
  get puedeComparar(): boolean {
    return this.productosSeleccionados.length >= 2 && 
           this.productosSeleccionados.length <= 5 &&
           Math.abs(this.pesoTotal - 100) < 0.1;
  }

  /**
   * Formatea el precio para mostrar
   */
  formatoPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  /**
   * Obtiene la clase CSS según el score TOPSIS
   */
  getScoreClass(score: number): string {
    if (score >= 0.7) return 'score-alto';
    if (score >= 0.4) return 'score-medio';
    return 'score-bajo';
  }
}