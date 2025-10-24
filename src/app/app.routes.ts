import { Routes } from '@angular/router';
import { FocoShopComponent } from './focoshop/focoshop.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionComponent } from './configuracionperfil/configuracionperfil.component';
import { PerfilComponent } from './perfil/perfil.component'; // ✅ Import nuevo

export const routes: Routes = [
  { path: '', component: FocoShopComponent },
  { path: 'login', component: LoginComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: 'perfil', component: PerfilComponent }, // ✅ Nueva ruta
  { path: '**', redirectTo: '' }
];
