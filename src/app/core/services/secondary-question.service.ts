import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SecondaryQuestionDTO } from '../models/secondary-question-dto';

@Injectable({
  providedIn: 'root'
})
export class SecondaryQuestionService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/secondary-question/'
    : 'http://review-service:9003/api/review/secondary-question/';
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

  createAndSave(secondaryQuestion: SecondaryQuestionDTO, mainQuestionId: number): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}${mainQuestionId}/create`,
      secondaryQuestion,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
