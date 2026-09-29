import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PayrollService } from '../../../services/payroll.service';
import { PayrollSummary, Payslip } from '../../../models/api.models';

@Component({
  selector: 'app-payroll-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payroll-reports.component.html'
})
export class PayrollReportsComponent implements OnInit {
  loading: boolean = false;
  selectedMonth: string = '2026-09';
  summary: PayrollSummary | null = null;
  payslips: Payslip[] = [];

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.payrollService.getSummaryReport(this.selectedMonth).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.payrollService.getPayslips(this.selectedMonth).subscribe({
      next: (data) => this.payslips = data
    });
  }

  onMonthChange(): void {
    this.loadReport();
  }

  exportSalaryRegisterCSV(): void {
    if (this.payslips.length === 0) {
      alert('No payslip records available for export.');
      return;
    }

    const headers = [
      'Payslip ID',
      'Employee Name',
      'Department',
      'Designation',
      'Salary Month',
      'Basic Salary',
      'HRA',
      'Medical Allowance',
      'Transport Allowance',
      'Food Allowance',
      'Bonus',
      'Overtime',
      'Gross Salary',
      'Absent Deduction',
      'Late Deduction',
      'Tax Deduction',
      'PF Deduction',
      'Loan Deduction',
      'Total Deductions',
      'Net Salary',
      'Payment Status',
      'Payment Method',
      'Transaction ID'
    ];

    const rows = this.payslips.map(p => [
      p.id,
      `"${p.employee_name}"`,
      `"${p.department}"`,
      `"${p.designation}"`,
      p.salary_month,
      p.basic_salary,
      p.house_rent_allowance,
      p.medical_allowance,
      p.transport_allowance,
      p.food_allowance,
      p.bonus_amount,
      p.overtime_amount,
      p.gross_salary,
      p.absent_deduction,
      p.late_deduction,
      p.tax_deduction,
      p.pf_deduction,
      p.loan_deduction,
      p.total_deduction,
      p.net_salary,
      p.payment_status,
      p.payment_method,
      `"${p.transaction_id || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Salary_Register_${this.selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
