import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Finanzierung, FinanzierungRequest } from '../models';

@Injectable({
    providedIn: 'root',
})
export class FinanzierungService {
    private readonly apiUrl = 'http://localhost:8080/api/finanzierung';

    constructor(private http: HttpClient) {}

    calculateFinanzierung(request: FinanzierungRequest): Observable<Finanzierung> {
        return this.http.post<Finanzierung>(`${this.apiUrl}/calculate`, request);
    }
}
