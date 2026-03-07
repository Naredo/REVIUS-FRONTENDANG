import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportDTO } from '../models/report-dto';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/report/'
    : 'http://review-service:9003/api/review/report/';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (this.isBrowser) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  }

  findAll(): Observable<ReportDTO[]> {
    return this.http.get<ReportDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findOne(reportId: number): Observable<ReportDTO> {
    return this.http.get<ReportDTO>(
      `${this.API_URL}${reportId}`,
      { headers: this.getHeaders() }
    );
  }

  createAndSave(report: ReportDTO, slrId: number): Observable<ReportDTO> {
    return this.http.post<ReportDTO>(
      `${this.API_URL}${slrId}/create`,
      report,
      { headers: this.getHeaders() }
    );
  }

  update(report: ReportDTO): Observable<ReportDTO> {
    return this.http.put<ReportDTO>(
      `${this.API_URL}update`,
      report,
      { headers: this.getHeaders() }
    );
  }

  delete(reportId: number, slrId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${reportId}/slr/${slrId}/delete`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
