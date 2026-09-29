import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../services/leave.service';
import { EmployeeLeaveReport, EmployeeLeaveReportItem } from '../../../models/api.models';

@Component({
  selector: 'app-employee-leave-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-leave-report.component.html'
})
export class EmployeeLeaveReportComponent implements OnInit {
  reportData: EmployeeLeaveReport = {
    summary: {
      total_employees: 0,
      total_days_taken: 0,
      avg_leave_per_emp: 0,
      total_pending_requests: 0,
      most_used_leave_type: 'ANNUAL'
    },
    department_breakdown: {},
    employees: []
  };

  selectedYear: number = new Date().getFullYear();
  selectedDepartment: string = 'ALL';
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private apiService: LeaveService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    this.apiService.getEmployeeLeaveReport().subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load employee leave report', err);
        this.isLoading = false;
      }
    });
  }

  get departmentList(): string[] {
    if (!this.reportData.department_breakdown) return [];
    return Object.keys(this.reportData.department_breakdown);
  }

  get filteredEmployees(): EmployeeLeaveReportItem[] {
    if (!this.reportData.employees) return [];
    return this.reportData.employees.filter(emp => {
      // Department filter
      if (this.selectedDepartment !== 'ALL') {
        if ((emp.department_name || '') !== this.selectedDepartment) {
          return false;
        }
      }
      // Search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const full = `${emp.employee_name} ${emp.employee_code || ''} ${emp.department_name || ''} ${emp.designation_name || ''}`.toLowerCase();
        if (!full.includes(term)) return false;
      }
      return true;
    });
  }

  getUtilizationBadge(totalTaken: number): { label: string; class: string } {
    if (totalTaken > 20) {
      return { label: 'High Usage', class: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else if (totalTaken > 10) {
      return { label: 'Moderate', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { label: 'Optimal', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  }

  exportCSV() {
    const headers = ['Employee ID,Employee Code,Name,Department,Designation,Annual Allocated,Annual Used,Casual Used,Sick Used,Other Used,Total Used,Remaining Balance'];
    const rows = this.filteredEmployees.map(e =>
      `"${e.employee_id}","${e.employee_code || ''}","${e.employee_name}","${e.department_name || ''}","${e.designation_name || ''}",${e.annual_allocated},${e.annual_used},${e.casual_used},${e.sick_used},${e.other_used},${e.total_used},${e.remaining_balance}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employee_leave_report_${this.selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
