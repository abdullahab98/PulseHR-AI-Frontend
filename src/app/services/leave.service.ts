import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LeaveRequest, MyLeaveReport, EmployeeLeaveReport,
  DesignationChain, LeaveTypeConfig, Designation, Employee
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getLeaves(employeeId?: number, statusFilter?: string): Observable<LeaveRequest[]> {
    const params: string[] = [];
    if (employeeId) params.push(`employee_id=${employeeId}`);
    if (statusFilter) params.push(`status_filter=${statusFilter}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/leaves/${query}`);
  }

  applyLeave(leave: { employee_id: number; leave_type: string; start_date: string; end_date: string; reason: string }): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}/leaves/`, leave);
  }

  updateLeaveStatus(leaveId: number, status: 'APPROVED' | 'REJECTED'): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/leaves/${leaveId}/status`, { status });
  }

  getMyLeaveReport(employeeId?: number): Observable<MyLeaveReport> {
    const query = employeeId ? `?employee_id=${employeeId}` : '';
    return this.http.get<MyLeaveReport>(`${this.baseUrl}/leaves/reports/my${query}`);
  }

  getEmployeeLeaveReport(): Observable<EmployeeLeaveReport> {
    return this.http.get<EmployeeLeaveReport>(`${this.baseUrl}/leaves/reports/employee-summary`);
  }

  getDesignationChains(): Observable<DesignationChain[]> {
    return this.http.get<DesignationChain[]>(`${this.baseUrl}/leaves/designation-chains`);
  }

  createDesignationChain(payload: { designation_id: number; approver_designation_id: number; level?: number; auto_approve_days?: number; notes?: string }): Observable<DesignationChain> {
    return this.http.post<DesignationChain>(`${this.baseUrl}/leaves/designation-chains`, payload);
  }

  deleteDesignationChain(chainId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/leaves/designation-chains/${chainId}`);
  }

  getLeaveTypes(): Observable<LeaveTypeConfig[]> {
    return this.http.get<LeaveTypeConfig[]>(`${this.baseUrl}/leaves/types`);
  }

  createLeaveType(payload: Partial<LeaveTypeConfig>): Observable<LeaveTypeConfig> {
    return this.http.post<LeaveTypeConfig>(`${this.baseUrl}/leaves/types`, payload);
  }

  updateLeaveType(typeId: number, payload: Partial<LeaveTypeConfig>): Observable<LeaveTypeConfig> {
    return this.http.put<LeaveTypeConfig>(`${this.baseUrl}/leaves/types/${typeId}`, payload);
  }

  getDesignations(officeId?: number, rankId?: number, search?: string): Observable<Designation[]> {
    const params: any = {};
    if (officeId) params.office_id = officeId;
    if (rankId) params.rank_id = rankId;
    if (search) params.search = search;
    return this.http.get<Designation[]>(`${this.baseUrl}/designations`, { params });
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
