import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

const rutaBackend = 'http://localhost:3000';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    const { username, password } = this.form.value;

    if (username === 'superadmin' && password === 'admin123') {
      this.router.navigate(['/superadmin']);
    } else {
      this.http.post(`${rutaBackend}/api/login`, this.form.value).subscribe({
        next: (res: any) => {
          if (res.success) {
           
            localStorage.setItem('usuarioId', res.usuario.id);
            localStorage.setItem('usuario', JSON.stringify(res.usuario));

            this.router.navigate(['/empleado']);
          }
        },
        error: () => alert('Login fallido'),
      });
    }
  }




  register() {
    this.http.post(`${rutaBackend}/api/register`, this.form.value).subscribe({
      next: () => alert('Usuario registrado'),
      error: () => alert('Usuario ya existe'),
    });
  }
}
