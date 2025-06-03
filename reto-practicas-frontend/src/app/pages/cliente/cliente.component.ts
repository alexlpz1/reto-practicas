import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet  } from '@angular/router';

const rutaBackend = 'http://localhost:3000';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css'],
  imports: [CommonModule, FormsModule, RouterOutlet],
})

export class ClienteComponent implements OnInit {
  nombre = '';
  fecha = '';
  hora = ''; 
  horaMinutos = '00';
  horas: string[] = []; 
  minutos: string[] = [];  
  dni = '';
  mensaje = '';
  empresaId: string | null = null;
  tickets: any[] = [];
  empresas: any[] = [];
  enRutaVerTickets = false;
  horasOcupadas: string[] = [];
  horasDisponibles: string[] = [];
  dniBuscar = '';
  

  constructor(private http: HttpClient, private router: Router) {
    this.obtenerEmpresas();
    this.setMinutesOptions();
  }

  onEmpresaChange() {
  this.hora = '';
  this.horasDisponibles = [];
}

  ngOnInit() {
    this.setAvailableHours();
    this.router.events.subscribe(() => {
      this.enRutaVerTickets = this.router.url.endsWith('/ver-tickets');
    });
  }

  onDniBuscarChange() {
  if (this.dniBuscar) {
    this.consultarTickets();
  } else {
    this.tickets = [];
  }
}

  consultarTickets() {
  this.http.get<any[]>(`http://localhost:3000/api/ticket?dni=${this.dniBuscar}`).subscribe({
    next: (res) => this.tickets = res,
    error: () => this.tickets = []
  });
}

  // Configurar las opciones de minutos de 10 en 10
  setMinutesOptions() {
    this.minutos = [];
    for (let i = 0; i < 60; i += 10) {
      this.minutos.push(i < 10 ? `0${i}` : `${i}`);
    }
  }

  // Obtener las empresas disponibles
  obtenerEmpresas() {
    this.http.get<any[]>(`${rutaBackend}/api/empresa`).subscribe({
      next: (res) => {
        this.empresas = res;
      },
      error: (err) => {
        alert('Error al obtener las empresas');
      }
    });
  }

  obtenerHorasDisponibles() {
  if (!this.empresaId || !this.fecha) {
    this.horasDisponibles = [];
    return;
  }
  this.http.get<any[]>(`http://localhost:3000/api/ticket?empresaId=${this.empresaId}&fecha=${this.fecha}`)
    .subscribe({
      next: (res) => {
        const ocupadas = res.map(t => t.hora);
        this.horasDisponibles = this.generarHoras().filter(h => !ocupadas.includes(h));
      },
      error: () => {
        this.horasDisponibles = [];
        alert('Error al obtener las horas disponibles');
      }
    });
}
  generarHoras(): string[] {
  const horas: string[] = [];
  for (let h = 9; h < 20; h++) {
    for (let m = 0; m < 60; m += 10) {
      horas.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return horas;
}
setAvailableHours() {
    const availableHours = [];
    for (let i = 9; i < 20; i++) {
      availableHours.push(`${i < 10 ? '0' + i : i}:00`);
      availableHours.push(`${i < 10 ? '0' + i : i}:10`);
      availableHours.push(`${i < 10 ? '0' + i : i}:20`);
      availableHours.push(`${i < 10 ? '0' + i : i}:30`);
      availableHours.push(`${i < 10 ? '0' + i : i}:40`);
      availableHours.push(`${i < 10 ? '0' + i : i}:50`);
    }
    this.horas = availableHours;
  }

  // Obtener los tickets ocupados para el día seleccionado
  obtenerTicketsOcupados() {
    if (!this.fecha) return;

    this.http.get<any[]>(`${rutaBackend}/api/ticket?fecha=${this.fecha}`).subscribe({
      next: (res) => {
        this.horasOcupadas = res.map(ticket => ticket.hora);
        this.setAvailableHours();  
        this.filterAvailableHours(); 
      },
      error: (err) => {
        console.error('Error al obtener los tickets:', err);
        alert('Error al obtener los tickets');
      }
    });
  }

  // Filtrar las horas ocupadas
  filterAvailableHours() {
    this.horas = this.horas.filter(hour => !this.horasOcupadas.includes(hour));
  }

  // Crear ticket
  crearTicket() {
    if (!this.nombre || !this.fecha || !this.hora || !this.dni || !this.mensaje || !this.empresaId) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const payload = { 
      nombre: this.nombre, 
      fecha: this.fecha, 
      hora: this.hora, 
      dni: this.dni, 
      mensaje: this.mensaje, 
      empresaId: this.empresaId

    };

    this.http.post(`${rutaBackend}/api/ticket`, payload).subscribe({
      next: () => {
        alert('✅ Ticket creado');
        this.mensaje = '';
        this.obtenerTicketsOcupados();  
      },
      error: () => {
        alert('❌ Error al crear el ticket');
      }
    });
  }

  // Ver tickets
 verTickets() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  let url = `${rutaBackend}/api/ticket?`;

  const empresaId = usuario.empresaId;
  if (empresaId) {
    url += `empresaId=${empresaId}&`;
  }

  const dni = usuario.dni;
  if (dni) {
    url += `dni=${encodeURIComponent(dni)}&`;
  }

  const fecha = this.fecha;
  if (fecha) {
    url += `fecha=${encodeURIComponent(fecha)}&`;
  }

  url = url.slice(0, -1);  

  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.tickets = res;
    },
    error: (err) => {
      console.error('❌ Error al obtener los tickets:', err);
      alert('❌ Error al obtener los tickets');
    }
  });
}




  // Borrar ticket
  borrarTicket(id: number) {
    if (!confirm('¿Estás seguro de que quieres borrar este ticket?')) return;

    this.http.delete(`${rutaBackend}/api/ticket/${id}`).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t.id !== id);
        alert('🗑 Ticket eliminado');
      },
      error: () => {
        alert('❌ Error al eliminar el ticket');
      }
    });
  }
}
