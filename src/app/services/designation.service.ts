import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Designation, DesignationCreate, DesignationUpdate,
  SystemPanelMeta, Office, Rank
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getSystemPanels(): Observable<SystemPanelMeta[]> {
    return this.http.get<SystemPanelMeta[]>(`${this.baseUrl}/designations/meta/panels`);
  }

  getDesignations(officeId?: number, rankId?: number, search?: string): Observable<Designation[]> {
    const params: any = {};
    if (officeId) params.office_id = officeId;
    if (rankId) params.rank_id = rankId;
    if (search) params.search = search;
    return this.http.get<Designation[]>(`${this.baseUrl}/designations`, { params });
  }

  getDesignation(id: number): Observable<Designation> {
    return this.http.get<Designation>(`${this.baseUrl}/designations/${id}`);
  }

  createDesignation(data: DesignationCreate): Observable<Designation> {
    return this.http.post<Designation>(`${this.baseUrl}/designations`, data);
  }

  updateDesignation(id: number, data: DesignationUpdate): Observable<Designation> {
    return this.http.put<Designation>(`${this.baseUrl}/designations/${id}`, data);
  }

  deleteDesignation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/designations/${id}`);
  }

  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(`${this.baseUrl}/offices`);
  }

  getRanks(): Observable<Rank[]> {
    return this.http.get<Rank[]>(`${this.baseUrl}/ranks`);
  }
}
