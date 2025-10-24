import { Routes } from '@angular/router';
import { FocoShopComponent } from './focoshop/focoshop.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionComponent } from './configuracionperfil/configuracionperfil.component'; // ✅ Import agregado

export const routes: Routes = [
  { path: '', component: FocoShopComponent },
  { path: 'login', component: LoginComponent },
  { path: 'configuracion', component: ConfiguracionComponent }, // ✅ Nueva ruta agregada
  { path: '**', redirectTo: '' }
];
