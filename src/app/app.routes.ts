import { Routes } from '@angular/router';
import { FocoShopComponent } from './focoshop/focoshop.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: FocoShopComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' } // si no existe la ruta, vuelve a inicio
];
