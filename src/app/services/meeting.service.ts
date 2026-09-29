import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Meeting, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseUrl}/meetings/`);
  }

  scheduleMeeting(meeting: Partial<Meeting>): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.baseUrl}/meetings/`, meeting);
  }

  summarizeMeeting(id: number, rawNotes: string): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.baseUrl}/meetings/${id}/summarize`, { raw_notes: rawNotes });
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
