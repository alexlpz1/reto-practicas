import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const rutaBackend = 'http://localhost:3000';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const username = localStorage.getItem('username');

    if (username) {
      this.http.get<any>(`${rutaBackend}/api/profile?username=${username}`).subscribe({
        next: (data) => {
          this.usuario = data;
          
          if (this.usuario.fechaRegistro) {
            this.usuario.fechaRegistro = new Date(this.usuario.fechaRegistro);
          }
        },
        error: (err) => {
          alert('Error al cargar el perfil');
        }
      });
    } else {
      alert('No hay usuario logueado');
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  editarPerfil() {
    alert('¡Editar perfil!');
  }
}
