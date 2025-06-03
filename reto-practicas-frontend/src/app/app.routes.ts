import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SuperadminComponent } from './superadmin/superadmin.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { CuentaPageComponent } from './pages/cuenta-page/cuenta-page.component';
import { TicketsAsignadosComponent } from './pages/empleado/tickets-asignados/tickets-asignados.component';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { TusTicketsComponent } from './pages/cliente/tus-tickets/tus-tickets.component';
import { UsuarioPanelComponent } from './pages/usuario-panel/usuario-panel.component';
import { AuthGuard } from './auth.guard';
export const routes: Routes = [
  
  { path: '', component: HomeComponent },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'cliente', 
    component: ClienteComponent, 
    children: [
      { path: 'ver-tickets', component: TusTicketsComponent },
    ]
  },
  { path: 'empleado', loadComponent: () => import('./pages/empleado/empleado.component').then(m => m.EmpleadoComponent) },
  { path: 'superadmin', component: SuperadminComponent }, 
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'cuenta', component: CuentaPageComponent },
  { path: 'tickets-asignados', component: TicketsAsignadosComponent }, 
  { path: 'usuario', component: UsuarioPanelComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' } 


];
