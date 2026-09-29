import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AIAssistantResponse, DashboardInsights,
  BurnoutAnalysisItem, TaskRecommendationItem
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  queryAIAssistant(query: string, history?: any[]): Observable<AIAssistantResponse> {
    return this.http.post<AIAssistantResponse>(`${this.baseUrl}/ai/assistant`, { query, history });
  }

  getDashboardInsights(): Observable<DashboardInsights> {
    return this.http.get<DashboardInsights>(`${this.baseUrl}/ai/dashboard-insights`);
  }

  getBurnoutAnalytics(): Observable<BurnoutAnalysisItem[]> {
    return this.http.get<BurnoutAnalysisItem[]>(`${this.baseUrl}/ai/burnout`);
  }

  recommendTaskAssignees(requiredSkills: string[], priority: string = 'MEDIUM'): Observable<{ recommendations: TaskRecommendationItem[] }> {
    return this.http.post<{ recommendations: TaskRecommendationItem[] }>(`${this.baseUrl}/ai/recommend-task`, {
      required_skills: requiredSkills,
      priority
    });
  }

  generateAIReport(reportType: string, startDate?: string, endDate?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/generate-report`, {
      report_type: reportType,
      start_date: startDate,
      end_date: endDate
    });
  }
}
