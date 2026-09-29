import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { PayrollSummary, PayrollBatch } from '../../../models/api.models';

@Component({
  selector: 'app-payroll-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payroll-overview.component.html'
})
export class PayrollOverviewComponent implements OnInit {
  loading: boolean = false;
  selectedMonth: string = '2026-09';
  summary: PayrollSummary | null = null;
  batches: PayrollBatch[] = [];

  showGenerateModal: boolean = false;
  generateForm = {
    month_year: '2026-09',
    title: 'September 2026 Corporate Payroll',
    include_bonus_id: undefined as number | undefined
  };
  bonusConfigs: any[] = [];

  constructor(
    private payrollService: PayrollService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.payrollService.getBonusConfigs().subscribe({
      next: (data) => this.bonusConfigs = data
    });
  }

  loadData(): void {
    this.loading = true;
    this.payrollService.getSummaryReport(this.selectedMonth).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.payrollService.getBatches().subscribe({
      next: (data) => this.batches = data
    });
  }

  onMonthChange(): void {
    this.loadData();
  }

  openGenerateModal(): void {
    this.generateForm.month_year = this.selectedMonth;
    this.generateForm.title = `${this.selectedMonth} Corporate Payroll Run`;
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }

  submitGeneratePayroll(): void {
    this.loading = true;
    this.payrollService.generatePayroll(this.generateForm).subscribe({
      next: (res) => {
        this.loading = false;
        this.closeGenerateModal();
        this.loadData();
        // Redirect to processing to review the new batch
        this.router.navigate(['/payroll/processing']);
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.detail || 'Failed to generate payroll batch');
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
