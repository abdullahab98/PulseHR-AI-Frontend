import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';
import { FinanceRecord } from '../../models/api.models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.component.html'
})
export class FinanceComponent implements OnInit {
  records: FinanceRecord[] = [];
  loading = true;
  showModal = false;

  newRecord = {
    title: '',
    record_type: 'EXPENSE' as 'REVENUE' | 'EXPENSE' | 'PAYROLL',
    amount: 1000,
    notes: ''
  };

  constructor(private apiService: FinanceService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getFinanceRecords().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  createRecord(): void {
    if (!this.newRecord.title || !this.newRecord.amount) return;
    this.apiService.createFinanceRecord(this.newRecord).subscribe({
      next: () => {
        this.showModal = false;
        this.newRecord = { title: '', record_type: 'EXPENSE', amount: 1000, notes: '' };
        this.loadData();
      }
    });
  }
}
