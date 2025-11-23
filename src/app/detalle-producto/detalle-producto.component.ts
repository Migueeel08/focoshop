import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StripeCheckoutService } from '../services/stripe-checkout.service';
import { ReviewModalComponent } from '../components/review-modal.component';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    HttpClientModule,
    ReviewModalComponent
  ],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css'
})
export class DetalleProductoComponent implements OnInit, OnDestroy {
  
  // ===== API =====
  private apiUrl = 'http://localhost:8000/api';
  baseUrl = 'http://localhost:8000';

  // ===== PRODUCTO =====
  producto: any = null;
  cargando: boolean = true;
  productId: number = 0;

  // ===== SELECCIONES DEL USUARIO =====
  imagenSeleccionada: number = 0;
  colorSeleccionado: string = '';
  tallaSeleccionada: string = '';
  cantidadComprar: number = 1;
  
  // ===== FAVORITOS =====
  esFavorito: boolean = false;
  idFavorito: number | null = null;
  cargandoFavorito: boolean = false;

  // ===== USUARIO =====
  isLoggedIn: boolean = false;
  userName: string = '';
  userImage: string = 'assets/img/user-icon.png';
  userMenuOpen: boolean = false;
  userId: number = 0;

  // ===== BÚSQUEDA =====
  busqueda: string = '';

  // ===== MODAL DE CHECKOUT =====
  modalCheckoutVisible: boolean = false;
  direcciones: any[] = [];
  metodosPago: any[] = [];
  direccionSeleccionada: any = null;
  metodoPagoSeleccionado: any = null;
  procesandoPago: boolean = false;

  // ===== MODAL AGREGAR AL CARRITO =====
  modalCarritoVisible: boolean = false;
  productoAgregado: any = null;

  // ===== MODAL COMPRA EXITOSA =====
  modalCompraExitosaVisible: boolean = false;

  // ===== SISTEMA DE RECOMENDACIONES IA =====
  productosRecomendados: any[] = [];
  cargandoRecomendaciones: boolean = false;

  // ===== STRIPE =====
  mostrarFormularioStripe: boolean = false;
  procesandoStripe: boolean = false;
  errorStripe: string = '';
  stripeInicializado: boolean = false;

  // ===== MODAL DE CALIFICACIÓN =====
  mostrarModalReview: boolean = false;
  pedidoIdParaReview: number | null = null;
  usuarioYaCalificó: boolean = false;  // ✅ NUEVO

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private stripeService: StripeCheckoutService
  ) {}

  ngOnInit() {
    this.cargarUsuario();
    
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.cargarProducto();
        
        if (this.userId) {
          this.verificarFavorito();
          this.verificarSiYaCalificó();  // ✅ NUEVO
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.stripeInicializado) {
      this.stripeService.destroyElements();
    }
  }

  // ===== VERIFICAR SI YA CALIFICÓ =====
  verificarSiYaCalificó() {
    if (!this.userId || !this.productId) return;

    this.http.get<any>(
      `${this.apiUrl}/reviews/check/${this.productId}/${this.userId}`
    ).subscribe({
      next: (response) => {
        this.usuarioYaCalificó = response.ya_califico;
        console.log('✅ Usuario ya calificó:', this.usuarioYaCalificó);
      },
      error: (error) => {
        console.error('Error verificando review:', error);
        this.usuarioYaCalificó = false;
      }
    });
  }

  // ===== CARGAR PRODUCTO =====
  cargarProducto() {
    this.cargando = true;
    const url = `${this.apiUrl}/productos/${this.productId}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        console.log('✅ Producto cargado:', data);
        
        this.producto = {
          id_producto: data.id_producto,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          imagen: this.construirUrlImagen(data.imagen),
          categoria: data.categoria || '',
          subcategoria: data.subcategoria || '',
          disponible: data.disponible,
          cantidad_disponible: data.cantidad_disponible,
          vendedor: data.vendedor_nombre || 'Vendedor',
          id_vendedor: data.id_vendedor,
          vistas: data.vistas || 0,
          estado: data.estado,
          reviews: data.reviews || 0,
          marca: data.marca || null,
          calificacion: data.calificacion || 0,
          condicion: data.condicion || 'nuevo',
          precio_anterior: data.precio_anterior || null,
          descuento: data.descuento || null,
          color: data.color || null,
          talla: data.talla || null
        };

        // ✅ Log para debug
        console.log('📊 Calificación del producto:', this.producto.calificacion);
        console.log('📊 Reviews del producto:', this.producto.reviews);

        this.colorSeleccionado = this.producto.color;
        this.tallaSeleccionada = this.producto.talla;

        this.cargando = false;
        
        this.cargarRecomendaciones();
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.cargando = false;
        this.producto = null;
      }
    });
  }

  construirUrlImagen(imagen: string | null): string {
    if (!imagen) return 'assets/img/producto-default.jpg';
    if (imagen.startsWith('http')) return imagen;
    if (imagen.startsWith('assets/')) return imagen;
    if (imagen.startsWith('data:image')) return imagen;
    if (imagen.startsWith('/uploads/')) return `http://localhost:8000${imagen}`;
    return 'assets/img/producto-default.jpg';
  }

  getColorHex(colorNombre: string): string {
    const colores: any = {
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'rojo': '#FF0000',
      'azul': '#0000FF',
      'verde': '#00FF00',
      'amarillo': '#FFFF00',
      'rosa': '#FFC0CB',
      'gris': '#808080',
      'naranja': '#FFA500',
      'morado': '#800080',
    };
    return colores[colorNombre?.toLowerCase()] || '#667eea';
  }

  // ===== NAVEGACIÓN =====
  volverInicio() {
    this.router.navigate(['/']);
  }

  volverCategoria() {
    this.router.navigate(['/']);
  }

  buscarProductos() {
    if (this.busqueda.trim()) {
      this.router.navigate(['/'], { queryParams: { q: this.busqueda } });
    }
  }

  // ===== IMÁGENES =====
  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }

  // ===== FAVORITOS =====
  verificarFavorito() {
    if (!this.userId || !this.productId) return;

    this.http.get<any>(
      `${this.apiUrl}/favoritos/check?id_usuario=${this.userId}&id_producto=${this.productId}`
    ).subscribe({
      next: (data) => {
        this.esFavorito = data.en_favoritos;
        this.idFavorito = data.id_favorito || null;
        console.log('✅ Estado favorito:', this.esFavorito);
      },
      error: (error) => {
        console.error('Error al verificar favorito:', error);
        this.esFavorito = false;
      }
    });
  }

  toggleFavorito() {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para agregar a favoritos');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.producto?.id_producto) {
      alert('Error: Producto no válido');
      return;
    }

    if (this.cargandoFavorito) return;

    this.cargandoFavorito = true;

    if (this.esFavorito) {
      this.quitarDeFavoritos();
    } else {
      this.agregarAFavoritos();
    }
  }

  agregarAFavoritos() {
    const favorito = {
      id_usuario: this.userId,
      id_producto: this.producto.id_producto
    };

    this.http.post<any>(`${this.apiUrl}/favoritos`, favorito).subscribe({
      next: (response) => {
        console.log('✅ Agregado a favoritos:', response);
        this.esFavorito = true;
        this.idFavorito = response.id_favorito;
        this.cargandoFavorito = false;
        
        window.dispatchEvent(new Event('favoritosActualizado'));
      },
      error: (error) => {
        console.error('Error al agregar a favoritos:', error);
        this.cargandoFavorito = false;
        
        if (error.status === 400) {
          alert('Este producto ya está en tus favoritos');
        } else {
          alert('Error al agregar a favoritos. Intenta de nuevo.');
        }
      }
    });
  }

  quitarDeFavoritos() {
    if (!this.idFavorito) {
      this.cargandoFavorito = false;
      return;
    }

    this.http.delete(`${this.apiUrl}/favoritos/${this.idFavorito}`).subscribe({
      next: () => {
        console.log('✅ Eliminado de favoritos');
        this.esFavorito = false;
        this.idFavorito = null;
        this.cargandoFavorito = false;
        
        window.dispatchEvent(new Event('favoritosActualizado'));
      },
      error: (error) => {
        console.error('Error al eliminar de favoritos:', error);
        this.cargandoFavorito = false;
        alert('Error al eliminar de favoritos. Intenta de nuevo.');
      }
    });
  }

  // ===== CANTIDAD =====
  incrementarCantidad() {
    if (this.cantidadComprar < this.producto.cantidad_disponible) {
      this.cantidadComprar++;
    }
  }

  decrementarCantidad() {
    if (this.cantidadComprar > 1) {
      this.cantidadComprar--;
    }
  }

  // ===== COMPRAR AHORA =====
  comprarAhora() {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para comprar');
      this.router.navigate(['/login']);
      return;
    }

    this.modalCheckoutVisible = true;
    this.cargarDireccionesUsuario();
    this.cargarMetodosPagoUsuario();
  }

  // ===== CARGAR DIRECCIONES =====
  cargarDireccionesUsuario() {
    console.log('🔍 Cargando direcciones para usuario:', this.userId);
    
    this.http.get<any[]>(`${this.apiUrl}/direcciones/usuario/${this.userId}`).subscribe({
      next: (direcciones) => {
        console.log('✅ Direcciones recibidas:', direcciones);
        this.direcciones = direcciones;
        
        if (direcciones.length > 0) {
          this.direccionSeleccionada = direcciones[0];
        }
      },
      error: (error) => {
        console.error('❌ Error cargando direcciones:', error);
        this.direcciones = [];
      }
    });
  }

  // ===== CARGAR MÉTODOS DE PAGO =====
  cargarMetodosPagoUsuario() {
    console.log('🔍 Cargando métodos de pago para usuario:', this.userId);
    
    this.http.get<any[]>(`${this.apiUrl}/metodos-pago/usuario/${this.userId}`).subscribe({
      next: (metodos) => {
        console.log('✅ Métodos de pago recibidos:', metodos);
        this.metodosPago = metodos;
      },
      error: (error) => {
        console.error('❌ Error cargando métodos de pago:', error);
        this.metodosPago = [];
      }
    });
  }

  // ===== CERRAR MODAL CHECKOUT =====
  cerrarModalCheckout() {
    this.modalCheckoutVisible = false;
    this.direccionSeleccionada = null;
    this.metodoPagoSeleccionado = null;
    this.mostrarFormularioStripe = false;
    this.errorStripe = '';
    if (this.stripeInicializado) {
      this.stripeService.destroyElements();
      this.stripeInicializado = false;
    }
  }

  // ===== SELECCIONAR DIRECCIÓN =====
  seleccionarDireccion(direccion: any) {
    this.direccionSeleccionada = direccion;
  }

  // ===== SELECCIONAR MÉTODO DE PAGO =====
  seleccionarMetodoPago(metodo: any) {
    this.metodoPagoSeleccionado = metodo;
    if (this.mostrarFormularioStripe) {
      this.mostrarFormularioStripe = false;
      if (this.stripeInicializado) {
        this.stripeService.destroyElements();
        this.stripeInicializado = false;
      }
    }
  }

  // ===== DETECTAR MARCA DE TARJETA =====
  detectarMarcaTarjeta(banco: string): string {
    if (!banco) return 'generic';
    
    const bancoLower = banco.toLowerCase();
    
    const marcasPorBanco: { [key: string]: string } = {
      'visa': 'visa',
      'mastercard': 'mastercard',
      'master card': 'mastercard',
      'american express': 'amex',
      'amex': 'amex',
      'discover': 'discover',
      'diners': 'diners',
      'jcb': 'jcb',
      'unionpay': 'unionpay',
      'maestro': 'maestro'
    };

    for (const [key, marca] of Object.entries(marcasPorBanco)) {
      if (bancoLower.includes(key)) {
        return marca;
      }
    }

    return 'generic';
  }

  // ===== OBTENER LOGO DE TARJETA =====
  obtenerLogoTarjeta(metodo: any): string {
    let marca = 'generic';

    if (metodo.banco) {
      marca = this.detectarMarcaTarjeta(metodo.banco);
    }

    const logos: { [key: string]: string } = {
      'visa': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/visa.svg',
      'mastercard': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/mastercard.svg',
      'amex': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/amex.svg',
      'discover': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/discover.svg',
      'diners': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/diners.svg',
      'jcb': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/jcb.svg',
      'unionpay': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/unionpay.svg',
      'maestro': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/maestro.svg',
      'generic': 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/generic.svg'
    };

    return logos[marca] || logos['generic'];
  }

  // ===== OBTENER NOMBRE DE MARCA =====
  obtenerNombreMarca(metodo: any): string {
    if (!metodo.banco) return 'Tarjeta';
    
    const marca = this.detectarMarcaTarjeta(metodo.banco);
    
    const nombres: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay',
      'maestro': 'Maestro',
      'generic': metodo.banco || 'Tarjeta'
    };

    return nombres[marca] || metodo.banco;
  }

  // ===== CALCULAR TOTAL =====
  calcularTotal(): number {
    return this.producto.precio * this.cantidadComprar;
  }

  // ===== CONFIRMAR COMPRA =====
  async confirmarCompra() {
    if (!this.direccionSeleccionada) {
      alert('Debes seleccionar una dirección de envío');
      return;
    }

    if (!this.metodoPagoSeleccionado) {
      alert('Debes seleccionar un método de pago o usar "Pagar con nueva tarjeta"');
      return;
    }

    this.procesarPagoConMetodoGuardado();
  }

  // ===== PAGAR CON NUEVA TARJETA (STRIPE) =====
  async pagarConNuevaTarjeta() {
    this.metodoPagoSeleccionado = null;
    this.mostrarFormularioStripe = true;
    
    setTimeout(() => {
      const stripeSection = document.querySelector('.stripe-payment-section');
      if (stripeSection) {
        stripeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    setTimeout(async () => {
      try {
        await this.stripeService.initializeStripe('card-element');
        this.stripeInicializado = true;
        console.log('✅ Stripe inicializado para nueva tarjeta');
      } catch (error) {
        console.error('❌ Error al inicializar Stripe:', error);
        this.errorStripe = 'Error al cargar el formulario de pago';
      }
    }, 300);
  }

  // ===== PROCESAR PAGO CON STRIPE =====
  async procesarPagoConStripe() {
    this.procesandoStripe = true;
    this.errorStripe = '';

    try {
      const paymentIntentData = {
        amount: this.calcularTotal(),
        id_usuario: this.userId,
        id_producto: this.producto.id_producto,
        cantidad: this.cantidadComprar,
        descripcion: `Compra de ${this.producto.nombre}`
      };

      console.log('📤 Creando PaymentIntent...', paymentIntentData);

      const response = await this.stripeService
        .createPaymentIntent(paymentIntentData)
        .toPromise();

      console.log('✅ PaymentIntent creado:', response);

      const paymentIntent = await this.stripeService.confirmCardPayment(
        response.client_secret
      );

      console.log('✅ Pago confirmado:', paymentIntent);

      const confirmData = {
        payment_intent_id: paymentIntent.id,
        id_usuario: this.userId,
        id_producto: this.producto.id_producto,
        cantidad: this.cantidadComprar,
        precio_total: this.calcularTotal(),
        id_direccion: this.direccionSeleccionada.id_direccion
      };

      const ventaResponse = await this.stripeService
        .confirmPayment(confirmData)
        .toPromise();

      console.log('✅ Venta registrada:', ventaResponse);

      this.procesandoStripe = false;
      this.cerrarModalCheckout();
      this.stripeService.destroyElements();
      
      // Guardar ID del pedido para la calificación
      this.pedidoIdParaReview = ventaResponse.id_pedido || null;
      this.modalCompraExitosaVisible = true;

    } catch (error: any) {
      console.error('❌ Error en el pago:', error);
      this.procesandoStripe = false;
      this.errorStripe = error.message || 'Error al procesar el pago. Intenta de nuevo.';
    }
  }

  // ===== CANCELAR FORMULARIO STRIPE =====
  cancelarStripe() {
    this.mostrarFormularioStripe = false;
    this.errorStripe = '';
    if (this.stripeInicializado) {
      this.stripeService.destroyElements();
      this.stripeInicializado = false;
    }
  }

  // ===== PROCESAR CON MÉTODO GUARDADO =====
  async procesarPagoConMetodoGuardado() {
    this.procesandoPago = true;

    setTimeout(() => {
      console.log('✅ Pago procesado con método guardado');
      this.procesandoPago = false;
      this.cerrarModalCheckout();
      
      // Simular ID de pedido
      this.pedidoIdParaReview = Math.floor(Math.random() * 10000);
      this.modalCompraExitosaVisible = true;
    }, 2000);
  }

  // ===== CERRAR MODAL COMPRA EXITOSA =====
  cerrarModalCompraExitosa() {
    this.modalCompraExitosaVisible = false;
    
    // ✅ Solo mostrar modal de calificación si no ha calificado antes
    if (!this.usuarioYaCalificó) {
      setTimeout(() => {
        this.mostrarModalReview = true;
      }, 300);
    } else {
      this.router.navigate(['/perfil'], { queryParams: { seccion: 'compras' } });
    }
  }

  // ===== SEGUIR COMPRANDO DESDE ÉXITO =====
  seguirComprandoDesdeExito() {
    this.modalCompraExitosaVisible = false;
    
    // ✅ Solo mostrar modal de calificación si no ha calificado antes
    if (!this.usuarioYaCalificó) {
      setTimeout(() => {
        this.mostrarModalReview = true;
      }, 300);
    } else {
      this.router.navigate(['/']);
    }
  }

  // ===== IR A MIS COMPRAS =====
  irAMisCompras() {
    this.modalCompraExitosaVisible = false;
    
    // ✅ Solo mostrar modal de calificación si no ha calificado antes
    if (!this.usuarioYaCalificó) {
      setTimeout(() => {
        this.mostrarModalReview = true;
      }, 300);
    } else {
      this.router.navigate(['/perfil'], { queryParams: { seccion: 'compras' } });
    }
  }

  // ===== MANEJAR REVIEW CREADA =====
  onReviewCreada(review: any) {
    console.log('✅ Review creada:', review);
    this.mostrarModalReview = false;
    this.pedidoIdParaReview = null;
    this.usuarioYaCalificó = true;  // ✅ Marcar que ya calificó
    
    // ✅ Actualizar la calificación del producto en la vista
    if (this.producto) {
      this.producto.calificacion = review.calificacion || this.producto.calificacion;
      this.producto.reviews = (this.producto.reviews || 0) + 1;
    }
    
    alert('¡Gracias por tu calificación! Tu opinión es muy importante para nosotros.');
    
    this.router.navigate(['/perfil'], { queryParams: { seccion: 'compras' } });
  }

  // ===== CERRAR MODAL DE REVIEW =====
  onCerrarModalReview() {
    this.mostrarModalReview = false;
    this.pedidoIdParaReview = null;
    
    this.router.navigate(['/perfil'], { queryParams: { seccion: 'compras' } });
  }

  // ===== AGREGAR AL CARRITO =====
  agregarAlCarrito() {
    if (!this.isLoggedIn) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      this.router.navigate(['/login']);
      return;
    }

    const carritoData = {
      id_producto: this.producto.id_producto,
      cantidad: this.cantidadComprar,
      color: this.colorSeleccionado || null,
      talla: this.tallaSeleccionada || null,
      precio_unitario: this.producto.precio
    };

    console.log('🛒 Enviando al carrito:', carritoData);

    this.http.post(
      `${this.apiUrl}/carrito/?id_usuario=${this.userId}`,
      carritoData
    ).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);
        
        this.productoAgregado = {
          ...this.producto,
          cantidadAgregada: this.cantidadComprar
        };
        this.modalCarritoVisible = true;
        
        window.dispatchEvent(new CustomEvent('carritoActualizado'));
      },
      error: (error) => {
        console.error('❌ Error:', error);
        
        if (error.status === 500) {
          alert('Error del servidor. Por favor intenta de nuevo.');
        } else if (error.status === 404) {
          alert('Producto no encontrado');
        } else {
          alert('Error al agregar al carrito: ' + (error.error?.detail || 'Error desconocido'));
        }
      }
    });
  }

  // ===== CERRAR MODAL CARRITO =====
  cerrarModalCarrito() {
    this.modalCarritoVisible = false;
    this.productoAgregado = null;
  }

  // ===== IR AL CARRITO =====
  irAlCarritoDesdeModal() {
    this.cerrarModalCarrito();
    this.router.navigate(['/carrito']);
  }

  // ===== SEGUIR COMPRANDO =====
  seguirComprando() {
    this.cerrarModalCarrito();
    this.router.navigate(['/']);
  }

  // ===== AGREGAR MÉTODO DE PAGO =====
  agregarMetodoPago() {
    this.cerrarModalCheckout();
    this.router.navigate(['/configuracion'], { queryParams: { seccion: 'metodos-pago' } });
  }

  // ===== CARGAR RECOMENDACIONES IA =====
  cargarRecomendaciones() {
    if (!this.productId) return;
    
    this.cargandoRecomendaciones = true;
    
    const url = `${this.apiUrl}/recomendaciones/productos/${this.productId}/recomendaciones?limite=6`;
    
    this.http.get<any[]>(url).subscribe({
      next: (recomendaciones) => {
        console.log('🤖 Recomendaciones IA recibidas:', recomendaciones);
        
        this.productosRecomendados = recomendaciones.map((prod: any) => ({
          ...prod,
          imagen: this.construirUrlImagen(prod.imagen)
        }));
        
        this.cargandoRecomendaciones = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar recomendaciones:', error);
        this.cargandoRecomendaciones = false;
        this.productosRecomendados = [];
      }
    });
  }

  // ===== VER PRODUCTO RECOMENDADO =====
  verProductoRecomendado(productoId: number) {
    this.router.navigate(['/producto', productoId]).then(() => {
      window.scrollTo(0, 0);
      this.productId = productoId;
      this.cargarProducto();
      if (this.userId) {
        this.verificarFavorito();
        this.verificarSiYaCalificó();  // ✅ También verificar al cambiar de producto
      }
    });
  }

  // ===== USUARIO =====
  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.isLoggedIn = true;
        this.userId = parsed.id;

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

  irPerfil() {
    this.userMenuOpen = false;
    this.router.navigate(['/perfil']);
  }

  irVender() {
    this.userMenuOpen = false;
    this.router.navigate(['/vender']);
  }

  irConfiguracion() {
    this.userMenuOpen = false;
    this.router.navigate(['/configuracion']);
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