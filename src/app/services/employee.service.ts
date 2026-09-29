import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee, Department, Office, Rank, Designation } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${id}`);
  }

  createEmployee(data: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees/`, data);
  }

  updateEmployee(id: number, data: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/employees/${id}`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments/`);
  }

  createDepartment(data: { name: string; code: string; budget: number }): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments/`, data);
  }

  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(`${this.baseUrl}/offices`);
  }

  getRanks(): Observable<Rank[]> {
    return this.http.get<Rank[]>(`${this.baseUrl}/ranks`);
  }

  getDesignations(officeId?: number, rankId?: number, search?: string): Observable<Designation[]> {
    const params: any = {};
    if (officeId) params.office_id = officeId;
    if (rankId) params.rank_id = rankId;
    if (search) params.search = search;
    return this.http.get<Designation[]>(`${this.baseUrl}/designations`, { params });
  }
}
