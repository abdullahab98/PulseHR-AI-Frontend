import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ITTicket, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ItSupportService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getITTickets(): Observable<ITTicket[]> {
    return this.http.get<ITTicket[]>(`${this.baseUrl}/it-support/tickets`);
  }

  createITTicket(ticket: Partial<ITTicket>): Observable<ITTicket> {
    return this.http.post<ITTicket>(`${this.baseUrl}/it-support/tickets`, ticket);
  }

  updateITTicketStatus(ticketId: number, status: string): Observable<ITTicket> {
    return this.http.put<ITTicket>(`${this.baseUrl}/it-support/tickets/${ticketId}/status`, { status });
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
