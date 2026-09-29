import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rank } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class RankService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getRanks(): Observable<Rank[]> {
    return this.http.get<Rank[]>(`${this.baseUrl}/ranks`);
  }

  createRank(data: { name: string }): Observable<Rank> {
    return this.http.post<Rank>(`${this.baseUrl}/ranks`, data);
  }

  updateRank(id: number, data: { name: string }): Observable<Rank> {
    return this.http.put<Rank>(`${this.baseUrl}/ranks/${id}`, data);
  }

  deleteRank(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ranks/${id}`);
  }
}
