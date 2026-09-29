import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../services/leave.service';
import { AuthService } from '../../../services/auth.service';
import { LeaveRequest, LeaveTypeConfig } from '../../../models/api.models';

@Component({
  selector: 'app-my-leave-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-leave-applications.component.html'
})
export class MyLeaveApplicationsComponent implements OnInit {
  applications: LeaveRequest[] = [];
  leaveTypes: LeaveTypeConfig[] = [];
  isLoading: boolean = false;
  showApplyModal: boolean = false;
  statusFilter: string = 'ALL';

  newLeave = {
    leave_type: 'ANNUAL',
    start_date: '',
    end_date: '',
    reason: ''
  };

  calculatedDays: number = 1;

  constructor(private apiService: LeaveService, private authService: AuthService) {}

  ngOnInit() {
    this.loadApplications();
    this.loadLeaveTypes();
  }

  loadApplications() {
    this.isLoading = true;
    const empId = this.authService.currentUser().employeeId || 1;
    this.apiService.getMyLeaveReport(empId).subscribe({
      next: (report) => {
        this.applications = report.history || [];
        this.isLoading = false;
      },
      error: () => {
        // Fallback: fetch all leaves and filter by current user
        this.apiService.getLeaves().subscribe(leaves => {
          this.applications = leaves.filter(l => l.employee_id === empId);
          this.isLoading = false;
        });
      }
    });
  }

  loadLeaveTypes() {
    this.apiService.getLeaveTypes().subscribe({
      next: (types) => {
        this.leaveTypes = types.filter(t => t.is_active);
        if (this.leaveTypes.length > 0) {
          this.newLeave.leave_type = this.leaveTypes[0].code;
        }
      },
      error: (err) => console.error('Error fetching leave types', err)
    });
  }

  calculateDays() {
    if (this.newLeave.start_date && this.newLeave.end_date) {
      const start = new Date(this.newLeave.start_date);
      const end = new Date(this.newLeave.end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.calculatedDays = diffDays > 0 ? diffDays : 1;
    }
  }

  openApplyModal() {
    const today = new Date().toISOString().split('T')[0];
    this.newLeave = {
      leave_type: this.leaveTypes.length > 0 ? this.leaveTypes[0].code : 'ANNUAL',
      start_date: today,
      end_date: today,
      reason: ''
    };
    this.calculatedDays = 1;
    this.showApplyModal = true;
  }

  closeApplyModal() {
    this.showApplyModal = false;
  }

  submitApplication() {
    if (!this.newLeave.start_date || !this.newLeave.end_date) {
      alert('Please select both start and end dates.');
      return;
    }
    if (!this.newLeave.reason.trim()) {
      alert('Please provide a reason for the leave application.');
      return;
    }

    const empId = this.authService.currentUser().employeeId || 1;
    this.apiService.applyLeave({
      employee_id: empId,
      leave_type: this.newLeave.leave_type,
      start_date: this.newLeave.start_date,
      end_date: this.newLeave.end_date,
      reason: this.newLeave.reason
    }).subscribe({
      next: () => {
        this.showApplyModal = false;
        this.loadApplications();
      },
      error: (err) => {
        alert(err.error?.detail || 'Failed to submit leave application');
      }
    });
  }

  get filteredApplications(): LeaveRequest[] {
    if (this.statusFilter === 'ALL') return this.applications;
    return this.applications.filter(a => a.status === this.statusFilter);
  }

  get pendingCount(): number {
    return this.applications.filter(a => a.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.applications.filter(a => a.status === 'APPROVED').length;
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
