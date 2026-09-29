import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project, Department, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getProjects(departmentId?: number): Observable<Project[]> {
    const url = departmentId ? `${this.baseUrl}/projects/?department_id=${departmentId}` : `${this.baseUrl}/projects/`;
    return this.http.get<Project[]>(url);
  }

  createProject(proj: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects/`, proj);
  }

  updateProject(id: number, proj: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, proj);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/projects/${id}`);
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
