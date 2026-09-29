import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { DeductionConfig } from '../../../models/api.models';

@Component({
  selector: 'app-deductions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './deductions.component.html'
})
export class DeductionsComponent implements OnInit {
  loading: boolean = false;
  deductionConfigs: DeductionConfig[] = [];

  showAddModal: boolean = false;
  newDeduction: Partial<DeductionConfig> = {
    name: '',
    deduction_type: 'POLICY',
    calculation_type: 'FORMULA',
    value: 0,
    is_active: true,
    description: ''
  };

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadDeductions();
  }

  loadDeductions(): void {
    this.loading = true;
    this.payrollService.getDeductionConfigs().subscribe({
      next: (data) => {
        this.deductionConfigs = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openAddModal(): void {
    this.newDeduction = {
      name: '',
      deduction_type: 'POLICY',
      calculation_type: 'PERCENTAGE',
      value: 5,
      is_active: true,
      description: ''
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveDeduction(): void {
    if (!this.newDeduction.name) {
      alert('Please enter deduction rule name');
      return;
    }
    this.payrollService.createDeductionConfig(this.newDeduction).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadDeductions();
      },
      error: (err) => alert(err.error?.detail || 'Failed to save deduction rule')
    });
  }

  deleteDeduction(id: number): void {
    if (!confirm('Are you sure you want to remove this deduction rule?')) return;
    this.payrollService.deleteDeductionConfig(id).subscribe({
      next: () => this.loadDeductions()
    });
  }
}
