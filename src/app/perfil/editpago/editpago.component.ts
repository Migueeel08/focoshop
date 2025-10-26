import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

interface TarjetaInfo {
  numero: string;
  nombreTitular: string;
  mesExpiracion: string;
  anioExpiracion: string;
  cvv: string;
  tipoTarjeta: string;
  banco: string;
  colorTarjeta: string;
}

@Component({
  selector: 'app-editpago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editpago.component.html',
  styleUrls: ['./editpago.component.css']
})
export class EditPagoComponent implements OnInit {
  user: any = {
    id: null,
    nombre: '',
    apellido: '',
    email: ''
  };

  tarjeta: TarjetaInfo = {
    numero: '',
    nombreTitular: '',
    mesExpiracion: '',
    anioExpiracion: '',
    cvv: '',
    tipoTarjeta: '',
    banco: '',
    colorTarjeta: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  tarjetaFlipped = false;
  mostrarAlerta = false;
  mensajeAlerta = '';

  meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  anios: string[] = [];

  private binesConocidos: { [key: string]: { banco: string; tipo: string; color: string } } = {
    // BBVA México
    '450904': { banco: 'BBVA', tipo: 'Visa', color: 'linear-gradient(135deg, #072146 0%, #003d82 100%)' },
    '402398': { banco: 'BBVA', tipo: 'Visa', color: 'linear-gradient(135deg, #072146 0%, #003d82 100%)' },
    '542418': { banco: 'BBVA', tipo: 'Mastercard', color: 'linear-gradient(135deg, #072146 0%, #003d82 100%)' },
    '456976': { banco: 'BBVA', tipo: 'Visa', color: 'linear-gradient(135deg, #072146 0%, #003d82 100%)' },
    
    // Santander
    '402360': { banco: 'Santander', tipo: 'Visa', color: 'linear-gradient(135deg, #ec0000 0%, #a70000 100%)' },
    '548740': { banco: 'Santander', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ec0000 0%, #a70000 100%)' },
    '402655': { banco: 'Santander', tipo: 'Visa', color: 'linear-gradient(135deg, #ec0000 0%, #a70000 100%)' },
    '451420': { banco: 'Santander', tipo: 'Visa', color: 'linear-gradient(135deg, #ec0000 0%, #a70000 100%)' },
    
    // Banamex (Citibanamex)
    '491475': { banco: 'Banamex', tipo: 'Visa', color: 'linear-gradient(135deg, #002d72 0%, #001a44 100%)' },
    '548130': { banco: 'Banamex', tipo: 'Mastercard', color: 'linear-gradient(135deg, #002d72 0%, #001a44 100%)' },
    '402608': { banco: 'Banamex', tipo: 'Visa', color: 'linear-gradient(135deg, #002d72 0%, #001a44 100%)' },
    '405231': { banco: 'Banamex', tipo: 'Visa', color: 'linear-gradient(135deg, #002d72 0%, #001a44 100%)' },
    
    // HSBC
    '474750': { banco: 'HSBC', tipo: 'Visa', color: 'linear-gradient(135deg, #db0011 0%, #8b0008 100%)' },
    '520180': { banco: 'HSBC', tipo: 'Mastercard', color: 'linear-gradient(135deg, #db0011 0%, #8b0008 100%)' },
    '456219': { banco: 'HSBC', tipo: 'Visa', color: 'linear-gradient(135deg, #db0011 0%, #8b0008 100%)' },
    
    // Scotiabank
    '450617': { banco: 'Scotiabank', tipo: 'Visa', color: 'linear-gradient(135deg, #ec1c24 0%, #b71c1c 100%)' },
    '527730': { banco: 'Scotiabank', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ec1c24 0%, #b71c1c 100%)' },
    
    // Inbursa
    '465852': { banco: 'Inbursa', tipo: 'Visa', color: 'linear-gradient(135deg, #00539f 0%, #003366 100%)' },
    '517310': { banco: 'Inbursa', tipo: 'Mastercard', color: 'linear-gradient(135deg, #00539f 0%, #003366 100%)' },
    '456418': { banco: 'Inbursa', tipo: 'Visa', color: 'linear-gradient(135deg, #00539f 0%, #003366 100%)' },
    
    // Banorte
    '491872': { banco: 'Banorte', tipo: 'Visa', color: 'linear-gradient(135deg, #ed1c24 0%, #b71c1c 100%)' },
    '542325': { banco: 'Banorte', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ed1c24 0%, #b71c1c 100%)' },
    '490605': { banco: 'Banorte', tipo: 'Visa', color: 'linear-gradient(135deg, #ed1c24 0%, #b71c1c 100%)' },
    '539884': { banco: 'Banorte', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ed1c24 0%, #b71c1c 100%)' },
    
    // American Express
    '376615': { banco: 'American Express', tipo: 'Amex', color: 'linear-gradient(135deg, #006fcf 0%, #004a8f 100%)' },
    '377130': { banco: 'American Express', tipo: 'Amex', color: 'linear-gradient(135deg, #006fcf 0%, #004a8f 100%)' },
    '374451': { banco: 'American Express', tipo: 'Amex', color: 'linear-gradient(135deg, #006fcf 0%, #004a8f 100%)' },
    
    // BanCoppel
    '517916': { banco: 'BanCoppel', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)' },
    '542910': { banco: 'BanCoppel', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)' },
    '543357': { banco: 'BanCoppel', tipo: 'Mastercard', color: 'linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)' },
    '471735': { banco: 'BanCoppel', tipo: 'Visa', color: 'linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)' },
    '471736': { banco: 'BanCoppel', tipo: 'Visa', color: 'linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)' },
    '471759': { banco: 'BanCoppel', tipo: 'Visa', color: 'linear-gradient(135deg, #ffcc00 0%, #ff9900 100%)' },
    
    // Nu (Nubank México)
    '446261': { banco: 'Nu', tipo: 'Visa', color: 'linear-gradient(135deg, #820ad1 0%, #5a0191 100%)' },
    '516644': { banco: 'Nu', tipo: 'Mastercard', color: 'linear-gradient(135deg, #820ad1 0%, #5a0191 100%)' },
    '535905': { banco: 'Nu', tipo: 'Mastercard', color: 'linear-gradient(135deg, #820ad1 0%, #5a0191 100%)' },
    '534841': { banco: 'Nu', tipo: 'Mastercard', color: 'linear-gradient(135deg, #820ad1 0%, #5a0191 100%)' },
    '536879': { banco: 'Nu', tipo: 'Mastercard', color: 'linear-gradient(135deg, #820ad1 0%, #5a0191 100%)' },
    
    // Banco Azteca
    '427697': { banco: 'Banco Azteca', tipo: 'Visa', color: 'linear-gradient(135deg, #00a84f 0%, #006b32 100%)' },
    '478524': { banco: 'Banco Azteca', tipo: 'Visa', color: 'linear-gradient(135deg, #00a84f 0%, #006b32 100%)' },
    '533278': { banco: 'Banco Azteca', tipo: 'Mastercard', color: 'linear-gradient(135deg, #00a84f 0%, #006b32 100%)' },
    '542394': { banco: 'Banco Azteca', tipo: 'Mastercard', color: 'linear-gradient(135deg, #00a84f 0%, #006b32 100%)' },
    '542629': { banco: 'Banco Azteca', tipo: 'Mastercard', color: 'linear-gradient(135deg, #00a84f 0%, #006b32 100%)' },
    
    // Afirme
    '451428': { banco: 'Afirme', tipo: 'Visa', color: 'linear-gradient(135deg, #005eb8 0%, #003d7a 100%)' },
    '542449': { banco: 'Afirme', tipo: 'Mastercard', color: 'linear-gradient(135deg, #005eb8 0%, #003d7a 100%)' },
    
    // Banregio
    '450803': { banco: 'Banregio', tipo: 'Visa', color: 'linear-gradient(135deg, #003da5 0%, #002366 100%)' },
    '542537': { banco: 'Banregio', tipo: 'Mastercard', color: 'linear-gradient(135deg, #003da5 0%, #002366 100%)' },
  };

  constructor(
    private router: Router,
    private usuarioService: UsuariosService
  ) {
    const anioActual = new Date().getFullYear();
    for (let i = 0; i < 11; i++) {
      this.anios.push((anioActual + i).toString().slice(-2));
    }
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    
    if (!userString) {
      alert('No se encontró información del usuario');
      this.router.navigate(['/login']);
      return;
    }

    const userData = JSON.parse(userString);
    this.user = {
      id: userData.id || userData.id_usuario,
      nombre: userData.nombre || '',
      apellido: userData.apellido || '',
      email: userData.email || ''
    };

    this.tarjeta.nombreTitular = `${this.user.nombre} ${this.user.apellido}`.toUpperCase();

    if (userData.tarjeta) {
      this.cargarTarjetaGuardada(userData.tarjeta);
    }
  }

  cargarTarjetaGuardada(numeroTarjeta: string): void {
    if (numeroTarjeta && numeroTarjeta.length >= 4) {
      this.tarjeta.numero = '**** **** **** ' + numeroTarjeta.slice(-4);
    }
  }

  onNumeroChange(): void {
    let numero = this.tarjeta.numero.replace(/\s/g, '');
    
    if (numero.length > 0) {
      numero = numero.match(/.{1,4}/g)?.join(' ') || numero;
      this.tarjeta.numero = numero;
    }

    const numeroLimpio = this.tarjeta.numero.replace(/\s/g, '');
    
    if (numeroLimpio.length >= 6) {
      const bin = numeroLimpio.substring(0, 6);
      
      if (this.binesConocidos[bin]) {
        const info = this.binesConocidos[bin];
        this.tarjeta.banco = info.banco;
        this.tarjeta.tipoTarjeta = info.tipo;
        this.tarjeta.colorTarjeta = info.color;
      } else {
        this.detectarTipoGenerico(numeroLimpio);
      }
    }

    if (this.tarjeta.numero.length > 19) {
      this.tarjeta.numero = this.tarjeta.numero.substring(0, 19);
    }
  }

  detectarTipoGenerico(numero: string): void {
    const primerDigito = numero.charAt(0);
    
    switch (primerDigito) {
      case '4':
        this.tarjeta.tipoTarjeta = 'Visa';
        this.tarjeta.colorTarjeta = 'linear-gradient(135deg, #1a1f71 0%, #0d1238 100%)';
        this.tarjeta.banco = 'Visa';
        break;
      case '5':
        this.tarjeta.tipoTarjeta = 'Mastercard';
        this.tarjeta.colorTarjeta = 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)';
        this.tarjeta.banco = 'Mastercard';
        break;
      case '3':
        if (numero.charAt(1) === '7') {
          this.tarjeta.tipoTarjeta = 'Amex';
          this.tarjeta.colorTarjeta = 'linear-gradient(135deg, #006fcf 0%, #004a8f 100%)';
          this.tarjeta.banco = 'American Express';
        }
        break;
      default:
        this.tarjeta.tipoTarjeta = 'Genérica';
        this.tarjeta.colorTarjeta = 'linear-gradient(135deg, #424242 0%, #212121 100%)';
        this.tarjeta.banco = 'Desconocido';
    }
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onNombreChange(): void {
    this.tarjeta.nombreTitular = this.tarjeta.nombreTitular.toUpperCase();
  }

  flipCard(show: boolean): void {
    this.tarjetaFlipped = show;
  }

  validarTarjeta(): boolean {
    const numero = this.tarjeta.numero.replace(/\s/g, '');
    
    if (numero.length < 13 || numero.length > 19) {
      return false;
    }

    let suma = 0;
    let esSegundoDigito = false;

    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i));

      if (esSegundoDigito) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }

      suma += digito;
      esSegundoDigito = !esSegundoDigito;
    }

    return suma % 10 === 0;
  }

  guardarTarjeta(): void {
    const numeroLimpio = this.tarjeta.numero.replace(/\s/g, '');
    
    if (!numeroLimpio || numeroLimpio.length < 13) {
      alert('Por favor ingresa un número de tarjeta válido');
      return;
    }

    if (!this.validarTarjeta()) {
      alert('El número de tarjeta no es válido');
      return;
    }

    if (!this.tarjeta.nombreTitular) {
      alert('Por favor ingresa el nombre del titular');
      return;
    }

    if (!this.tarjeta.mesExpiracion || !this.tarjeta.anioExpiracion) {
      alert('Por favor selecciona la fecha de expiración');
      return;
    }

    if (!this.tarjeta.cvv || this.tarjeta.cvv.length < 3) {
      alert('Por favor ingresa un CVV válido');
      return;
    }

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = parseInt(hoy.getFullYear().toString().slice(-2));
    const mesExp = parseInt(this.tarjeta.mesExpiracion);
    const anioExp = parseInt(this.tarjeta.anioExpiracion);

    if (anioExp < anioActual || (anioExp === anioActual && mesExp < mesActual)) {
      alert('La tarjeta ha expirado');
      return;
    }

    const userId = this.user.id;

    if (!userId) {
      alert('Error: No se encontró el ID del usuario');
      return;
    }

    const ultimosCuatroDigitos = numeroLimpio.slice(-4);

    const datosActualizar = {
      tarjeta: ultimosCuatroDigitos,
      tipo_tarjeta: this.tarjeta.tipoTarjeta
    };

    console.log('💳 Guardando método de pago...');

    this.usuarioService.actualizarUsuario(userId, datosActualizar).subscribe({
      next: (response: any) => {
        console.log('✅ Método de pago actualizado:', response);

        const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
        userStorage.tarjeta = ultimosCuatroDigitos;
        userStorage.tipo_tarjeta = this.tarjeta.tipoTarjeta;
        localStorage.setItem('user', JSON.stringify(userStorage));
        this.usuarioService.setUsuarioActual(userStorage);

        this.mensajeAlerta = '¡Método de pago actualizado correctamente!';
        this.mostrarAlerta = true;

        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 2000);
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar método de pago:', err);
        alert('No se pudo actualizar el método de pago: ' + (err.error?.detail || 'Error desconocido'));
      }
    });
  }

  volver(): void {
    this.router.navigate(['/perfil']);
  }
}