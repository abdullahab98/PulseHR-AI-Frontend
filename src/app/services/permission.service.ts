import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserPermissionItem } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getAllUserPermissions(): Observable<UserPermissionItem[]> {
    return this.http.get<UserPermissionItem[]>(`${this.baseUrl}/permissions/users`);
  }

  updateUserPermissions(userId: number, payload: {
    allowed_panels?: string[];
    custom_permissions?: Record<string, any>;
    data_scope?: string;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/permissions/users/${userId}`, payload);
  }
}
