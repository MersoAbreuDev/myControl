import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
  id?: number;
  userId?: number;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  status: 'open' | 'paid';
  dueDate: string;
  paidDate?: string | null;
  recurrence: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionDto {
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  dueDate: string;
  recurrence: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  create(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(`${environment.apiUrl}/transactions`, transaction);
  }

  findAll(type?: string, status?: string, month?: number, year?: number): Observable<Transaction[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (month) {
      params = params.set('month', month.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions`, { params });
  }

  findOne(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${environment.apiUrl}/transactions/${id}`);
  }

  update(id: number, transaction: Partial<CreateTransactionDto>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${environment.apiUrl}/transactions/${id}`, transaction);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/transactions/${id}`);
  }

  markAsPaid(id: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${environment.apiUrl}/transactions/${id}/mark-as-paid`, {});
  }
}

