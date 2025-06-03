import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink, RouterModule],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.setUsername();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setUsername();
      }
    });
  }

  setUsername() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.username = usuario.username || '';
  }

  volver() {
    this.router.navigate(['/']);
  }

  cerrarSesion() {
  localStorage.clear();
  this.router.navigate(['/login']);
}
}
