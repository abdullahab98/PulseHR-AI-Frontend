import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Department, ReportGenerationResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  generateAIReport(
    reportType: string,
    startDate?: string,
    endDate?: string,
    departmentId?: number | null,
    focusArea?: string
  ): Observable<ReportGenerationResponse> {
    return this.http.post<ReportGenerationResponse>(`${this.baseUrl}/ai/generate-report`, {
      report_type: reportType,
      start_date: startDate || null,
      end_date: endDate || null,
      department_id: departmentId || null,
      focus_area: focusArea || null
    });
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments/`);
  }
}
