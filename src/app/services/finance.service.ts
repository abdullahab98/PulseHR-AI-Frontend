import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FinanceRecord, Department, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getFinanceRecords(): Observable<FinanceRecord[]> {
    return this.http.get<FinanceRecord[]>(`${this.baseUrl}/finance/records`);
  }

  createFinanceRecord(record: Partial<FinanceRecord>): Observable<FinanceRecord> {
    return this.http.post<FinanceRecord>(`${this.baseUrl}/finance/records`, record);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments/`);
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
