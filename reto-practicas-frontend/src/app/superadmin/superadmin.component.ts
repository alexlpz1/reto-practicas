import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-superadmin',
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css'],
  imports: [CommonModule, FormsModule],
})

export class SuperadminComponent implements OnInit {
  superadminOptions = [
    'Ver todos los usuarios',
    'Ver Solicitudes de cuentas',
    'Crear cuenta de empleado',
    'Gestionar Empresas'
  ];

  mostrarFormulario: boolean = false;
  mostrarSolicitudes: boolean = false;
  mostrarUsuarios: boolean = false;
  mostrarEmpresas: boolean = false;
  usuarios: any[] = [];
  solicitudes: any[] = [];
  empresaNombre: string = '';
  empresaActivo: boolean = true;
  empresas: any[] = [];  
  empresaId: number | null = null;
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    
    this.obtenerEmpresas();
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    this.mostrarSolicitudes = false;
    this.mostrarUsuarios = false;
    this.mostrarEmpresas = false;
  }

  toggleSolicitudes() {
    this.mostrarSolicitudes = !this.mostrarSolicitudes;
    this.mostrarFormulario = false;
    this.mostrarUsuarios = false;
    this.mostrarEmpresas = false;
    if (this.mostrarSolicitudes) {
      this.obtenerSolicitudes();
    }
  }

  toggleUsuarios() {
    this.mostrarUsuarios = !this.mostrarUsuarios;
    this.mostrarFormulario = false;
    this.mostrarSolicitudes = false;
    this.mostrarEmpresas = false;
    if (this.mostrarUsuarios) {
      this.obtenerUsuarios();
    }
  }

  toggleEmpresas() {
    this.mostrarEmpresas = !this.mostrarEmpresas;
    this.mostrarFormulario = false;
    this.mostrarSolicitudes = false;
    this.mostrarUsuarios = false;
    if (this.mostrarEmpresas) {
      this.obtenerEmpresas();
    }
  }

  obtenerUsuarios() {
  this.http.get('http://localhost:3000/api/usuarios').subscribe({
    next: (res: any) => {
      this.usuarios = res;  
    },
    error: (err) => {
      console.error('Error al obtener los usuarios:', err);
      alert('Error al obtener los usuarios');
    },
  });
}


  obtenerSolicitudes() {
    this.http.get('http://localhost:3000/api/solicitudes').subscribe({
      next: (res: any) => {
        this.solicitudes = res;
      },
      error: (err) => {
        console.error('Error al obtener las solicitudes:', err);
        alert('Error al obtener las solicitudes');
      },
    });
  }

  // Obtener las empresas disponibles
  obtenerEmpresas() {
    this.http.get('http://localhost:3000/api/empresa').subscribe({
      next: (res: any) => {
        this.empresas = res;
        console.log('Empresas obtenidas:', this.empresas); 
      },
      error: (err) => {
        console.error('Error al obtener las empresas:', err);
        alert('Error al obtener las empresas');
      },
    });
  }

  // Función para crear o editar empresa
  crearOeditarEmpresa() {
    const payload = {
      nombre: this.empresaNombre,
      activo: this.empresaActivo,
    };

    if (this.empresaId) {
      this.http
        .put(`http://localhost:3000/api/empresa/${this.empresaId}`, payload)
        .subscribe({
          next: () => {
            alert('Empresa actualizada');
            this.obtenerEmpresas();
            this.resetForm();
          },
          error: (err) => {
            alert('Error al actualizar la empresa');
          },
        });
    } else {
      this.http.post('http://localhost:3000/api/empresa', payload).subscribe({
        next: () => {
          alert('Empresa creada');
          this.obtenerEmpresas();
          this.resetForm();
        },
        error: (err) => {
          alert('Error al crear la empresa');
        },
      });
    }
  }

  // Función para eliminar empresa
  eliminarEmpresa(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      this.http.delete(`http://localhost:3000/api/empresa/${id}`).subscribe({
        next: () => {
          alert('Empresa eliminada');
          this.obtenerEmpresas(); 
        },
        error: (err) => {
          alert('Error al eliminar la empresa');
        }
      });
    }
  }

  // Función para editar empresa
  editarEmpresa(id: number) {
    this.http.get(`http://localhost:3000/api/empresa/${id}`).subscribe({
      next: (empresa: any) => {
        this.empresaId = empresa.id;
        this.empresaNombre = empresa.nombre;
        this.empresaActivo = empresa.activo;
      },
      error: (err) => {
        console.error('Error al obtener los detalles de la empresa:', err);
        alert('Error al obtener detalles de la empresa');
      }
    });
  }

  // Limpiar el formulario después de crear o editar empresa
  resetForm() {
    this.empresaId = null;
    this.empresaNombre = '';
    this.empresaActivo = true;
  }

  // Función para eliminar usuario
  eliminarUsuario(id: number) {
    this.http.delete(`http://localhost:3000/api/usuarios/${id}`).subscribe({
      next: () => {
        alert('Usuario eliminado');
        this.obtenerUsuarios();
      },
      error: (err) => {
        alert('Error al eliminar el usuario');
      },
    });
  }

  crearCuentaDesdeSolicitud(solicitud: any) {
  // Contraseña por defecto
  const password = "123456";
  const payload = {
    username: solicitud.email,
    password,
    empresaId: solicitud.empresaId
  };

  this.http.post('http://localhost:3000/api/register-employee', payload).subscribe({
    next: () => {
      alert('Cuenta creada con contraseña 123456');
      this.eliminarSolicitud(solicitud.id);
      this.obtenerUsuarios();
    },
    error: () => alert('Error al crear la cuenta')
  });
}

  // Función para eliminar solicitud
  eliminarSolicitud(id: number) {
    this.http.delete(`http://localhost:3000/api/solicitudes/${id}`).subscribe({
      next: () => {
        alert('Solicitud eliminada');
        this.obtenerSolicitudes();
      },
      error: (err) => {
        alert('Error al eliminar la solicitud');
      },
    });
  }

  // Función para crear un empleado
  crearEmpleado() {
    if (!this.empresaId) {
      alert('Por favor, selecciona una empresa.');
      return;
    }

    const payload = {
      username: this.username,
      password: this.password,
      empresaId: this.empresaId, 
    };

    this.http.post('http://localhost:3000/api/register-employee', payload).subscribe({
      next: () => {
        alert('Empleado creado con éxito');
        this.username = '';
        this.password = '';
        this.empresaId = null;
      },
      error: (err) => {
        alert('Error al crear el empleado');
      },
    });
  }
}
