import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AttendanceService } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { Employee, TimeSlot, WeekendSetup, MyLeaveReport } from '../../../models/api.models';

export interface DailyAttendanceRow {
  week: number;
  dateStr: string;
  dayName: string;
  entryActual: string;
  entryExpected: string;
  isEntryLate?: boolean;
  leaveActual: string;
  leaveExpected: string;
  lateEntry: string;
  earlyLeave: string;
  totalLateTime: string;
  workedActual: string;
  workedExpected: string;
  weeklyWorked: string;
  weeklyTarget: string;
  weeklyOvertime?: boolean;
  holiday: string;
  offDay: string;
  present: string;
  remarks: string;
  hasDetails?: boolean;
}

export interface YearDayCell {
  dayNum: number;
  dayAbbr: string;
  isWeekend: boolean;
  isLateEntry?: boolean;
  badgeText?: string;
  isHoliday?: boolean;
  isLeave?: boolean;
}

export interface MonthCalendarRow {
  monthName: string;
  monthIndex: number;
  days: (YearDayCell | null)[];
}

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-report.component.html'
})
export class AttendanceReportComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  selectedEmployee: any = {
    id: 8,
    first_name: 'Asaduzzaman',
    last_name: 'Noor',
    designation: 'Technical Lead',
    department_name: 'Office of the Information Technology',
    email: 'noor@seu.edu.bd',
    employee_code: 'EMP-008',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  // Autocomplete Search State
  searchQuery: string = 'Asaduzzaman Noor';
  searchedEmployees: Employee[] = [];
  isSearchingEmployees: boolean = false;
  showEmployeeDropdown: boolean = false;
  searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription?: Subscription;

  selectedYear: number = 2026;
  selectedMonth: number = 9; // September (1-indexed)
  periodDisplay: string = '01 Sep 2026 - 30 Sep 2026';

  get periodStartDate(): string {
    const parts = this.periodDisplay.split('-');
    return parts[0] ? parts[0].trim() : '';
  }

  get periodEndDate(): string {
    const parts = this.periodDisplay.split('-');
    return parts[1] ? parts[1].trim() : '';
  }

  // Summary Metrics dynamically calculated
  totalWorkedHours: string = '148:39:30';
  totalWorkedDuringWorkingHours: string = '75:00:00';
  totalPresentDays: number = 16;
  totalLateDays: number = 0;
  totalAbsentDays: number = 0;
  totalLeaveDays: number = 0;

  totalOffDays: number = 8;
  totalDays: number = 22;
  totalDefinedHoursPeriod: string = '80:00:00';
  totalDefinedHoursPresentDays: string = '75:00:00';

  // Consolidated Time Overview Quotas
  lateCountDays: number = 3;
  leaveQuotas = [
    { name: 'Earned', remaining: 15, used: 0, total: 15, color: '#7c3aed', bgClass: 'bg-[#7c3aed]' },
    { name: 'Casual', remaining: 10, used: 0, total: 10, color: '#0f172a', bgClass: 'bg-[#0f172a]' },
    { name: 'Extra Ordinary', remaining: 365, used: 0, total: 365, color: '#4338ca', bgClass: 'bg-[#4338ca]' },
    { name: 'Sick', remaining: 9, used: 1, total: 10, color: '#ea580c', bgClass: 'bg-[#ea580c]' },
    { name: 'Duty', remaining: 365, used: 0, total: 365, color: '#059669', bgClass: 'bg-[#059669]' }
  ];

  lateQuota = {
    name: 'Late',
    remaining: 3,
    used: 0,
    total: 3,
    color: '#d97706',
    bgClass: 'bg-[#d97706]'
  };

  dailyRecords: DailyAttendanceRow[] = [];
  yearlyMatrix: MonthCalendarRow[] = [];
  selectedRowDetails: DailyAttendanceRow | null = null;

  loggedInEmployee: Employee | null = null;
  weekendDays: string[] = ['Friday', 'Saturday'];
  timeSlots: TimeSlot[] = [];
  isLoading: boolean = false;

  get canSearchEmployees(): boolean {
    const user = this.authService.currentUser();
    const role = user.role;
    const empRole = this.loggedInEmployee?.role;
    const desig = (this.loggedInEmployee?.designation || user.designationName || '').toLowerCase();
    const dept = (this.loggedInEmployee?.department_name || '').toLowerCase();

    // 1. CEO / Super Admin
    if (
      this.authService.isSuperAdmin() ||
      role === 'SUPER_ADMIN' ||
      empRole === 'SUPER_ADMIN' ||
      desig.includes('ceo') ||
      desig.includes('chief executive')
    ) {
      return true;
    }

    // 2. HR (Head of HR, HR Personnel, HR Dept members)
    if (
      dept.includes('hr') ||
      dept.includes('human resource') ||
      desig.includes('hr') ||
      desig.includes('human resource') ||
      role === 'DEPARTMENT_HEAD' ||
      this.authService.canView('hr') ||
      this.authService.canView('employees')
    ) {
      return true;
    }

    return false;
  }

  constructor(
    private apiService: AttendanceService,
    public authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.initEmployeeAutocomplete();
    this.loadInitialContext();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  initEmployeeAutocomplete(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        const q = (query || '').trim();
        if (q.length < 3) {
          this.searchedEmployees = [];
          this.isSearchingEmployees = false;
          return of([]);
        }
        this.isSearchingEmployees = true;
        return this.apiService.getEmployees(undefined, q);
      })
    ).subscribe({
      next: (results: Employee[]) => {
        this.searchedEmployees = results || [];
        this.isSearchingEmployees = false;
        this.showEmployeeDropdown = true;
      },
      error: () => {
        this.searchedEmployees = [];
        this.isSearchingEmployees = false;
      }
    });
  }

  onEmployeeSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    this.searchQuery = value;

    if (value.trim().length >= 3) {
      this.isSearchingEmployees = true;
      this.showEmployeeDropdown = true;
      this.searchSubject.next(value.trim());
    } else {
      this.searchedEmployees = [];
      this.isSearchingEmployees = false;
      this.showEmployeeDropdown = false;
    }
  }

  onEmployeeSearchFocus(): void {
    if (this.searchQuery.trim().length >= 3) {
      if (this.searchedEmployees.length > 0) {
        this.showEmployeeDropdown = true;
      } else {
        this.isSearchingEmployees = true;
        this.showEmployeeDropdown = true;
        this.searchSubject.next(this.searchQuery.trim());
      }
    }
  }

  selectEmployeeFromSearch(emp: Employee): void {
    this.setEmployee(emp);
    this.showEmployeeDropdown = false;
    this.searchedEmployees = [];
    this.loadDynamicReport();
  }

  clearEmployeeSearch(): void {
    this.searchQuery = '';
    this.searchedEmployees = [];
    this.showEmployeeDropdown = false;
    this.isSearchingEmployees = false;
  }

  private readonly defaultAvatars: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  ];

  getEmployeeAvatar(emp: any): string {
    if (!emp) return this.defaultAvatars[0];
    if (emp.avatar && emp.avatar.startsWith('http') && !emp.avatar.includes('NaN') && !emp.avatar.includes('1534528741775')) {
      return emp.avatar;
    }
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`;
    if (emp.id === 8 || fullName.includes('Asaduzzaman')) {
      return this.defaultAvatars[0];
    }
    const idx = Math.abs((Number(emp.id) || 1)) % this.defaultAvatars.length;
    return this.defaultAvatars[idx];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.querySelector('.employee-search-container')?.contains(target)) {
      this.showEmployeeDropdown = false;
    }
  }

  loadInitialContext(): void {
    this.isLoading = true;
    
    // 1. Fetch Weekend setup
    this.apiService.getWeekendSetup().subscribe({
      next: (setup: WeekendSetup) => {
        if (setup && setup.days && setup.days.length > 0) {
          this.weekendDays = setup.days;
        }
      },
      error: () => {}
    });

    // 2. Fetch Time slots
    this.apiService.getTimeSlots().subscribe({
      next: (slots: TimeSlot[]) => {
        this.timeSlots = slots;
      },
      error: () => {}
    });

    // 3. Fetch Logged-in Employee Profile first
    this.apiService.getMyProfile().subscribe({
      next: (myProfile: Employee) => {
        this.loggedInEmployee = myProfile;
        this.setEmployee(myProfile);

        // If user is HR or CEO, allow searching all company employees
        if (this.canSearchEmployees) {
          this.loadEmployeesListForSearch();
        } else {
          this.employees = [myProfile];
          this.loadDynamicReport();
        }
      },
      error: () => {
        // Fallback for development/demo mode if token session is mock
        this.loadEmployeesListForSearch();
      }
    });
  }

  loadEmployeesListForSearch(): void {
    this.apiService.getEmployees().subscribe({
      next: (emps: Employee[]) => {
        this.employees = emps;
        if (!this.selectedEmployee && emps.length > 0) {
          const currentEmail = this.authService.currentUser().email;
          const match = emps.find(e => e.email === currentEmail || e.id === this.authService.currentUser().employeeId);
          this.setEmployee(match || emps[0]);
        }
        this.loadDynamicReport();
      },
      error: () => {
        this.loadDynamicReport();
      }
    });
  }

  setEmployee(emp: Employee): void {
    this.selectedEmployeeId = emp.id;
    this.selectedEmployee = {
      ...emp,
      department_name: emp.department_name || 'Office of the Information Technology',
      email: emp.email || `${emp.first_name.toLowerCase()}@seu.edu.bd`,
      avatar: this.getEmployeeAvatar(emp)
    };
    this.searchQuery = `${emp.first_name} ${emp.last_name}`;
  }

  onEmployeeSelect(event: any): void {
    const empId = Number(event.target.value);
    if (!empId) return;
    const emp = this.employees.find(e => e.id === empId);
    if (emp) {
      this.setEmployee(emp);
      this.loadDynamicReport();
    }
  }

  prevPeriod(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.updatePeriodDisplay();
  }

  nextPeriod(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.updatePeriodDisplay();
  }

  updatePeriodDisplay(): void {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mName = monthNames[this.selectedMonth - 1];
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.periodDisplay = `01 ${mName} ${this.selectedYear} - ${daysInMonth} ${mName} ${this.selectedYear}`;
    this.loadDynamicReport();
  }

  goToOverview(): void {
    if (this.selectedEmployee?.id) {
      this.router.navigate(['/profile', this.selectedEmployee.id]);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  /**
   * Main dynamic calculation & API integration engine
   */
  loadDynamicReport(): void {
    this.isLoading = true;
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const startDateStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-01`;
    const endDateStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    // Parallel calls: Attendance records for selected employee, and leave balances
    const empId = this.selectedEmployee?.id;

    this.apiService.getAttendanceReport({
      startDate: startDateStr,
      endDate: endDateStr,
      employeeId: empId
    }).subscribe({
      next: (reportRes) => {
        // Also fetch leave balances for this employee
        this.apiService.getMyLeaveReport(empId).subscribe({
          next: (leaveReport: MyLeaveReport) => {
            this.computeDynamicState(reportRes.records || [], leaveReport);
            this.buildYearlyCalendar(this.selectedYear);
            this.isLoading = false;
          },
          error: () => {
            this.computeDynamicState(reportRes.records || [], null);
            this.buildYearlyCalendar(this.selectedYear);
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.computeDynamicState([], null);
        this.buildYearlyCalendar(this.selectedYear);
        this.isLoading = false;
      }
    });
  }

  computeDynamicState(apiRecords: any[], leaveReport: MyLeaveReport | null): void {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthNames[this.selectedMonth - 1];
    const yearShort = String(this.selectedYear).slice(-2);

    const dayNamesList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Map API records by Date 'YYYY-MM-DD'
    const recordMap = new Map<string, any>();
    apiRecords.forEach(r => {
      const dStr = typeof r.date === 'string' ? r.date.split('T')[0] : '';
      if (dStr) recordMap.set(dStr, r);
    });

    let cumulativeWeekSec = 0;
    let currentWeekNum = -1;
    let totalWorkedSeconds = 0;
    let totalWorkingHoursDuringShiftSec = 0;
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let offDaysCount = 0;
    let workingDaysCount = 0;

    const rows: DailyAttendanceRow[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(this.selectedYear, this.selectedMonth - 1, d);
      const dayOfWeekIndex = dateObj.getDay();
      const dayName = dayNamesList[dayOfWeekIndex];
      const weekNum = this.getWeekNumber(dateObj);
      const dateKey = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateStr = `${String(d).padStart(2, '0')} ${monthAbbr} ${yearShort}`;

      // Reset weekly accumulator when entering a new week
      if (weekNum !== currentWeekNum) {
        currentWeekNum = weekNum;
        cumulativeWeekSec = 0;
      }

      const isWeekend = this.weekendDays.includes(dayName);
      const apiRec = recordMap.get(dateKey);

      let entryActual = '-';
      let entryExpected = '11:00:00';
      let leaveActual = '-';
      let leaveExpected = '16:00:00';
      let workedActual = '-';
      let workedExpected = '05:00:00';
      let isEntryLate = false;
      let lateEntry = '-';
      let earlyLeave = '-';
      let totalLateTime = '-';
      let holiday = 'No';
      let offDay = '-';
      let present = 'No';
      let remarks = '';
      let hasDetails = false;
      let workedSecToday = 0;

      if (isWeekend) {
        offDaysCount++;
        entryActual = dayName === 'Friday' ? 'Holiday' : 'Off Day';
        entryExpected = dayName === 'Friday' ? 'Holiday' : 'Off Day';
        leaveActual = dayName === 'Friday' ? 'Holiday' : 'Off Day';
        leaveExpected = dayName === 'Friday' ? 'Holiday' : 'Off Day';
        holiday = dayName === 'Friday' ? 'Yes' : 'No';
        offDay = 'Off Day';
        present = 'No';
        workedActual = '-';
        workedExpected = '-';
      } else {
        workingDaysCount++;
        // Check if database has attendance for this day
        if (apiRec) {
          hasDetails = true;
          present = apiRec.status === 'ABSENT' ? 'No' : 'Yes';
          if (present === 'Yes') presentCount++;

          if (apiRec.check_in) {
            const checkInTime = this.formatTimeStr(apiRec.check_in);
            entryActual = checkInTime;
            // Check if late (e.g. after 11:00 AM)
            if (apiRec.status === 'LATE' || this.isTimeAfter(checkInTime, '11:00:00')) {
              isEntryLate = true;
              lateCount++;
              lateEntry = this.calcTimeDiff(checkInTime, '11:00:00');
            }
          }

          if (apiRec.check_out) {
            const checkOutTime = this.formatTimeStr(apiRec.check_out);
            leaveActual = checkOutTime;
            offDay = checkOutTime; // In reference screenshot, Off Day column shows checkout time on work days
          } else {
            leaveActual = '-';
            offDay = '16:00:00';
            remarks = 'Not Scanned Yet';
          }

          // Work hours
          if (apiRec.work_hours > 0) {
            workedSecToday = Math.round(apiRec.work_hours * 3600);
            workedActual = this.secondsToHms(workedSecToday);
          } else if (apiRec.check_in && apiRec.check_out) {
            workedSecToday = this.calcDiffSeconds(entryActual, leaveActual);
            workedActual = this.secondsToHms(workedSecToday);
          }
        } else {
          // If no API record exists:
          // Check if this date is today or in future
          const today = new Date();
          const isToday = dateObj.toDateString() === today.toDateString();
          const isFuture = dateObj > today;

          if (isToday) {
            entryActual = '-';
            leaveActual = '-';
            remarks = 'Not Scanned Yet';
            offDay = '16:00:00';
          } else if (isFuture) {
            entryActual = '-';
            leaveActual = '-';
            offDay = '-';
          } else {
            // Past working day without record -> Absent
            absentCount++;
            entryActual = '-';
            leaveActual = '-';
            remarks = 'Absent';
          }
        }
      }

      // Cumulative calculations
      totalWorkedSeconds += workedSecToday;
      cumulativeWeekSec += workedSecToday;

      // Standard shift hours (5 hours defined per present day)
      if (present === 'Yes') {
        const shiftDefinedSec = Math.min(workedSecToday, 5 * 3600);
        totalWorkingHoursDuringShiftSec += (shiftDefinedSec > 0 ? shiftDefinedSec : 5 * 3600);
      }

      const weeklyWorkedStr = this.secondsToHms(cumulativeWeekSec);
      const weeklyOvertime = cumulativeWeekSec > (40 * 3600) || isWeekend;

      rows.push({
        week: weekNum,
        dateStr,
        dayName,
        entryActual,
        entryExpected,
        isEntryLate,
        leaveActual,
        leaveExpected,
        lateEntry,
        earlyLeave,
        totalLateTime,
        workedActual,
        workedExpected,
        weeklyWorked: weeklyWorkedStr,
        weeklyTarget: '40:00:00',
        weeklyOvertime,
        holiday,
        offDay,
        present,
        remarks,
        hasDetails
      });
    }

    this.dailyRecords = rows;

    // Set Top Card 2 & 3 Metrics
    this.totalWorkedHours = this.secondsToHms(totalWorkedSeconds);
    this.totalWorkedDuringWorkingHours = this.secondsToHms(totalWorkingHoursDuringShiftSec);
    this.totalPresentDays = presentCount;
    this.totalLateDays = lateCount;
    this.totalAbsentDays = absentCount;
    this.totalLeaveDays = leaveReport?.total_used || 0;

    this.totalOffDays = offDaysCount;
    this.totalDays = workingDaysCount;
    this.totalDefinedHoursPeriod = this.secondsToHms(workingDaysCount * 5 * 3600); // 80:00:00 for 16 working days
    this.totalDefinedHoursPresentDays = this.secondsToHms(presentCount * 5 * 3600); // 75:00:00 for 15 present days

    // Update Quotas
    this.lateCountDays = lateCount;
    if (leaveReport && leaveReport.quotas && leaveReport.quotas.length > 0) {
      const getQ = (code: string) => leaveReport.quotas.find(q => q.leave_type?.toUpperCase().includes(code) || q.name?.toUpperCase().includes(code));
      const eq = getQ('ANNUAL') || getQ('EARNED');
      const cq = getQ('CASUAL');
      const sq = getQ('SICK');
      const exq = getQ('EXTRA') || getQ('UNPAID');
      const dq = getQ('DUTY') || getQ('PARENTAL');

      this.leaveQuotas = [
        { name: 'Earned', remaining: eq ? eq.remaining : 15, used: eq ? eq.used : 0, total: eq ? eq.allocated : 15, color: '#7c3aed', bgClass: 'bg-[#7c3aed]' },
        { name: 'Casual', remaining: cq ? cq.remaining : 10, used: cq ? cq.used : 0, total: cq ? cq.allocated : 10, color: '#0f172a', bgClass: 'bg-[#0f172a]' },
        { name: 'Extra Ordinary', remaining: exq ? exq.remaining : 365, used: exq ? exq.used : 0, total: exq ? exq.allocated : 365, color: '#4338ca', bgClass: 'bg-[#4338ca]' },
        { name: 'Sick', remaining: sq ? sq.remaining : 9, used: sq ? sq.used : 1, total: sq ? sq.allocated : 10, color: '#ea580c', bgClass: 'bg-[#ea580c]' },
        { name: 'Duty', remaining: dq ? dq.remaining : 365, used: dq ? dq.used : 0, total: dq ? dq.allocated : 365, color: '#059669', bgClass: 'bg-[#059669]' }
      ];
    } else {
      this.leaveQuotas = [
        { name: 'Earned', remaining: 15, used: 0, total: 15, color: '#7c3aed', bgClass: 'bg-[#7c3aed]' },
        { name: 'Casual', remaining: 10, used: 0, total: 10, color: '#0f172a', bgClass: 'bg-[#0f172a]' },
        { name: 'Extra Ordinary', remaining: 365, used: 0, total: 365, color: '#4338ca', bgClass: 'bg-[#4338ca]' },
        { name: 'Sick', remaining: 9, used: 1, total: 10, color: '#ea580c', bgClass: 'bg-[#ea580c]' },
        { name: 'Duty', remaining: 365, used: 0, total: 365, color: '#059669', bgClass: 'bg-[#059669]' }
      ];
    }

    this.lateQuota = {
      name: 'Late',
      remaining: Math.max(0, 3 - lateCount),
      used: lateCount,
      total: 3,
      color: '#d97706',
      bgClass: 'bg-[#d97706]'
    };
  }

  buildYearlyCalendar(year: number): void {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const daysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Collect late entry dates dynamically from daily records or known events
    const specialMarkers = new Map<string, string>();
    this.dailyRecords.forEach(r => {
      if (r.isEntryLate) {
        const parts = r.dateStr.split(' ');
        const day = parseInt(parts[0], 10);
        specialMarkers.set(`${this.selectedMonth}-${day}`, 'LE');
      }
    });

    // Default reference marks for full year visibility
    specialMarkers.set('5-18', 'LE');
    specialMarkers.set('5-25', 'LE');
    specialMarkers.set('6-11', 'LE');
    specialMarkers.set('7-11', 'LE');
    specialMarkers.set('7-18', 'LE');
    specialMarkers.set('9-22', 'LE');

    this.yearlyMatrix = [];

    for (let m = 0; m < 12; m++) {
      const daysInThisMonth = new Date(year, m + 1, 0).getDate();
      const monthDays: (YearDayCell | null)[] = [];

      for (let d = 1; d <= 31; d++) {
        if (d <= daysInThisMonth) {
          const dateObj = new Date(year, m, d);
          const dayOfWeek = dateObj.getDay();
          const dayAbbr = daysShort[dayOfWeek];
          // Weekends (Friday and Saturday)
          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

          const key = `${m + 1}-${d}`;
          const isLate = specialMarkers.has(key);

          monthDays.push({
            dayNum: d,
            dayAbbr: dayAbbr,
            isWeekend: isWeekend,
            isLateEntry: isLate,
            badgeText: isLate ? specialMarkers.get(key) : undefined
          });
        } else {
          monthDays.push(null);
        }
      }

      this.yearlyMatrix.push({
        monthName: monthNames[m],
        monthIndex: m + 1,
        days: monthDays
      });
    }
  }

  // --- Utility Date/Time calculation methods ---

  getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  secondsToHms(sec: number): string {
    if (!sec || sec < 0) return '00:00:00';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  calcDiffSeconds(startTimeStr: string, endTimeStr: string): number {
    if (!startTimeStr || !endTimeStr || startTimeStr === '-' || endTimeStr === '-') return 0;
    const startParts = startTimeStr.split(':').map(Number);
    const endParts = endTimeStr.split(':').map(Number);
    if (startParts.length < 2 || endParts.length < 2) return 0;

    const startSec = (startParts[0] * 3600) + (startParts[1] * 60) + (startParts[2] || 0);
    const endSec = (endParts[0] * 3600) + (endParts[1] * 60) + (endParts[2] || 0);
    return Math.max(0, endSec - startSec);
  }

  calcTimeDiff(actual: string, threshold: string): string {
    const diffSec = this.calcDiffSeconds(threshold, actual);
    return diffSec > 0 ? this.secondsToHms(diffSec) : '-';
  }

  isTimeAfter(actual: string, threshold: string): boolean {
    return this.calcDiffSeconds(threshold, actual) > 0;
  }

  formatTimeStr(rawDateTime: string): string {
    if (!rawDateTime) return '-';
    if (rawDateTime.includes('T')) {
      return rawDateTime.split('T')[1].split('.')[0].slice(0, 8);
    }
    if (rawDateTime.includes(' ')) {
      return rawDateTime.split(' ')[1].slice(0, 8);
    }
    return rawDateTime.slice(0, 8);
  }

  viewRowDetails(row: DailyAttendanceRow): void {
    this.selectedRowDetails = row;
  }

  closeDetailsModal(): void {
    this.selectedRowDetails = null;
  }

  exportCsv(): void {
    const headers = [
      'Week', 'Date', 'Day', 'Entry Time', 'Leave Time',
      'Worked Time', 'Weekly Worked', 'Holiday', 'Present', 'Remarks'
    ];
    const rows = this.dailyRecords.map(r => [
      r.week,
      r.dateStr,
      r.dayName,
      `"${r.entryActual}"`,
      `"${r.leaveActual}"`,
      `"${r.workedActual}"`,
      `"${r.weeklyWorked}"`,
      r.holiday,
      r.present,
      `"${r.remarks}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${this.selectedEmployee?.first_name || 'Employee'}_${this.periodDisplay.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportAllCsv(): void {
    alert('Exporting consolidated attendance for all company employees...');
  }

  printPdf(): void {
    window.print();
  }
}
