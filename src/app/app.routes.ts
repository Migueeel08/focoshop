import { Routes } from '@angular/router';
import { FocoShopComponent } from './focoshop/focoshop.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionComponent } from './configuracionperfil/configuracionperfil.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EditPerfilComponent } from './perfil/editperfil/editperfil.component';
import { EditDireccionComponent } from './perfil/editdireccion/editdireccion.component';
import { EditPagoComponent } from './perfil/editpago/editpago.component';
import { VenderComponent } from './vender/vender.component';
import { DetalleProductoComponent } from './detalle-producto/detalle-producto.component'; // ✅ AGREGAR ESTA LÍNEA

export const routes: Routes = [
  { path: '', component: FocoShopComponent },
  { path: 'login', component: LoginComponent },
  { path: 'vender', component: VenderComponent },
  { path: 'producto/:id', component: DetalleProductoComponent }, // ✅ AGREGAR ESTA RUTA
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'perfil/editar', component: EditPerfilComponent },
  { path: 'perfil/editar-direccion', component: EditDireccionComponent },
  { path: 'perfil/editar-pago', component: EditPagoComponent },
  { path: '**', redirectTo: '' }
];