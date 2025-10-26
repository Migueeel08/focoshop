import { Routes } from '@angular/router';
import { FocoShopComponent } from './focoshop/focoshop.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionComponent } from './configuracionperfil/configuracionperfil.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EditPerfilComponent } from './perfil/editperfil/editperfil.component';
import { EditDireccionComponent } from './perfil/editdireccion/editdireccion.component';
import { EditPagoComponent } from './perfil/editpago/editpago.component'; // ✅ Importar

export const routes: Routes = [
  { path: '', component: FocoShopComponent },
  { path: 'login', component: LoginComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'perfil/editar', component: EditPerfilComponent },
  { path: 'perfil/editar-direccion', component: EditDireccionComponent },
  { path: 'perfil/editar-pago', component: EditPagoComponent }, // ✅ Nueva ruta
  { path: '**', redirectTo: '' }
];