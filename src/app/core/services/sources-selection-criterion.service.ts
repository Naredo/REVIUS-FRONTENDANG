import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SourcesSelectionCriterionDTO } from '../models/sources-selection-criterion-dto';

@Injectable({
  providedIn: 'root'
})
export class SourcesSelectionCriterionService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/sources-selection-criterion/'
    : 'http://review-service:9003/api/review/sources-selection-criterion/';
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

  createAndSave(criterion: SourcesSelectionCriterionDTO, protocolId: number): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}${protocolId}/create`,
      criterion,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
