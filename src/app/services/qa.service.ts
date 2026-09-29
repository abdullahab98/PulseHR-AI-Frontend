import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QABugReport, Project, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class QaService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getBugs(): Observable<QABugReport[]> {
    return this.http.get<QABugReport[]>(`${this.baseUrl}/qa/bugs`);
  }

  createBug(bug: Partial<QABugReport>): Observable<QABugReport> {
    return this.http.post<QABugReport>(`${this.baseUrl}/qa/bugs`, bug);
  }

  updateBugStatus(bugId: number, status: string): Observable<QABugReport> {
    return this.http.put<QABugReport>(`${this.baseUrl}/qa/bugs/${bugId}/status`, { status });
  }

  getProjects(departmentId?: number): Observable<Project[]> {
    const url = departmentId ? `${this.baseUrl}/projects/?department_id=${departmentId}` : `${this.baseUrl}/projects/`;
    return this.http.get<Project[]>(url);
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
