import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { Payslip } from '../../../models/api.models';

@Component({
  selector: 'app-payslips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payslips.component.html'
})
export class PayslipsComponent implements OnInit {
  loading: boolean = false;
  selectedMonth: string = '2026-09';
  payslips: Payslip[] = [];
  searchQuery: string = '';
  selectedPayslip: Payslip | null = null;

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadPayslips();
  }

  loadPayslips(): void {
    this.loading = true;
    this.payrollService.getPayslips(this.selectedMonth).subscribe({
      next: (data) => {
        this.payslips = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onMonthChange(): void {
    this.loadPayslips();
  }

  get filteredPayslips(): Payslip[] {
    if (!this.searchQuery) return this.payslips;
    const q = this.searchQuery.toLowerCase();
    return this.payslips.filter(p =>
      (p.employee_name && p.employee_name.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.designation && p.designation.toLowerCase().includes(q))
    );
  }

  viewPayslip(p: Payslip): void {
    this.selectedPayslip = p;
  }

  closePayslipModal(): void {
    this.selectedPayslip = null;
  }

  printPayslip(): void {
    window.print();
  }
}
