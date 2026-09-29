import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`);
  }

  getMyProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/me/profile`);
  }

  updateMyProfile(data: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/me/profile`, data);
  }

  changeMyPassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees/me/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${id}`);
  }

  updateEmployee(id: number, data: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, data);
  }

  assignDesignation(employeeId: number, designationId: number): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${employeeId}/designation`, {
      designation_id: designationId
    });
  }

  removeDesignation(employeeId: number): Observable<Employee> {
    return this.http.delete<Employee>(`${this.baseUrl}/employees/${employeeId}/designation`);
  }
}
