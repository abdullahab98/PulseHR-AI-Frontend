import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../services/leave.service';
import { AuthService } from '../../../services/auth.service';
import { MyLeaveReport, LeaveRequest } from '../../../models/api.models';

@Component({
  selector: 'app-my-leave-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-leave-report.component.html'
})
export class MyLeaveReportComponent implements OnInit {
  reportData: MyLeaveReport = {
    employee_id: 1,
    employee_name: 'Employee',
    department_name: 'Engineering',
    total_allocated: 25,
    total_used: 0,
    total_remaining: 25,
    total_pending: 0,
    quotas: [],
    history: []
  };

  selectedYear: number = new Date().getFullYear();
  statusFilter: string = 'ALL';
  isLoading: boolean = false;

  constructor(private apiService: LeaveService, private authService: AuthService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    const empId = this.authService.currentUser().employeeId || 1;
    this.apiService.getMyLeaveReport(empId).subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leave report', err);
        this.isLoading = false;
      }
    });
  }

  get filteredHistory(): LeaveRequest[] {
    if (!this.reportData.history) return [];
    if (this.statusFilter === 'ALL') return this.reportData.history;
    return this.reportData.history.filter(h => h.status === this.statusFilter);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'ANNUAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CASUAL':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'SICK':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PARENTAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
