import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Attendance, AttendanceReportResponse, AttendanceApplication,
  TimeSlot, TimeSlotApplication, WeekendSetup, Employee, Department
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getMyTodayAttendance(): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${this.baseUrl}/attendance/me/today`);
  }

  checkIn(employeeId?: number): Observable<Attendance> {
    const payload = employeeId ? { employee_id: employeeId } : {};
    return this.http.post<Attendance>(`${this.baseUrl}/attendance/check-in`, payload);
  }

  checkOut(employeeId?: number): Observable<Attendance> {
    const payload = employeeId ? { employee_id: employeeId } : {};
    return this.http.post<Attendance>(`${this.baseUrl}/attendance/check-out`, payload);
  }

  getDailyAttendance(dateStr?: string): Observable<Attendance[]> {
    const url = dateStr ? `${this.baseUrl}/attendance/daily?target_date=${dateStr}` : `${this.baseUrl}/attendance/daily`;
    return this.http.get<Attendance[]>(url);
  }

  getEmployeeAttendance(employeeId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}/attendance/employee/${employeeId}`);
  }

  getAttendanceReport(filters?: { startDate?: string; endDate?: string; employeeId?: number; status?: string }): Observable<AttendanceReportResponse> {
    const params: string[] = [];
    if (filters?.startDate) params.push(`start_date=${filters.startDate}`);
    if (filters?.endDate) params.push(`end_date=${filters.endDate}`);
    if (filters?.employeeId) params.push(`employee_id=${filters.employeeId}`);
    if (filters?.status) params.push(`status=${filters.status}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<AttendanceReportResponse>(`${this.baseUrl}/attendance/report${query}`);
  }

  getAttendanceApplications(status?: string): Observable<AttendanceApplication[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return this.http.get<AttendanceApplication[]>(`${this.baseUrl}/attendance/applications${query}`);
  }

  createAttendanceApplication(payload: Partial<AttendanceApplication>): Observable<AttendanceApplication> {
    return this.http.post<AttendanceApplication>(`${this.baseUrl}/attendance/applications`, payload);
  }

  updateAttendanceApplicationStatus(appId: number, status: string): Observable<AttendanceApplication> {
    return this.http.patch<AttendanceApplication>(`${this.baseUrl}/attendance/applications/${appId}/status`, { status });
  }

  getTimeSlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/attendance/time-slots`);
  }

  createTimeSlot(payload: Partial<TimeSlot>): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(`${this.baseUrl}/attendance/time-slots`, payload);
  }

  getTimeSlotApplications(status?: string): Observable<TimeSlotApplication[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return this.http.get<TimeSlotApplication[]>(`${this.baseUrl}/attendance/slot-applications${query}`);
  }

  createTimeSlotApplication(payload: { employee_id?: number; time_slot_id: number; effective_from: string; reason: string }): Observable<TimeSlotApplication> {
    return this.http.post<TimeSlotApplication>(`${this.baseUrl}/attendance/slot-applications`, payload);
  }

  updateTimeSlotApplicationStatus(appId: number, status: string): Observable<TimeSlotApplication> {
    return this.http.patch<TimeSlotApplication>(`${this.baseUrl}/attendance/slot-applications/${appId}/status`, { status });
  }

  getWeekendSetup(departmentId?: number): Observable<WeekendSetup> {
    const query = departmentId ? `?department_id=${departmentId}` : '';
    return this.http.get<WeekendSetup>(`${this.baseUrl}/attendance/weekend-setup${query}`);
  }

  saveWeekendSetup(payload: { days: string[]; department_id?: number; note?: string }): Observable<WeekendSetup> {
    return this.http.post<WeekendSetup>(`${this.baseUrl}/attendance/weekend-setup`, payload);
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }

  getMyProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/me/profile`);
  }

  getMyLeaveReport(employeeId?: number): Observable<any> {
    const query = employeeId ? `?employee_id=${employeeId}` : '';
    return this.http.get<any>(`${this.baseUrl}/leaves/reports/my${query}`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments/`);
  }
}

