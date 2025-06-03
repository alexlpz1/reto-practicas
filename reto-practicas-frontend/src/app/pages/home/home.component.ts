import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  irAEmpleado() {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    this.router.navigate(['/empleado']);
  } else {
    this.router.navigate(['/login']);
  }
}


  irACliente() {
    this.router.navigate(['/cliente']);
  }
}
