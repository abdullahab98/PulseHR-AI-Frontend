import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { AttendanceApplication, Employee } from '../../../models/api.models';

@Component({
  selector: 'app-attendance-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-applications.component.html'
})
export class AttendanceApplicationsComponent implements OnInit {
  applications: AttendanceApplication[] = [];
  appFilterStatus: string = 'ALL';
  showAppModal: boolean = false;
  employees: Employee[] = [];

  newApp = {
    employee_id: null as number | null,
    date: new Date().toISOString().substring(0, 10),
    requested_check_in: '09:00 AM',
    requested_check_out: '05:00 PM',
    application_type: 'Correction',
    reason: ''
  };

  constructor(
    private apiService: AttendanceService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadApplications();
  }

  loadEmployees(): void {
    this.apiService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        if (emps.length > 0 && !this.newApp.employee_id) {
          const myEmpId = this.authService.currentUser().employeeId || emps[0].id;
          this.newApp.employee_id = myEmpId;
        }
      },
      error: () => {}
    });
  }

  loadApplications(): void {
    this.apiService.getAttendanceApplications(this.appFilterStatus).subscribe({
      next: (apps) => this.applications = apps,
      error: () => {}
    });
  }

  submitNewApplication(): void {
    if (!this.newApp.reason.trim()) {
      alert('Please enter a valid reason for the application.');
      return;
    }
    this.apiService.createAttendanceApplication({
      employee_id: this.newApp.employee_id || undefined,
      date: this.newApp.date,
      requested_check_in: this.newApp.requested_check_in,
      requested_check_out: this.newApp.requested_check_out,
      application_type: this.newApp.application_type,
      reason: this.newApp.reason
    }).subscribe({
      next: () => {
        this.showAppModal = false;
        this.newApp.reason = '';
        this.loadApplications();
        alert('Attendance application submitted successfully!');
      },
      error: (err) => alert(err.error?.detail || 'Failed to submit application')
    });
  }

  updateAppStatus(appId: number, status: string): void {
    this.apiService.updateAttendanceApplicationStatus(appId, status).subscribe({
      next: () => {
        this.loadApplications();
      },
      error: (err) => alert(err.error?.detail || 'Failed to update status')
    });
  }
}
