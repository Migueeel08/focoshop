import { Routes } from '@angular/router';
import { FocoShopComponent } from './focoshop/focoshop.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionComponent } from './configuracionperfil/configuracionperfil.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EditPerfilComponent } from './perfil/editperfil/editperfil.component';
import { EditDireccionComponent } from './perfil/editdireccion/editdireccion.component';
import { EditPagoComponent } from './perfil/editpago/editpago.component';
import { VenderComponent } from './vender/vender.component';
import { DetalleProductoComponent } from './detalle-producto/detalle-producto.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component'; // ✅ NUEVO
import { AdminUsuariosComponent } from './admin/admin-usuarios/admin-usuarios.component'; // ✅ NUEVO
import { AdminProductosComponent } from './admin/admin-productos/admin-productos.component'; // ✅ NUEVO
import { AdminCategoriasComponent } from './admin/admin-categorias/admin-categorias.component'; // ✅ NUEVO
import { adminGuard } from './guards/admin.guard'; // ✅ NUEVO
import { authGuard } from './guards/auth.guard'; // ✅ NUEVO

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: FocoShopComponent },
  { path: 'login', component: LoginComponent },
  { path: 'producto/:id', component: DetalleProductoComponent },
  
  // Rutas protegidas (usuarios autenticados)
  { 
    path: 'vender', 
    component: VenderComponent,
    canActivate: [authGuard] // ✅ Solo usuarios autenticados
  },
  { 
    path: 'configuracion', 
    component: ConfiguracionComponent,
    canActivate: [authGuard] // ✅ Solo usuarios autenticados
  },
  { 
    path: 'perfil', 
    component: PerfilComponent,
    canActivate: [authGuard] // ✅ Solo usuarios autenticados
  },
  { 
    path: 'perfil/editar', 
    component: EditPerfilComponent,
    canActivate: [authGuard] // ✅ Solo usuarios autenticados
  },
  { 
    path: 'perfil/editar-direccion', 
    component: EditDireccionComponent,
    canActivate: [authGuard] // ✅ Solo usuarios autenticados
  },
  { 
    path: 'perfil/editar-pago', 
    component: EditPagoComponent,
    canActivate: [authGuard] // ✅ Solo usuarios autenticados
  },
  
  // ✅ RUTAS ADMIN (solo administradores)
  { 
    path: 'admin', 
    component: AdminPanelComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/usuarios', 
    component: AdminUsuariosComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/productos', 
    component: AdminProductosComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/categorias', 
    component: AdminCategoriasComponent,
    canActivate: [adminGuard]
  },
  
  // Ruta 404
  { path: '**', redirectTo: '' }
];