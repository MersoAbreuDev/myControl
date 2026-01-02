import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  month: string;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(month?: number, year?: number): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`, { params });
  }
}

