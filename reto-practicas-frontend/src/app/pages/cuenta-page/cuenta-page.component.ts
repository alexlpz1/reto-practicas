import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 

const rutaBackend = 'http://localhost:3000';


@Component({
  standalone: true,
  selector: 'app-cuenta',
  imports: [CommonModule, ReactiveFormsModule],  
  templateUrl: './cuenta-page.component.html',
  styleUrls: ['./cuenta-page.component.css']
})
export class CuentaPageComponent {
  cuentaForm: FormGroup;
  empresas: any[] = [];
  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.cuentaForm = this.fb.group({
      nombre: ['', Validators.required],  
      email: ['', [Validators.required]],  
      mensaje: ['', Validators.required], 
      empresaId: ['', Validators.required] 
    });
    this.http.get('http://localhost:3000/api/empresa').subscribe({
    next: (res: any) => this.empresas = res,
    error: () => alert('Error al obtener empresas')
  });
  }

  
  // Método que se ejecuta al enviar el formulario
  solicitudEnviada: boolean = false;

  enviarSolicitud() {
    if (this.cuentaForm.invalid) {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }
  
    this.http.post(`${rutaBackend}/api/contacto`, this.cuentaForm.value).subscribe({
      next: () => {
        this.solicitudEnviada = true;
        this.cuentaForm.reset();
      },
      error: (err) => {
        console.error('Error al enviar la solicitud:', err);
        alert('Error al enviar la solicitud.');
      }
    });
  }

}
