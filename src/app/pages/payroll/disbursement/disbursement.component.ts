import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { Payslip } from '../../../models/api.models';

@Component({
  selector: 'app-disbursement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './disbursement.component.html'
})
export class DisbursementComponent implements OnInit {
  loading: boolean = false;
  selectedMonth: string = '2026-09';
  disbursements: Payslip[] = [];
  disburseSelection: Set<number> = new Set<number>();

  showDisburseModal: boolean = false;
  disburseForm = {
    payment_method: 'BANK',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    payment_reference: 'Monthly Salary Clearance'
  };

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadDisbursements();
  }

  loadDisbursements(): void {
    this.loading = true;
    this.payrollService.getDisbursements(this.selectedMonth).subscribe({
      next: (data) => {
        this.disbursements = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onMonthChange(): void {
    this.disburseSelection.clear();
    this.loadDisbursements();
  }

  toggleSelection(id: number): void {
    if (this.disburseSelection.has(id)) {
      this.disburseSelection.delete(id);
    } else {
      this.disburseSelection.add(id);
    }
  }

  toggleSelectAll(): void {
    const pendingSlips = this.disbursements.filter(d => d.payment_status !== 'PAID');
    if (this.disburseSelection.size === pendingSlips.length && pendingSlips.length > 0) {
      this.disburseSelection.clear();
    } else {
      this.disburseSelection = new Set(pendingSlips.map(d => d.id));
    }
  }

  openDisburseModal(singleId?: number): void {
    if (singleId) {
      this.disburseSelection.clear();
      this.disburseSelection.add(singleId);
    }
    if (this.disburseSelection.size === 0) {
      alert('Please select at least one employee payslip to disburse.');
      return;
    }
    this.disburseForm.transaction_id = `TRX-${Date.now().toString().slice(-6)}`;
    this.showDisburseModal = true;
  }

  closeDisburseModal(): void {
    this.showDisburseModal = false;
  }

  submitDisbursement(): void {
    if (this.disburseSelection.size === 0) return;
    this.loading = true;
    const req = {
      payslip_ids: Array.from(this.disburseSelection),
      payment_method: this.disburseForm.payment_method,
      payment_date: this.disburseForm.payment_date,
      transaction_id: this.disburseForm.transaction_id,
      payment_reference: this.disburseForm.payment_reference
    };
    this.payrollService.disburse(req).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.closeDisburseModal();
        this.disburseSelection.clear();
        this.loadDisbursements();
        alert(`Successfully disbursed ${res.disbursed_count} salaries totaling ৳${res.total_disbursed_amount.toLocaleString()}`);
      },
      error: (err: any) => {
        this.loading = false;
        alert(err.error?.detail || 'Failed to disburse salaries');
      }
    });
  }
}
