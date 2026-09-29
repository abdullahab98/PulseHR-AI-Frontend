import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../../services/attendance.service';
import { TimeSlot } from '../../../models/api.models';

@Component({
  selector: 'app-attendance-time-slot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-time-slot.component.html'
})
export class AttendanceTimeSlotComponent implements OnInit {
  timeSlots: TimeSlot[] = [];
  showSlotModal: boolean = false;

  newSlot = {
    name: '',
    start_time: '09:00 AM',
    end_time: '05:00 PM',
    late_grace_minutes: 15,
    is_active: true,
    description: ''
  };

  constructor(private apiService: AttendanceService) {}

  ngOnInit(): void {
    this.loadTimeSlots();
  }

  loadTimeSlots(): void {
    this.apiService.getTimeSlots().subscribe({
      next: (slots) => this.timeSlots = slots,
      error: () => {}
    });
  }

  submitNewSlot(): void {
    if (!this.newSlot.name.trim()) {
      alert('Please enter a shift slot name.');
      return;
    }
    this.apiService.createTimeSlot(this.newSlot).subscribe({
      next: () => {
        this.showSlotModal = false;
        this.newSlot = {
          name: '',
          start_time: '09:00 AM',
          end_time: '05:00 PM',
          late_grace_minutes: 15,
          is_active: true,
          description: ''
        };
        this.loadTimeSlots();
        alert('New time slot created successfully!');
      },
      error: (err) => alert(err.error?.detail || 'Failed to create time slot')
    });
  }
}
