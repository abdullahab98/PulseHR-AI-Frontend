import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { PayrollBatch, Payslip } from '../../../models/api.models';

@Component({
  selector: 'app-processing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './processing.component.html'
})
export class ProcessingComponent implements OnInit {
  loading: boolean = false;
  batches: PayrollBatch[] = [];
  selectedBatch: PayrollBatch | null = null;
  batchPayslips: Payslip[] = [];
  selectedMonth: string = '2026-09';

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
    this.loadBatches();
    this.payrollService.getBonusConfigs().subscribe({
      next: (data) => this.bonusConfigs = data
    });
  }

  loadBatches(): void {
    this.loading = true;
    this.payrollService.getBatches().subscribe({
      next: (data) => {
        this.batches = data;
        if (data.length > 0) {
          this.selectBatch(data[0]);
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  selectBatch(b: PayrollBatch): void {
    this.selectedBatch = b;
    this.payrollService.getPayslips(b.batch_month).subscribe({
      next: (slips) => this.batchPayslips = slips
    });
  }

  updateBatchStatus(newStatus: string): void {
    if (!this.selectedBatch?.id) return;
    this.payrollService.updateBatchStatus(this.selectedBatch.id, newStatus).subscribe({
      next: (res) => {
        this.selectedBatch!.status = res.status;
        this.loadBatches();
      },
      error: (err) => alert(err.error?.detail || 'Failed to update status')
    });
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
        this.loadBatches();
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.detail || 'Failed to generate payroll batch');
      }
    });
  }

  goToDisbursement(): void {
    this.router.navigate(['/payroll/disbursement']);
  }
}
