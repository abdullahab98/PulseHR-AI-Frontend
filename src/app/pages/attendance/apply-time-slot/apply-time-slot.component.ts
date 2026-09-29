import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { TimeSlot, TimeSlotApplication, Employee } from '../../../models/api.models';

@Component({
  selector: 'app-apply-time-slot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './apply-time-slot.component.html'
})
export class ApplyTimeSlotComponent implements OnInit {
  timeSlots: TimeSlot[] = [];
  slotApplications: TimeSlotApplication[] = [];
  slotAppFilterStatus: string = 'ALL';
  employees: Employee[] = [];

  newSlotRequest = {
    employee_id: null as number | null,
    time_slot_id: 1,
    effective_from: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    reason: ''
  };

  constructor(
    private apiService: AttendanceService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTimeSlots();
    this.loadSlotApplications();
  }

  loadEmployees(): void {
    this.apiService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        if (emps.length > 0 && !this.newSlotRequest.employee_id) {
          const myEmpId = this.authService.currentUser().employeeId || emps[0].id;
          this.newSlotRequest.employee_id = myEmpId;
        }
      },
      error: () => {}
    });
  }

  loadTimeSlots(): void {
    this.apiService.getTimeSlots().subscribe({
      next: (slots) => {
        this.timeSlots = slots;
        if (slots.length > 0 && !this.newSlotRequest.time_slot_id) {
          this.newSlotRequest.time_slot_id = slots[0].id;
        }
      },
      error: () => {}
    });
  }

  loadSlotApplications(): void {
    this.apiService.getTimeSlotApplications(this.slotAppFilterStatus).subscribe({
      next: (res) => this.slotApplications = res,
      error: () => {}
    });
  }

  submitSlotChangeRequest(): void {
    if (!this.newSlotRequest.reason.trim()) {
      alert('Please provide a reason for the shift change request.');
      return;
    }
    this.apiService.createTimeSlotApplication({
      employee_id: this.newSlotRequest.employee_id || undefined,
      time_slot_id: Number(this.newSlotRequest.time_slot_id),
      effective_from: this.newSlotRequest.effective_from,
      reason: this.newSlotRequest.reason
    }).subscribe({
      next: () => {
        this.newSlotRequest.reason = '';
        this.loadSlotApplications();
        alert('Shift change application submitted successfully!');
      },
      error: (err) => alert(err.error?.detail || 'Failed to submit shift request')
    });
  }

  updateSlotAppStatus(appId: number, status: string): void {
    this.apiService.updateTimeSlotApplicationStatus(appId, status).subscribe({
      next: () => this.loadSlotApplications(),
      error: (err) => alert(err.error?.detail || 'Failed to update shift request status')
    });
  }
}
