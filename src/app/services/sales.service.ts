import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SalesLead, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getSalesLeads(): Observable<SalesLead[]> {
    return this.http.get<SalesLead[]>(`${this.baseUrl}/sales/leads`);
  }

  createSalesLead(lead: Partial<SalesLead>): Observable<SalesLead> {
    return this.http.post<SalesLead>(`${this.baseUrl}/sales/leads`, lead);
  }

  updateSalesStage(leadId: number, stage: string): Observable<SalesLead> {
    return this.http.put<SalesLead>(`${this.baseUrl}/sales/leads/${leadId}/stage`, { stage });
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
