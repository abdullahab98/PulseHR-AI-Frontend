import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';
import { LeaveRequest } from '../../models/api.models';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html'
})
export class LeavesComponent implements OnInit {
  leaves: LeaveRequest[] = [];
  showApplyModal = false;
  newLeave = {
    leave_type: 'ANNUAL',
    start_date: '',
    end_date: '',
    reason: ''
  };

  constructor(private apiService: LeaveService, private authService: AuthService) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.apiService.getLeaves().subscribe(l => this.leaves = l);
  }

  canApprove(): boolean {
    const role = this.authService.currentUser().role;
    return role === 'SUPER_ADMIN' || role === 'DEPARTMENT_HEAD' || role === 'MANAGER' || role === 'TEAM_LEADER';
  }

  updateStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    this.apiService.updateLeaveStatus(id, status).subscribe({
      next: () => this.loadLeaves(),
      error: (err) => alert(err.error?.detail || 'Failed to update leave status')
    });
  }

  submitLeave() {
    const empId = this.authService.currentUser().employeeId || 1;
    this.apiService.applyLeave({
      employee_id: empId,
      ...this.newLeave
    }).subscribe({
      next: () => {
        this.showApplyModal = false;
        this.loadLeaves();
      },
      error: (err) => alert(err.error?.detail || 'Failed to submit leave request')
    });
  }
}
