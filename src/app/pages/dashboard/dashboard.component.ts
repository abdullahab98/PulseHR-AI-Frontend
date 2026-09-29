import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { DashboardInsights, Project, Attendance } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  insights: DashboardInsights | null = null;
  projects: Project[] = [];
  isLoading = true;

  // Real-time Live Clock & Shift Telemetry
  currentDate = new Date();
  formattedDateStr = '';
  liveTime = '';
  liveSeconds = '';
  livePeriod = '';
  liveDayName = '';
  liveDate = '';
  liveTimezone = '';
  is24HourFormat = false;
  shiftProgress = 0;
  shiftStatus: 'BEFORE_SHIFT' | 'IN_PROGRESS' | 'LUNCH_BREAK' | 'AFTER_SHIFT' = 'IN_PROGRESS';
  shiftStatusLabel = '';
  shiftRemainingText = '';
  private clockInterval: any = null;

  // Check-In / Check-Out & Work Duration Tracker
  isCheckedIn = false;
  checkInTime: string | Date | null = null;
  checkOutTime: string | Date | null = null;
  workDurationHours: number | null = null;
  overtimeHours = 0;
  attendanceStatus = 'NOT CHECKED IN';
  isProcessingAttendance = false;
  liveWorkDurationStr = '00:00:00';

  // Employee Profile Information
  employeeProfile = {
    id: 'EMP-101',
    name: 'Alexander Vance',
    email: 'ceo@office.ai',
    designation: 'Chief Executive Officer (CEO)',
    department: 'Executive Operations & Management',
    education: 'B.Sc. in Computer Science & Engineering, MBA in Strategic Management',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    hireDate: 'Jan 15, 2022'
  };

  // Performance & Productivity Metrics
  performance = {
    overallScore: 94.8,
    ratingLabel: 'Top Performer',
    tasksCompleted: 42,
    tasksPending: 3,
    taskCompletionRate: 93.3,
    punctualityRate: 98.5,
    sprintVelocity: 95.0,
    collaborationScore: 92.0,
    codeQualityScore: 96.5,
    kpiProgress: [
      { name: 'Project Milestone Delivery', progress: 94, color: 'bg-blue-600' },
      { name: 'Punctuality & Time Tracking', progress: 98, color: 'bg-emerald-600' },
      { name: 'Code Quality & Deliverables', progress: 96, color: 'bg-purple-600' },
      { name: 'Team Collaboration & Mentorship', progress: 92, color: 'bg-amber-600' }
    ]
  };

  constructor(
    private apiService: DashboardService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateLiveClock();
    this.clockInterval = setInterval(() => this.updateLiveClock(), 1000);
    this.initUserProfile();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  updateLiveClock(): void {
    const now = new Date();
    this.currentDate = now;

    // Timezone
    try {
      this.liveTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      this.liveTimezone = 'Local';
    }

    // Day & Date string
    this.liveDayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    this.liveDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    this.formattedDateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Clock formatting
    const rawHours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.liveSeconds = seconds;

    if (this.is24HourFormat) {
      this.liveTime = `${rawHours.toString().padStart(2, '0')}:${minutes}`;
      this.livePeriod = '24H';
    } else {
      const period = rawHours >= 12 ? 'PM' : 'AM';
      const displayHours = (rawHours % 12 || 12).toString().padStart(2, '0');
      this.liveTime = `${displayHours}:${minutes}`;
      this.livePeriod = period;
    }

    // Shift Telemetry: Office Shift 09:00 AM (540 mins) to 06:00 PM (1080 mins)
    const shiftStartMinutes = 9 * 60;   // 540 mins
    const shiftEndMinutes = 18 * 60;    // 1080 mins
    const currentTotalMinutes = rawHours * 60 + now.getMinutes() + now.getSeconds() / 60;

    if (currentTotalMinutes < shiftStartMinutes) {
      this.shiftStatus = 'BEFORE_SHIFT';
      this.shiftProgress = 0;
      const diffMins = Math.round(shiftStartMinutes - currentTotalMinutes);
      const diffH = Math.floor(diffMins / 60);
      const diffM = diffMins % 60;
      this.shiftStatusLabel = 'Upcoming Shift';
      this.shiftRemainingText = `Starts in ${diffH > 0 ? diffH + 'h ' : ''}${diffM}m`;
    } else if (currentTotalMinutes >= shiftStartMinutes && currentTotalMinutes <= shiftEndMinutes) {
      const elapsed = currentTotalMinutes - shiftStartMinutes;
      const totalShift = shiftEndMinutes - shiftStartMinutes;
      this.shiftProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalShift) * 100)));

      const remainingMins = Math.round(shiftEndMinutes - currentTotalMinutes);
      const remH = Math.floor(remainingMins / 60);
      const remM = remainingMins % 60;

      if (rawHours === 13) {
        this.shiftStatus = 'LUNCH_BREAK';
        this.shiftStatusLabel = 'Lunch Break Window';
      } else {
        this.shiftStatus = 'IN_PROGRESS';
        this.shiftStatusLabel = 'Active Shift';
      }
      this.shiftRemainingText = `${remH}h ${remM}m remaining`;
    } else {
      this.shiftStatus = 'AFTER_SHIFT';
      this.shiftProgress = 100;
      const overtimeMins = Math.round(currentTotalMinutes - shiftEndMinutes);
      const otH = Math.floor(overtimeMins / 60);
      const otM = overtimeMins % 60;
      this.shiftStatusLabel = 'Shift Concluded';
      this.shiftRemainingText = `Ended (+${otH > 0 ? otH + 'h ' : ''}${otM}m OT)`;
    }

    // Real-Time Active Work Duration Counter (Checked In & Not Checked Out)
    if (this.isCheckedIn && this.checkInTime && !this.checkOutTime) {
      const inDate = this.parseTimeToDate(this.checkInTime);
      if (inDate) {
        const diffMs = Math.max(0, now.getTime() - inDate.getTime());
        const totalSeconds = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        this.liveWorkDurationStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        this.workDurationHours = parseFloat((totalSeconds / 3600).toFixed(2));
      }
    } else if (this.checkOutTime && this.checkInTime) {
      // Stopped / Completed: Show final duration
      const inDate = this.parseTimeToDate(this.checkInTime);
      const outDate = this.parseTimeToDate(this.checkOutTime);
      if (inDate && outDate) {
        const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
        const totalSeconds = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        this.liveWorkDurationStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    } else if (!this.isCheckedIn && !this.checkOutTime) {
      this.liveWorkDurationStr = '00:00:00';
    }
  }

  parseTimeToDate(timeVal: string | Date | null | undefined): Date | null {
    if (!timeVal) return null;
    if (timeVal instanceof Date) return isNaN(timeVal.getTime()) ? null : timeVal;

    if (typeof timeVal === 'string') {
      // If it contains 'T', extract year, month, day, hours, minutes, seconds directly
      if (timeVal.includes('T')) {
        const [datePart, timePart] = timeVal.split('T');
        const dateMatch = datePart.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        const timeMatch = timePart.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (dateMatch && timeMatch) {
          const y = parseInt(dateMatch[1], 10);
          const m = parseInt(dateMatch[2], 10) - 1;
          const d = parseInt(dateMatch[3], 10);
          const hh = parseInt(timeMatch[1], 10);
          const mm = parseInt(timeMatch[2], 10);
          const ss = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
          return new Date(y, m, d, hh, mm, ss);
        }
      }

      // If it is time only e.g. "10:33" or "10:33:00"
      if (timeVal.includes(':') && !timeVal.includes('-')) {
        const match = timeVal.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
        if (match) {
          let hh = parseInt(match[1], 10);
          const mm = parseInt(match[2], 10);
          const ss = match[3] ? parseInt(match[3], 10) : 0;
          const ampm = match[4];
          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hh < 12) hh += 12;
            if (ampm.toUpperCase() === 'AM' && hh === 12) hh = 0;
          }
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, ss);
        }
      }

      const direct = new Date(timeVal);
      if (!isNaN(direct.getTime())) return direct;
    }
    return null;
  }

  toggleTimeFormat(): void {
    this.is24HourFormat = !this.is24HourFormat;
    this.updateLiveClock();
  }

  initUserProfile(): void {
    const user = this.authService.currentUser();
    if (user.firstName || user.email) {
      this.employeeProfile.name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'User';
      this.employeeProfile.email = user.email || '';
      this.employeeProfile.role = user.role || 'SUPER_ADMIN';
      if (user.employeeId) {
        this.employeeProfile.id = `EMP-10${user.employeeId}`;
      }
    }

    this.apiService.getMe().subscribe({
      next: (res) => {
        if (res) {
          this.employeeProfile.email = res.email || res.username || this.employeeProfile.email;
          this.employeeProfile.role = res.role || this.employeeProfile.role;
          if (res.employee) {
            this.employeeProfile.id = `EMP-10${res.employee.id}`;
            this.employeeProfile.name = `${res.employee.first_name} ${res.employee.last_name}`.trim();
            if (res.employee.designation) {
              this.employeeProfile.designation = res.employee.designation;
            }
            if (res.employee.department_name) {
              this.employeeProfile.department = res.employee.department_name;
            }
          }
        }
      },
      error: (err) => console.log('Error fetching me profile:', err)
    });
  }

  // 24-Hour Time Format Helper Function
  formatTime24(timeVal: string | Date | null | undefined): string {
    if (!timeVal) return '-';
    try {
      if (typeof timeVal === 'string' && timeVal.includes('T')) {
        const timePart = timeVal.split('T')[1];
        const match = timePart.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          return `${match[1].padStart(2, '0')}:${match[2]}`;
        }
      }

      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) {
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }

      if (typeof timeVal === 'string' && timeVal.includes(':')) {
        const match = timeVal.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = match[2];
          const ampm = match[3];
          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
          return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
      }
      return '-';
    } catch {
      return '-';
    }
  }

  get formattedDurationStr(): string {
    // 1. If currently checked in and active: Live counter ticking every second
    if (this.isCheckedIn && !this.checkOutTime) {
      return this.liveWorkDurationStr || '00:00:00';
    }

    // 2. If checked out: Stopped duration exactly as before
    if (this.checkOutTime) {
      if (this.workDurationHours !== null && this.workDurationHours !== undefined && this.workDurationHours > 0) {
        let str = `${this.workDurationHours} hrs`;
        if (this.overtimeHours && this.overtimeHours > 0) {
          str += ` (+${this.overtimeHours}h OT)`;
        }
        return str;
      }
    }

    if (this.workDurationHours && this.workDurationHours > 0) {
      return `${this.workDurationHours} hrs`;
    }

    return '-';
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.apiService.getDashboardInsights().subscribe({
      next: (data) => {
        this.insights = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    this.apiService.getProjects().subscribe({
      next: (projs) => this.projects = projs.slice(0, 4)
    });

    // Check today's attendance status for logged-in user
    this.apiService.getMyTodayAttendance().subscribe({
      next: (myAtt) => {
        if (myAtt) {
          this.isCheckedIn = !!myAtt.check_in && !myAtt.check_out;
          this.checkInTime = myAtt.check_in ? myAtt.check_in : null;
          this.checkOutTime = myAtt.check_out ? myAtt.check_out : null;
          this.workDurationHours = myAtt.work_hours && myAtt.work_hours > 0 ? myAtt.work_hours : null;
          this.overtimeHours = myAtt.overtime_hours || 0;
          this.attendanceStatus = myAtt.status || 'PRESENT';
        } else {
          this.isCheckedIn = false;
          this.checkInTime = null;
          this.checkOutTime = null;
          this.workDurationHours = null;
          this.overtimeHours = 0;
          this.attendanceStatus = 'NOT CHECKED IN';
        }
        this.updateLiveClock();
      },
      error: () => {
        const empId = this.authService.currentUser().employeeId || 1;
        this.apiService.getDailyAttendance().subscribe({
          next: (attendances) => {
            const myAtt = attendances.find(a => a.employee_id === empId);
            if (myAtt) {
              this.isCheckedIn = !!myAtt.check_in && !myAtt.check_out;
              this.checkInTime = myAtt.check_in ? myAtt.check_in : null;
              this.checkOutTime = myAtt.check_out ? myAtt.check_out : null;
              this.workDurationHours = myAtt.work_hours && myAtt.work_hours > 0 ? myAtt.work_hours : null;
              this.overtimeHours = myAtt.overtime_hours || 0;
              this.attendanceStatus = myAtt.status || 'PRESENT';
            }
            this.updateLiveClock();
          }
        });
      }
    });
  }

  handleCheckIn(): void {
    this.isProcessingAttendance = true;
    const empId = this.authService.currentUser().employeeId || undefined;
    this.apiService.checkIn(empId).subscribe({
      next: (att) => {
        this.isProcessingAttendance = false;
        this.isCheckedIn = true;
        this.checkInTime = att.check_in || new Date();
        this.checkOutTime = null;
        this.workDurationHours = null;
        this.liveWorkDurationStr = '00:00:00';
        this.attendanceStatus = att.status || 'PRESENT';
        this.updateLiveClock();
      },
      error: () => {
        this.isProcessingAttendance = false;
        this.isCheckedIn = true;
        this.checkInTime = new Date();
        this.checkOutTime = null;
        this.workDurationHours = null;
        this.liveWorkDurationStr = '00:00:00';
        this.updateLiveClock();
      }
    });
  }

  handleCheckOut(): void {
    this.isProcessingAttendance = true;
    const empId = this.authService.currentUser().employeeId || undefined;
    this.apiService.checkOut(empId).subscribe({
      next: (att) => {
        this.isProcessingAttendance = false;
        this.isCheckedIn = false;
        this.checkOutTime = att.check_out || new Date();
        this.workDurationHours = att.work_hours || 0.01;
        this.overtimeHours = att.overtime_hours || 0;
        this.updateLiveClock();
      },
      error: () => {
        this.isProcessingAttendance = false;
        this.isCheckedIn = false;
        this.checkOutTime = new Date();
        const inDate = this.parseTimeToDate(this.checkInTime);
        if (inDate) {
          const diffMs = Math.max(0, new Date().getTime() - inDate.getTime());
          this.workDurationHours = parseFloat((diffMs / 3600000).toFixed(2));
        }
        this.updateLiveClock();
      }
    });
  }
}
