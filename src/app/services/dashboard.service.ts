import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardInsights, Project, Attendance, TaskItem, LeaveRequest } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`);
  }

  getDashboardInsights(): Observable<DashboardInsights> {
    return this.http.get<DashboardInsights>(`${this.baseUrl}/ai/dashboard-insights`);
  }

  getProjects(departmentId?: number): Observable<Project[]> {
    const url = departmentId ? `${this.baseUrl}/projects/?department_id=${departmentId}` : `${this.baseUrl}/projects/`;
    return this.http.get<Project[]>(url);
  }

  getMyTodayAttendance(): Observable<Attendance | null> {
    return this.http.get<Attendance | null>(`${this.baseUrl}/attendance/me/today`);
  }

  getDailyAttendance(dateStr?: string): Observable<Attendance[]> {
    const url = dateStr ? `${this.baseUrl}/attendance/daily?target_date=${dateStr}` : `${this.baseUrl}/attendance/daily`;
    return this.http.get<Attendance[]>(url);
  }

  checkIn(employeeId?: number): Observable<Attendance> {
    const payload = employeeId ? { employee_id: employeeId } : {};
    return this.http.post<Attendance>(`${this.baseUrl}/attendance/check-in`, payload);
  }

  checkOut(employeeId?: number): Observable<Attendance> {
    const payload = employeeId ? { employee_id: employeeId } : {};
    return this.http.post<Attendance>(`${this.baseUrl}/attendance/check-out`, payload);
  }

  getTasks(projectId?: number, assigneeId?: number): Observable<TaskItem[]> {
    const params: string[] = [];
    if (projectId) params.push(`project_id=${projectId}`);
    if (assigneeId) params.push(`assignee_id=${assigneeId}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<TaskItem[]>(`${this.baseUrl}/tasks/${query}`);
  }

  getLeaves(employeeId?: number, statusFilter?: string): Observable<LeaveRequest[]> {
    const params: string[] = [];
    if (employeeId) params.push(`employee_id=${employeeId}`);
    if (statusFilter) params.push(`status_filter=${statusFilter}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/leaves/${query}`);
  }
}
