import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../services/leave.service';
import { AuthService } from '../../../services/auth.service';
import { LeaveRequest } from '../../../models/api.models';

@Component({
  selector: 'app-leave-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-applications.component.html'
})
export class LeaveApplicationsComponent implements OnInit {
  leaves: LeaveRequest[] = [];
  isLoading: boolean = false;

  searchTerm: string = '';
  statusFilter: string = 'PENDING';
  typeFilter: string = 'ALL';

  selectedApplication: LeaveRequest | null = null;
  actionRemarks: string = '';
  isProcessing: boolean = false;

  constructor(private apiService: LeaveService, private authService: AuthService) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.isLoading = true;
    this.apiService.getLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leave applications', err);
        this.isLoading = false;
      }
    });
  }

  get canApprove(): boolean {
    const role = this.authService.currentUser()?.role || '';
    return ['SUPER_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'TEAM_LEADER', 'HR_ADMIN'].includes(role);
  }

  get pendingCount(): number {
    return this.leaves.filter(l => l.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.leaves.filter(l => l.status === 'APPROVED').length;
  }

  get rejectedCount(): number {
    return this.leaves.filter(l => l.status === 'REJECTED').length;
  }

  get filteredLeaves(): LeaveRequest[] {
    return this.leaves.filter(item => {
      // Search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const emp = (item.employee_name || '').toLowerCase();
        const reason = (item.reason || '').toLowerCase();
        const idStr = item.id.toString();
        if (!emp.includes(term) && !reason.includes(term) && !idStr.includes(term)) {
          return false;
        }
      }
      // Status filter
      if (this.statusFilter !== 'ALL' && item.status !== this.statusFilter) {
        return false;
      }
      // Type filter
      if (this.typeFilter !== 'ALL' && item.leave_type !== this.typeFilter) {
        return false;
      }
      return true;
    });
  }

  updateStatus(item: LeaveRequest, status: 'APPROVED' | 'REJECTED') {
    if (!confirm(`Are you sure you want to mark application #LV-${item.id} as ${status}?`)) {
      return;
    }
    this.isProcessing = true;
    this.apiService.updateLeaveStatus(item.id, status).subscribe({
      next: () => {
        this.isProcessing = false;
        this.loadLeaves();
        if (this.selectedApplication?.id === item.id) {
          this.selectedApplication = null;
        }
      },
      error: (err) => {
        this.isProcessing = false;
        alert(err.error?.detail || `Failed to update status to ${status}`);
      }
    });
  }

  viewDetails(item: LeaveRequest) {
    this.selectedApplication = item;
  }

  closeDetails() {
    this.selectedApplication = null;
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
