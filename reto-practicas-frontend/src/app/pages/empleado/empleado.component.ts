import { Component, OnInit } from '@angular/core'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink, FormsModule],
})
export class EmpleadoComponent implements OnInit {
  tickets: any[] = [];
  ticketsAsignados: any[] = [];
  empresaId: number | null = null;
  usuarioId: number | null = null;
  mostrarAsignados: boolean = false;
  estadoEmpleado: boolean = false

  constructor(private http: HttpClient, private router: Router,) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario) {
      this.router.navigate(['/empleado']);
      return;
    }

    this.empresaId = usuario.empresaId;
    this.obtenerTicketsPendientes();
  }

  cambiarEstado() {
  const id = "";
  this.http.put(`http://localhost:3000/api/usuario/${id}/estado`, { estado: this.estadoEmpleado }).subscribe();
}

verTicketsAsignados() {
    if (!this.usuarioId) {
      alert('No se ha encontrado el id del usuario');
      return;
    }
    this.http.get(`http://localhost:3000/api/tickets-asignados/${this.usuarioId}`).subscribe({
      next: (res: any) => {
        this.ticketsAsignados = res;
        this.mostrarAsignados = true;
      },
      error: (err) => {
        console.error('Error al obtener los tickets asignados:', err);
        alert('Error al obtener los tickets asignados');
      }
    });
  }
// Obtener el empresaId del empleado desde el localStorage
obtenerEmpresaId() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}'); 
  this.empresaId = usuario.empresaId; 
}

asignarTicket(ticketId: number) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const usuarioId = usuario.id;
  if (!usuarioId) {
    alert('No se ha encontrado el id del usuario');
    return;
  }
  this.http.put(`http://localhost:3000/api/ticket/${ticketId}/asignar`, { usuarioId }).subscribe({
    next: () => {
      alert('Ticket asignado');
      this.obtenerTicketsPendientes(); 
    },
    error: (err) => {
      console.error('Error al asignar el ticket:', err);
      alert('Error al asignar el ticket');
    }
  });
}



  // Obtener todos los tickets asociados al empresaId
obtenerTicketsPendientes() {
  if (!this.empresaId) {
    alert('Empresa no asociada');
    return;
  }

  this.http.get(`http://localhost:3000/api/ticket?empresaId=${this.empresaId}`).subscribe({
    next: (res: any) => {
      this.tickets = res.filter((ticket: any) => !ticket.asignadoA);
    },
    error: (err) => {
      console.error('Error al obtener los tickets:', err);
      alert('Error al obtener los tickets');
    }
  });
}



  // Función para marcar un ticket como resuelto
  marcarComoResuelto(ticketId: number) {
    this.http.put(`http://localhost:3000/api/ticket/${ticketId}/resuelto`, {}).subscribe({
      next: () => {
        alert('Ticket marcado como resuelto');
        this.obtenerTicketsPendientes();  
      },
      error: (err) => {
        console.error('Error al marcar el ticket como resuelto:', err);
        alert('Error al marcar el ticket como resuelto');
      }
    });
  }
}
