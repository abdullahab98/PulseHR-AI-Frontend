import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentRecord, Employee } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<DocumentRecord[]> {
    return this.http.get<DocumentRecord[]>(`${this.baseUrl}/documents/files`);
  }

  uploadDocument(doc: Partial<DocumentRecord>): Observable<DocumentRecord> {
    return this.http.post<DocumentRecord>(`${this.baseUrl}/documents/files`, doc);
  }

  getEmployees(departmentId?: number, search?: string): Observable<Employee[]> {
    const params: string[] = [];
    if (departmentId) params.push(`department_id=${departmentId}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${query}`);
  }
}
