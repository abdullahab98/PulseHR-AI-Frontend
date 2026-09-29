import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'app-weekend-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './weekend-setup.component.html'
})
export class WeekendSetupComponent implements OnInit {
  weekendDaysList: string[] = ['Friday', 'Saturday'];
  allWeekDays = [
    { id: 'Sunday', label: 'Sunday' },
    { id: 'Monday', label: 'Monday' },
    { id: 'Tuesday', label: 'Tuesday' },
    { id: 'Wednesday', label: 'Wednesday' },
    { id: 'Thursday', label: 'Thursday' },
    { id: 'Friday', label: 'Friday' },
    { id: 'Saturday', label: 'Saturday' }
  ];
  weekendDepartmentId: number | null = null;
  weekendNote: string = 'Standard organizational weekend configuration';
  weekendSavedSuccess: boolean = false;

  constructor(private apiService: AttendanceService) {}

  ngOnInit(): void {
    this.loadWeekendSetup();
  }

  loadWeekendSetup(): void {
    this.apiService.getWeekendSetup(this.weekendDepartmentId || undefined).subscribe({
      next: (setup) => {
        this.weekendDaysList = setup.days || ['Friday', 'Saturday'];
        this.weekendNote = setup.note || 'Standard organizational weekend configuration';
      },
      error: () => {}
    });
  }

  isDaySelected(day: string): boolean {
    return this.weekendDaysList.includes(day);
  }

  toggleWeekendDay(day: string): void {
    if (this.isDaySelected(day)) {
      this.weekendDaysList = this.weekendDaysList.filter(d => d !== day);
    } else {
      this.weekendDaysList.push(day);
    }
    this.weekendSavedSuccess = false;
  }

  saveWeekend(): void {
    this.apiService.saveWeekendSetup({
      days: this.weekendDaysList,
      department_id: this.weekendDepartmentId || undefined,
      note: this.weekendNote
    }).subscribe({
      next: () => {
        this.weekendSavedSuccess = true;
        setTimeout(() => this.weekendSavedSuccess = false, 4000);
      },
      error: (err) => alert(err.error?.detail || 'Failed to save weekend setup')
    });
  }
}
