import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryAsset, Department, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getInventoryAssets(): Observable<InventoryAsset[]> {
    return this.http.get<InventoryAsset[]>(`${this.baseUrl}/inventory/assets`);
  }

  createInventoryAsset(asset: Partial<InventoryAsset>): Observable<InventoryAsset> {
    return this.http.post<InventoryAsset>(`${this.baseUrl}/inventory/assets`, asset);
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
