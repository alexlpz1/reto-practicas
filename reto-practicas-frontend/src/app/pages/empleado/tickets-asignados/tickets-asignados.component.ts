import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tickets-asignados',
  templateUrl: './tickets-asignados.component.html',
  styleUrls: ['./tickets-asignados.component.css'],
  imports: [CommonModule],
})
export class TicketsAsignadosComponent implements OnInit {
  ticketsAsignados: any[] = [];
  usuarioId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioId = usuario.id;
    this.obtenerTicketsAsignados();
  }

  obtenerTicketsAsignados() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const empleadoId = usuario.id;  
    if (!empleadoId) return;

    this.http.get<any[]>(`http://localhost:3000/api/ticket-asignados?usuarioId=${empleadoId}`).subscribe({
      next: res => this.ticketsAsignados = res,
      error: err => alert('Error al obtener los tickets asignados')
    });
  }

  eliminarTicket(ticketId: number) {
  this.http.delete(`http://localhost:3000/api/ticket/${ticketId}`).subscribe({
    next: () => {
      this.ticketsAsignados = this.ticketsAsignados.filter(t => t.id !== ticketId);
      alert('Ticket eliminado');
    },
    error: (err) => {
      console.error('Error al eliminar el ticket:', err);
      alert('Error al eliminar el ticket');
    }
  });
}

}
