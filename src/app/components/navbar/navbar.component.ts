import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  @Output() openAIAssistant = new EventEmitter<void>();
  isCheckedIn = false;

  constructor(
    private authService: AuthService,
    private apiService: AttendanceService,
    public themeService: ThemeService,
    public router: Router
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  doCheckIn() {
    const empId = this.authService.currentUser().employeeId || 1;
    this.apiService.checkIn(empId).subscribe({
      next: () => {
        this.isCheckedIn = true;
        alert('Check-in recorded successfully!');
      },
      error: (err) => alert(err.error?.detail || 'Check-in failed')
    });
  }

  doCheckOut() {
    const empId = this.authService.currentUser().employeeId || 1;
    this.apiService.checkOut(empId).subscribe({
      next: (att) => {
        this.isCheckedIn = false;
        alert(`Checked out! Work hours today: ${att.work_hours} hrs (Overtime: ${att.overtime_hours} hrs)`);
      },
      error: (err) => alert(err.error?.detail || 'Check-out failed')
    });
  }
}
