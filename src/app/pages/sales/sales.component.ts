import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { SalesLead } from '../../models/api.models';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html'
})
export class SalesComponent implements OnInit {
  leads: SalesLead[] = [];
  loading = true;
  showModal = false;

  newLead = {
    client_name: '',
    deal_title: '',
    deal_value: 50000,
    stage: 'PROSPECT' as 'PROSPECT' | 'PROPOSAL' | 'CONTRACT' | 'WON' | 'LOST'
  };

  constructor(private apiService: SalesService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getSalesLeads().subscribe({
      next: (data) => {
        this.leads = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  createLead(): void {
    if (!this.newLead.client_name || !this.newLead.deal_title) return;
    this.apiService.createSalesLead(this.newLead).subscribe({
      next: () => {
        this.showModal = false;
        this.newLead = { client_name: '', deal_title: '', deal_value: 50000, stage: 'PROSPECT' };
        this.loadData();
      }
    });
  }

  updateStage(leadId: number, stage: string): void {
    this.apiService.updateSalesStage(leadId, stage).subscribe({
      next: () => this.loadData()
    });
  }
}
