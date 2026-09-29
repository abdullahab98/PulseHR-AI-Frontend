import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import {
  Attendance, AttendanceReportResponse, AttendanceReportItem,
  AttendanceApplication, TimeSlot, TimeSlotApplication, WeekendSetup,
  Employee
} from '../../models/api.models';

export type AttendanceTab = 'report' | 'applications' | 'time-slots' | 'apply-slot' | 'weekend-setup';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance.component.html'
})
export class AttendanceComponent implements OnInit {
  activeTab: AttendanceTab = 'report';

  // --- Panel 1: Attendance Report State ---
  reportData: AttendanceReportResponse = {
    summary: {
      total_records: 0,
      total_present: 0,
      total_late: 0,
      total_absent: 0,
      total_overtime_hours: 0,
      avg_work_hours: 0
    },
    records: []
  };
  filterStartDate: string = '';
  filterEndDate: string = '';
  filterStatus: string = 'ALL';
  filterEmployeeId: number | null = null;
  employees: Employee[] = [];
  isLoadingReport: boolean = false;

  // --- Panel 2: Attendance Applications State ---
  applications: AttendanceApplication[] = [];
  appFilterStatus: string = 'ALL';
  showAppModal: boolean = false;
  newApp = {
    employee_id: null as number | null,
    date: new Date().toISOString().substring(0, 10),
    requested_check_in: '09:00 AM',
    requested_check_out: '05:00 PM',
    application_type: 'Correction',
    reason: ''
  };

  // --- Panel 3: Attendance Time Slots State ---
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

  // --- Panel 4: Apply for New Time Slot State ---
  slotApplications: TimeSlotApplication[] = [];
  slotAppFilterStatus: string = 'ALL';
  newSlotRequest = {
    employee_id: null as number | null,
    time_slot_id: 1,
    effective_from: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
    reason: ''
  };

  // --- Panel 5: Weekend Setup State ---
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

  constructor(
    private apiService: AttendanceService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Determine active tab from URL path
    this.detectTabFromUrl();

    // Listen to navigation events in case route changes
    this.router.events.subscribe(() => {
      this.detectTabFromUrl();
    });

    // Load common employee list for filters and dropdowns
    this.loadEmployees();

    // Initial data load based on current tab
    this.refreshCurrentTab();
  }

  detectTabFromUrl(): void {
    const url = this.router.url.split('?')[0];
    if (url.includes('/attendance/report')) {
      this.activeTab = 'report';
    } else if (url.includes('/attendance/applications')) {
      this.activeTab = 'applications';
    } else if (url.includes('/attendance/time-slots')) {
      this.activeTab = 'time-slots';
    } else if (url.includes('/attendance/apply-slot')) {
      this.activeTab = 'apply-slot';
    } else if (url.includes('/attendance/weekend-setup')) {
      this.activeTab = 'weekend-setup';
    } else {
      this.activeTab = 'report';
    }
  }

  setTab(tab: AttendanceTab): void {
    this.activeTab = tab;
    this.router.navigate([`/attendance/${tab}`]);
    this.refreshCurrentTab();
  }

  refreshCurrentTab(): void {
    if (this.activeTab === 'report') {
      this.loadReport();
    } else if (this.activeTab === 'applications') {
      this.loadApplications();
    } else if (this.activeTab === 'time-slots') {
      this.loadTimeSlots();
    } else if (this.activeTab === 'apply-slot') {
      this.loadTimeSlots();
      this.loadSlotApplications();
    } else if (this.activeTab === 'weekend-setup') {
      this.loadWeekendSetup();
    }
  }

  loadEmployees(): void {
    this.apiService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        if (emps.length > 0 && !this.newApp.employee_id) {
          const myEmpId = this.authService.currentUser().employeeId || emps[0].id;
          this.newApp.employee_id = myEmpId;
          this.newSlotRequest.employee_id = myEmpId;
        }
      },
      error: () => {}
    });
  }

  // =========================================================
  // Panel 1: Attendance Report Methods
  // =========================================================
  loadReport(): void {
    this.isLoadingReport = true;
    this.apiService.getAttendanceReport({
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined,
      employeeId: this.filterEmployeeId || undefined,
      status: this.filterStatus !== 'ALL' ? this.filterStatus : undefined
    }).subscribe({
      next: (res) => {
        this.reportData = res;
        this.isLoadingReport = false;
      },
      error: () => {
        this.isLoadingReport = false;
      }
    });
  }

  resetReportFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterStatus = 'ALL';
    this.filterEmployeeId = null;
    this.loadReport();
  }

  exportReportCsv(): void {
    if (!this.reportData.records.length) {
      alert('No attendance data available to export.');
      return;
    }
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Check-In', 'Check-Out', 'Work Hours', 'Overtime Hours', 'Status'];
    const rows = this.reportData.records.map(r => [
      r.date,
      r.employee_id,
      `"${r.employee_name}"`,
      `"${r.department_name || ''}"`,
      r.check_in || '-',
      r.check_out || '-',
      r.work_hours,
      r.overtime_hours,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================
  // Panel 2: Attendance Applications Methods
  // =========================================================
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

  // =========================================================
  // Panel 3: Attendance Time Slots Methods
  // =========================================================
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

  // =========================================================
  // Panel 4: Apply for New Time Slot Methods
  // =========================================================
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

  // =========================================================
  // Panel 5: Weekend Setup Methods
  // =========================================================
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
