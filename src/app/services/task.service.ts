import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskItem, Project, Employee, TaskRecommendationItem } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getTasks(projectId?: number, assigneeId?: number): Observable<TaskItem[]> {
    const params: string[] = [];
    if (projectId) params.push(`project_id=${projectId}`);
    if (assigneeId) params.push(`assignee_id=${assigneeId}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<TaskItem[]>(`${this.baseUrl}/tasks/${query}`);
  }

  createTask(task: Partial<TaskItem>): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${this.baseUrl}/tasks/`, task);
  }

  updateTask(id: number, task: Partial<TaskItem>): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.baseUrl}/tasks/${id}`, task);
  }

  addTaskComment(taskId: number, comment: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks/${taskId}/comments`, { comment });
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

  recommendTaskAssignees(requiredSkills: string[], priority: string = 'MEDIUM'): Observable<{ recommendations: TaskRecommendationItem[] }> {
    return this.http.post<{ recommendations: TaskRecommendationItem[] }>(`${this.baseUrl}/ai/recommend-task`, {
      required_skills: requiredSkills,
      priority
    });
  }
}
