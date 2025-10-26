import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { HttpClient } from '@angular/common/http';

interface Estado {
  nombre: string;
  codigo: string;
}

interface CPData {
  estado: string;
  municipio: string;
  colonias: string[];
}

@Component({
  selector: 'app-editdireccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editdireccion.component.html',
  styleUrls: ['./editdireccion.component.css']
})
export class EditDireccionComponent implements OnInit {
  user: any = {
    id: null,
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  };

  direccion: any = {
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    codigoPostal: '',
    ciudad: '',
    estado: '',
    pais: 'México',
    referencias: ''
  };

  paises: string[] = ['México', 'Estados Unidos', 'Canadá'];
  
  estadosMexico: Estado[] = [
    { nombre: 'Aguascalientes', codigo: 'AGS' },
    { nombre: 'Baja California', codigo: 'BC' },
    { nombre: 'Baja California Sur', codigo: 'BCS' },
    { nombre: 'Campeche', codigo: 'CAM' },
    { nombre: 'Chiapas', codigo: 'CHIS' },
    { nombre: 'Chihuahua', codigo: 'CHIH' },
    { nombre: 'Ciudad de México', codigo: 'CDMX' },
    { nombre: 'Coahuila', codigo: 'COAH' },
    { nombre: 'Colima', codigo: 'COL' },
    { nombre: 'Durango', codigo: 'DGO' },
    { nombre: 'Guanajuato', codigo: 'GTO' },
    { nombre: 'Guerrero', codigo: 'GRO' },
    { nombre: 'Hidalgo', codigo: 'HGO' },
    { nombre: 'Jalisco', codigo: 'JAL' },
    { nombre: 'México', codigo: 'MEX' },
    { nombre: 'Michoacán', codigo: 'MICH' },
    { nombre: 'Morelos', codigo: 'MOR' },
    { nombre: 'Nayarit', codigo: 'NAY' },
    { nombre: 'Nuevo León', codigo: 'NL' },
    { nombre: 'Oaxaca', codigo: 'OAX' },
    { nombre: 'Puebla', codigo: 'PUE' },
    { nombre: 'Querétaro', codigo: 'QRO' },
    { nombre: 'Quintana Roo', codigo: 'QROO' },
    { nombre: 'San Luis Potosí', codigo: 'SLP' },
    { nombre: 'Sinaloa', codigo: 'SIN' },
    { nombre: 'Sonora', codigo: 'SON' },
    { nombre: 'Tabasco', codigo: 'TAB' },
    { nombre: 'Tamaulipas', codigo: 'TAMPS' },
    { nombre: 'Tlaxcala', codigo: 'TLAX' },
    { nombre: 'Veracruz', codigo: 'VER' },
    { nombre: 'Yucatán', codigo: 'YUC' },
    { nombre: 'Zacatecas', codigo: 'ZAC' }
  ];

  estadosUSA: Estado[] = [
    { nombre: 'California', codigo: 'CA' },
    { nombre: 'Texas', codigo: 'TX' },
    { nombre: 'Florida', codigo: 'FL' },
    { nombre: 'New York', codigo: 'NY' },
    { nombre: 'Arizona', codigo: 'AZ' }
  ];

  estadosCanada: Estado[] = [
    { nombre: 'Ontario', codigo: 'ON' },
    { nombre: 'Quebec', codigo: 'QC' },
    { nombre: 'British Columbia', codigo: 'BC' },
    { nombre: 'Alberta', codigo: 'AB' }
  ];

  estadosDisponibles: Estado[] = [];
  colonias: string[] = [];
  
  buscandoCP = false;
  cpEncontrado = false;
  errorCP = false;

  mostrarAlerta = false;
  mensajeAlerta = '';

  // ✅ Cache de códigos postales
  private cpDatabase: { [key: string]: CPData } = {};

  constructor(
    private router: Router,
    private usuarioService: UsuariosService,
    private http: HttpClient
  ) {}

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
      email: userData.email || '',
      telefono: userData.telefono || ''
    };

    this.cargarEstados();
    
    // ✅ Cargar base de datos de códigos postales
    this.cargarCodigosPostales();

    if (userData.direccion && userData.direccion.trim() !== '') {
      this.parsearDireccion(userData.direccion);
    }
  }

  // ✅ Cargar base de datos local de códigos postales
  cargarCodigosPostales(): void {
    this.http.get<{ [key: string]: CPData }>('assets/CP_descaga.txt')
      .subscribe({
        next: (data) => {
          this.cpDatabase = data;
          console.log('✅ Base de datos de CPs cargada:', Object.keys(data).length, 'códigos postales');
        },
        error: (error) => {
          console.error('❌ Error al cargar base de datos de CPs:', error);
        }
      });
  }

  cargarEstados(): void {
    switch (this.direccion.pais) {
      case 'México':
        this.estadosDisponibles = this.estadosMexico;
        break;
      case 'Estados Unidos':
        this.estadosDisponibles = this.estadosUSA;
        break;
      case 'Canadá':
        this.estadosDisponibles = this.estadosCanada;
        break;
      default:
        this.estadosDisponibles = [];
    }
  }

  onPaisChange(): void {
    this.direccion.estado = '';
    this.direccion.ciudad = '';
    this.direccion.colonia = '';
    this.direccion.codigoPostal = '';
    this.colonias = [];
    this.cpEncontrado = false;
    this.errorCP = false;
    this.cargarEstados();
  }

  // ✅ Buscar código postal en base de datos local
  buscarPorCodigoPostal(): void {
    const cp = this.direccion.codigoPostal.trim();

    if (cp.length !== 5 || !/^\d{5}$/.test(cp) || this.direccion.pais !== 'México') {
      return;
    }

    this.buscandoCP = true;
    this.errorCP = false;
    this.cpEncontrado = false;
    this.colonias = [];

    console.log('🔍 Buscando CP:', cp);

    // Simular pequeña demora para mejor UX
    setTimeout(() => {
      if (this.cpDatabase[cp]) {
        const datos = this.cpDatabase[cp];
        
        // Autocompletar datos
        this.direccion.estado = datos.estado;
        this.direccion.ciudad = datos.municipio;
        this.colonias = datos.colonias;
        
        if (this.colonias.length > 0) {
          this.direccion.colonia = this.colonias[0];
        }

        this.cpEncontrado = true;
        this.buscandoCP = false;
        
        console.log('✅ CP encontrado');
        console.log('📍 Estado:', this.direccion.estado);
        console.log('🏙️ Ciudad:', this.direccion.ciudad);
        console.log('🏘️ Colonias:', this.colonias);
      } else {
        this.errorCP = true;
        this.buscandoCP = false;
        console.log('❌ CP no encontrado en la base de datos');
      }
    }, 500);
  }

  parsearDireccion(direccionString: string): void {
    const partes = direccionString.split(',').map(p => p.trim());
    
    if (partes.length >= 4) {
      this.direccion.calle = partes[0]?.split('#')[0]?.trim() || '';
      this.direccion.numeroExterior = partes[0]?.split('#')[1]?.split('Int')[0]?.trim() || '';
      
      if (partes[0]?.includes('Int')) {
        this.direccion.numeroInterior = partes[0]?.split('Int')[1]?.trim() || '';
      }
      
      this.direccion.colonia = partes[1] || '';
      this.direccion.codigoPostal = partes[2]?.replace('CP', '').trim() || '';
      this.direccion.ciudad = partes[3] || '';
      this.direccion.estado = partes[4] || '';
      this.direccion.pais = partes[5] || 'México';
      
      if (direccionString.includes('| Ref:')) {
        this.direccion.referencias = direccionString.split('| Ref:')[1]?.trim() || '';
      }
    }
    
    this.cargarEstados();
  }

  guardarDireccion(): void {
    if (!this.direccion.calle || !this.direccion.numeroExterior || 
        !this.direccion.colonia || !this.direccion.codigoPostal ||
        !this.direccion.ciudad || !this.direccion.estado || !this.direccion.pais) {
      alert('Por favor completa todos los campos obligatorios (marcados con *)');
      return;
    }

    let direccionCompleta = `${this.direccion.calle} #${this.direccion.numeroExterior}`;
    
    if (this.direccion.numeroInterior) {
      direccionCompleta += `, Int ${this.direccion.numeroInterior}`;
    }
    
    direccionCompleta += `, ${this.direccion.colonia}, CP ${this.direccion.codigoPostal}, ${this.direccion.ciudad}, ${this.direccion.estado}, ${this.direccion.pais}`;
    
    if (this.direccion.referencias) {
      direccionCompleta += ` | Ref: ${this.direccion.referencias}`;
    }

    const userId = this.user.id;

    if (!userId) {
      alert('Error: No se encontró el ID del usuario');
      return;
    }

    const datosActualizar = {
      direccion: direccionCompleta
    };

    console.log('💾 Guardando dirección:', direccionCompleta);

    this.usuarioService.actualizarUsuario(userId, datosActualizar).subscribe({
      next: (response: any) => {
        console.log('✅ Dirección actualizada:', response);

        const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
        userStorage.direccion = direccionCompleta;
        localStorage.setItem('user', JSON.stringify(userStorage));
        this.usuarioService.setUsuarioActual(userStorage);

        this.mensajeAlerta = '¡Dirección actualizada correctamente!';
        this.mostrarAlerta = true;

        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 2000);
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar dirección:', err);
        alert('No se pudo actualizar la dirección: ' + (err.error?.detail || 'Error desconocido'));
      }
    });
  }

  volver(): void {
    this.router.navigate(['/perfil']);
  }
}