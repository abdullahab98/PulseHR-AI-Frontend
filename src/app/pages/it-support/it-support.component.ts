import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItSupportService } from '../../services/it-support.service';
import { ITTicket } from '../../models/api.models';

@Component({
  selector: 'app-it-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './it-support.component.html'
})
export class ItSupportComponent implements OnInit {
  tickets: ITTicket[] = [];
  loading = true;
  showModal = false;

  newTicket = {
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  };

  constructor(private apiService: ItSupportService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getITTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  createTicket(): void {
    if (!this.newTicket.title) return;
    this.apiService.createITTicket(this.newTicket).subscribe({
      next: () => {
        this.showModal = false;
        this.newTicket = { title: '', description: '', priority: 'MEDIUM' };
        this.loadData();
      }
    });
  }

  updateStatus(ticketId: number, status: string): void {
    this.apiService.updateITTicketStatus(ticketId, status).subscribe({
      next: () => this.loadData()
    });
  }
}
