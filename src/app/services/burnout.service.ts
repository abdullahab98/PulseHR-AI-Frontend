import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BurnoutAnalysisItem, BurnoutSummary } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class BurnoutService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getBurnoutSummary(): Observable<BurnoutSummary> {
    return this.http.get<BurnoutSummary>(`${this.baseUrl}/ai/burnout/summary`);
  }

  getBurnoutAnalytics(): Observable<BurnoutAnalysisItem[]> {
    return this.http.get<BurnoutAnalysisItem[]>(`${this.baseUrl}/ai/burnout`);
  }

  getSingleBurnout(employeeId: number): Observable<BurnoutAnalysisItem> {
    return this.http.get<BurnoutAnalysisItem>(`${this.baseUrl}/ai/burnout/${employeeId}`);
  }

  generateEmployeeBurnoutReport(employeeId: number): Observable<BurnoutAnalysisItem> {
    return this.http.post<BurnoutAnalysisItem>(`${this.baseUrl}/ai/burnout/generate-report/${employeeId}`, {});
  }
}
