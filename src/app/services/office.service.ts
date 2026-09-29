import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Office } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(`${this.baseUrl}/offices`);
  }

  createOffice(data: Partial<Office>): Observable<Office> {
    return this.http.post<Office>(`${this.baseUrl}/offices`, data);
  }

  updateOffice(id: number, data: Partial<Office>): Observable<Office> {
    return this.http.put<Office>(`${this.baseUrl}/offices/${id}`, data);
  }

  deleteOffice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/offices/${id}`);
  }
}
