import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

const rutaBackend = 'http://localhost:3000';

@Component({
  selector: 'app-usuario-panel',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario-panel.component.html',
  styleUrls: ['./usuario-panel.component.css'],
})
export class UsuarioPanelComponent implements OnInit {
  usuario: any = null;
  passwordForm: FormGroup;
  cambioOk: boolean = false;
  estadoSeleccionado = 'disponible';
  estados = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'descanso', label: 'Descanso' },
    { value: 'dia_libre', label: 'Día libre' },
  ];

   constructor(private http: HttpClient, private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      nuevaPassword: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    const userId = localStorage.getItem('usuarioId');
    if (!userId) {
      alert('No estáas logueado');
      return;
    }
    this.http.get(`${rutaBackend}/api/usuario/${userId}`).subscribe({
      next: (usuario: any) => this.usuario = usuario,
      error: () => alert('No se pudo cargar el usuario')
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) return;
    const userId = this.usuario.id;
    const nuevaPassword = this.passwordForm.value.nuevaPassword;
    this.http.put(`${rutaBackend}/api/usuario/${userId}/password`, { nuevaPassword }).subscribe({
      next: () => {
        this.cambioOk = true;
        this.passwordForm.reset();
        setTimeout(() => this.cambioOk = false, 2000);
      },
      error: () => alert('Error al cambiar la contraseña')
    });
  }

  obtenerUsuario(id: number) {
    this.http.get(`http://localhost:3000/api/usuario/${id}`).subscribe({
      next: (res: any) => {
        this.usuario = res;
        this.estadoSeleccionado = res.estado || 'disponible';
      },
      error: () => {
        alert('Error al cargar el usuario');
      },
    });
  }

  cambiarEstado() {
    if (!this.usuario) return;
    this.http.put(`http://localhost:3000/api/usuario/${this.usuario.id}/estado`, { estado: this.estadoSeleccionado })
      .subscribe({
        next: (res: any) => {
          alert('Estado actualizado');
          this.usuario.estado = this.estadoSeleccionado;
        },
        error: () => alert('No se pudo actualizar el estado')
      });
  }
}
