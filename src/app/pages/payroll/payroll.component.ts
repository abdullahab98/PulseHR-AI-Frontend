import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PayrollService } from '../../services/payroll.service';
import {
  SalaryStructure,
  AllowanceConfig,
  BonusConfig,
  DeductionConfig,
  PayrollBatch,
  Payslip,
  PayrollSummary,
  AttendanceIntegrationSummary
} from '../../models/api.models';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit {
  activeTab: string = 'overview';
  loading: boolean = false;
  selectedMonth: string = '2026-09';
  searchQuery: string = '';

  // Data Stores
  summary: PayrollSummary | null = null;
  salaryStructures: SalaryStructure[] = [];
  allowanceConfigs: AllowanceConfig[] = [];
  bonusConfigs: BonusConfig[] = [];
  deductionConfigs: DeductionConfig[] = [];
  batches: PayrollBatch[] = [];
  selectedBatch: PayrollBatch | null = null;
  payslips: Payslip[] = [];
  disbursements: Payslip[] = [];
  attendanceSummary: AttendanceIntegrationSummary | null = null;

  // Selected Payslip for View / Print Modal
  selectedPayslip: Payslip | null = null;

  // Modal States
  showEditStructureModal = false;
  editingStructure: Partial<SalaryStructure> = {};

  showAddAllowanceModal = false;
  newAllowance: Partial<AllowanceConfig> = {
    name: '',
    allowance_type: 'FIXED',
    value: 1000,
    is_taxable: true,
    applies_to: 'ALL',
    is_active: true,
    description: ''
  };

  showAddBonusModal = false;
  newBonus: Partial<BonusConfig> = {
    title: '',
    bonus_type: 'FESTIVAL',
    calculation_type: 'PERCENTAGE',
    value: 100,
    effective_month: 'ALL',
    is_active: true,
    description: ''
  };

  showAddDeductionModal = false;
  newDeduction: Partial<DeductionConfig> = {
    name: '',
    deduction_type: 'POLICY',
    calculation_type: 'FORMULA',
    value: 0,
    is_active: true,
    description: ''
  };

  showGenerateModal = false;
  generateForm = {
    month_year: '2026-09',
    title: 'September 2026 Corporate Payroll',
    include_bonus_id: undefined as number | undefined
  };

  showDisburseModal = false;
  disburseSelection: Set<number> = new Set<number>();
  disburseForm = {
    payment_method: 'BANK',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    payment_reference: 'Monthly Salary Clearance'
  };

  constructor(
    private payrollService: PayrollService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Detect active tab from current URL
    this.updateTabFromUrl(this.router.url);

    // Listen to router events when clicking between sidebar items
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTabFromUrl(event.urlAfterRedirects || event.url);
    });

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
        if (this.activeTab === 'attendance-integration' && !this.attendanceSummary) {
          this.loadAttendanceIntegration();
        }
      }
    });

    this.loadAllData();
  }

  updateTabFromUrl(url: string): void {
    if (!url) return;
    if (url.includes('salary-structure')) {
      this.activeTab = 'salary-structure';
    } else if (url.includes('attendance-integration') || url.includes('attendance')) {
      this.activeTab = 'attendance-integration';
      if (!this.attendanceSummary) {
        this.loadAttendanceIntegration();
      }
    } else if (url.includes('allowances-bonuses') || url.includes('allowances')) {
      this.activeTab = 'allowances-bonuses';
    } else if (url.includes('deductions')) {
      this.activeTab = 'deductions';
    } else if (url.includes('processing')) {
      this.activeTab = 'processing';
    } else if (url.includes('disbursement')) {
      this.activeTab = 'disbursement';
    } else if (url.includes('payslips')) {
      this.activeTab = 'payslips';
    } else if (url.includes('reports')) {
      this.activeTab = 'reports';
    } else {
      this.activeTab = 'overview';
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'attendance-integration' && !this.attendanceSummary) {
      this.loadAttendanceIntegration();
    }
    const targetUrl = tab === 'overview' ? '/payroll' : `/payroll/${tab}`;
    this.router.navigateByUrl(targetUrl);
  }

  loadAllData(): void {
    this.loading = true;
    this.loadSummary();
    this.loadSalaryStructures();
    this.loadConfigs();
    this.loadBatches();
    this.loadDisbursements();
    this.loadPayslips();
    this.loadAttendanceIntegration();
  }

  loadSummary(): void {
    this.payrollService.getSummaryReport(this.selectedMonth).subscribe({
      next: (data) => this.summary = data,
      error: () => {}
    });
  }

  loadSalaryStructures(): void {
    this.payrollService.getSalaryStructures().subscribe({
      next: (data) => {
        this.salaryStructures = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadConfigs(): void {
    this.payrollService.getAllowanceConfigs().subscribe({
      next: (data) => this.allowanceConfigs = data
    });
    this.payrollService.getBonusConfigs().subscribe({
      next: (data) => this.bonusConfigs = data
    });
    this.payrollService.getDeductionConfigs().subscribe({
      next: (data) => this.deductionConfigs = data
    });
  }

  loadBatches(): void {
    this.payrollService.getBatches().subscribe({
      next: (data) => {
        this.batches = data;
        if (data.length > 0 && !this.selectedBatch) {
          this.selectedBatch = data[0];
        }
      }
    });
  }

  loadDisbursements(): void {
    this.payrollService.getDisbursements(this.selectedMonth).subscribe({
      next: (data) => this.disbursements = data
    });
  }

  loadPayslips(): void {
    this.payrollService.getPayslips(this.selectedMonth).subscribe({
      next: (data) => this.payslips = data
    });
  }

  loadAttendanceIntegration(): void {
    this.loading = true;
    this.payrollService.getAttendanceSummary(this.selectedMonth).subscribe({
      next: (data) => {
        this.attendanceSummary = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onMonthChange(): void {
    this.loadSummary();
    this.loadDisbursements();
    this.loadPayslips();
    if (this.activeTab === 'attendance-integration') {
      this.loadAttendanceIntegration();
    }
  }

  // --- Search Filtering ---
  get filteredStructures(): SalaryStructure[] {
    if (!this.searchQuery) return this.salaryStructures;
    const q = this.searchQuery.toLowerCase();
    return this.salaryStructures.filter(s =>
      (s.employee_name && s.employee_name.toLowerCase().includes(q)) ||
      (s.department_name && s.department_name.toLowerCase().includes(q)) ||
      (s.designation && s.designation.toLowerCase().includes(q))
    );
  }

  get filteredPayslips(): Payslip[] {
    if (!this.searchQuery) return this.payslips;
    const q = this.searchQuery.toLowerCase();
    return this.payslips.filter(p =>
      (p.employee_name && p.employee_name.toLowerCase().includes(q)) ||
      (p.department_name && p.department_name.toLowerCase().includes(q)) ||
      (p.payment_status && p.payment_status.toLowerCase().includes(q))
    );
  }

  // --- Salary Structure Edit Modal ---
  openEditStructureModal(struct: SalaryStructure): void {
    this.editingStructure = { ...struct };
    this.showEditStructureModal = true;
  }

  saveStructure(): void {
    if (!this.editingStructure.employee_id || this.editingStructure.basic_salary === undefined) return;
    this.payrollService.saveSalaryStructure(this.editingStructure).subscribe({
      next: () => {
        this.showEditStructureModal = false;
        this.loadSalaryStructures();
        alert('Employee salary structure updated successfully!');
      },
      error: (err) => alert(err.error?.detail || 'Failed to update salary structure')
    });
  }

  // --- Allowance Actions ---
  openAddAllowance(): void {
    this.newAllowance = { name: '', allowance_type: 'FIXED', value: 1000, is_taxable: true, applies_to: 'ALL', is_active: true, description: '' };
    this.showAddAllowanceModal = true;
  }

  saveAllowance(): void {
    if (!this.newAllowance.name || this.newAllowance.value === undefined) return;
    this.payrollService.createAllowanceConfig(this.newAllowance).subscribe({
      next: () => {
        this.showAddAllowanceModal = false;
        this.loadConfigs();
        alert('Allowance policy created!');
      }
    });
  }

  deleteAllowance(id: number): void {
    if (!confirm('Are you sure you want to delete this allowance configuration?')) return;
    this.payrollService.deleteAllowanceConfig(id).subscribe({
      next: () => this.loadConfigs()
    });
  }

  // --- Bonus Actions ---
  openAddBonus(): void {
    this.newBonus = { title: '', bonus_type: 'FESTIVAL', calculation_type: 'PERCENTAGE', value: 100, effective_month: 'ALL', is_active: true, description: '' };
    this.showAddBonusModal = true;
  }

  saveBonus(): void {
    if (!this.newBonus.title || this.newBonus.value === undefined) return;
    this.payrollService.createBonusConfig(this.newBonus).subscribe({
      next: () => {
        this.showAddBonusModal = false;
        this.loadConfigs();
        alert('Bonus policy created!');
      }
    });
  }

  deleteBonus(id: number): void {
    if (!confirm('Are you sure you want to delete this bonus configuration?')) return;
    this.payrollService.deleteBonusConfig(id).subscribe({
      next: () => this.loadConfigs()
    });
  }

  // --- Deduction Actions ---
  openAddDeduction(): void {
    this.newDeduction = { name: '', deduction_type: 'POLICY', calculation_type: 'FORMULA', value: 0, is_active: true, description: '' };
    this.showAddDeductionModal = true;
  }

  saveDeduction(): void {
    if (!this.newDeduction.name) return;
    this.payrollService.createDeductionConfig(this.newDeduction).subscribe({
      next: () => {
        this.showAddDeductionModal = false;
        this.loadConfigs();
        alert('Deduction rule created!');
      }
    });
  }

  deleteDeduction(id: number): void {
    if (!confirm('Are you sure you want to delete this deduction rule?')) return;
    this.payrollService.deleteDeductionConfig(id).subscribe({
      next: () => this.loadConfigs()
    });
  }

  // --- Monthly Payroll Processing & Batch Workflow ---
  openGenerateModal(): void {
    this.generateForm = {
      month_year: this.selectedMonth,
      title: `${this.selectedMonth} Corporate Payroll Batch`,
      include_bonus_id: undefined
    };
    this.showGenerateModal = true;
  }

  executeGeneratePayroll(): void {
    this.loading = true;
    this.payrollService.generatePayroll(this.generateForm).subscribe({
      next: (batch) => {
        this.loading = false;
        this.showGenerateModal = false;
        this.selectedBatch = batch;
        this.loadBatches();
        this.loadPayslips();
        this.loadSummary();
        alert(`Payroll Batch successfully generated for ${batch.total_employees} employees!`);
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.detail || 'Error generating monthly payroll');
      }
    });
  }

  updateBatchStatus(batch: PayrollBatch, nextStatus: string): void {
    this.payrollService.updateBatchStatus(batch.id, nextStatus).subscribe({
      next: () => {
        batch.status = nextStatus;
        this.loadBatches();
        alert(`Batch status updated to ${nextStatus}!`);
      },
      error: (err) => alert(err.error?.detail || 'Error updating batch status')
    });
  }

  // --- Salary Disbursement Actions ---
  toggleDisburseSelection(id: number): void {
    if (this.disburseSelection.has(id)) {
      this.disburseSelection.delete(id);
    } else {
      this.disburseSelection.add(id);
    }
  }

  toggleSelectAllDisburse(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.disbursements.forEach(p => {
        if (p.payment_status !== 'PAID') {
          this.disburseSelection.add(p.id);
        }
      });
    } else {
      this.disburseSelection.clear();
    }
  }

  openDisburseModal(singlePayslipId?: number): void {
    if (singlePayslipId) {
      this.disburseSelection.clear();
      this.disburseSelection.add(singlePayslipId);
    }
    if (this.disburseSelection.size === 0) {
      alert('Please select at least one employee payslip to disburse payment.');
      return;
    }
    this.disburseForm.transaction_id = `TXN-${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
    this.showDisburseModal = true;
  }

  confirmDisburse(): void {
    const ids = Array.from(this.disburseSelection);
    this.loading = true;
    this.payrollService.disburse({
      payslip_ids: ids,
      payment_method: this.disburseForm.payment_method,
      payment_date: this.disburseForm.payment_date,
      transaction_id: this.disburseForm.transaction_id,
      payment_reference: this.disburseForm.payment_reference
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showDisburseModal = false;
        this.disburseSelection.clear();
        this.loadDisbursements();
        this.loadPayslips();
        this.loadSummary();
        alert(res.message);
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.detail || 'Disbursement failed');
      }
    });
  }

  // --- Payslip Modal & Printing ---
  viewPayslip(p: Payslip): void {
    this.selectedPayslip = p;
  }

  closePayslipModal(): void {
    this.selectedPayslip = null;
  }

  printPayslip(): void {
    window.print();
  }

  // --- Export Reports CSV ---
  exportCsv(): void {
    if (!this.payslips || this.payslips.length === 0) {
      alert('No payslip records available to export.');
      return;
    }

    const headers = [
      'Payslip ID', 'Employee Name', 'Department', 'Designation', 'Month',
      'Working Days', 'Present', 'Absent', 'Late', 'Paid Leave', 'Unpaid Leave', 'OT Hours',
      'Basic Salary', 'HRA', 'Medical', 'Transport', 'Food', 'Bonus', 'Gross Salary',
      'Absent Cut', 'Late Penalty', 'PF Cut', 'Tax Cut', 'Total Deductions',
      'Net Salary', 'Payment Status', 'Payment Method', 'Transaction ID'
    ];

    const rows = this.payslips.map(p => [
      p.id,
      `"${p.employee_name || ''}"`,
      `"${p.department_name || ''}"`,
      `"${p.designation || ''}"`,
      p.month_year,
      p.working_days,
      p.present_days,
      p.absent_days,
      p.late_days,
      p.paid_leaves,
      p.unpaid_leaves,
      p.overtime_hours,
      p.basic_salary,
      p.house_rent,
      p.medical_allowance,
      p.transport_allowance,
      p.food_allowance,
      p.bonus_amount,
      p.gross_salary,
      p.absent_deduction,
      p.late_deduction,
      p.provident_fund,
      p.tax_deduction,
      p.total_deductions,
      p.net_salary,
      p.payment_status,
      p.payment_method,
      `"${p.transaction_id || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Register_${this.selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
