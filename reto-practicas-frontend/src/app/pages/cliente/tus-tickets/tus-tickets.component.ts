import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tus-tickets',
  templateUrl: './tus-tickets.component.html',
  styleUrls: ['./tus-tickets.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TusTicketsComponent {
  dni: string = '';
  tickets: any[] = [];
  mostrarTickets = false;

  constructor(private http: HttpClient) {}

  consultarTickets() {
    this.http.get<any[]>(`http://localhost:3000/api/ticket?dni=${this.dni}`).subscribe({
      next: (res) => {
        this.tickets = res;
        this.mostrarTickets = true;
      },
      error: () => {
        alert('Error al obtener los tickets');
      }
    });
  }

  borrarTicket(id: number) {
  }
}
