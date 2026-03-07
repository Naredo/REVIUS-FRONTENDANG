import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SLRDTO, SLRResponse } from './models/slr.model';
import { environment } from '../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/'
    : 'http://review-service:9003/api/review/';
  private readonly USER_API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9002/api/user/'
    : 'http://user-service:9002/api/user/';
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
      console.log('Token desde localStorage:', token ? '✓ Presente' : '✗ No encontrado');
      if (token) {
        console.log('Token valor:', token);
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    console.log('Headers enviados:', headers.keys());
    return headers;
  }

  createSLR(userId: number, slrData: SLRDTO): Observable<SLRDTO> {
    console.log('Creando SLR con datos:', slrData);
    console.log('URL:', `${this.USER_API_URL}${userId}/review/create`);
    return this.http.post<SLRDTO>(
      `${this.USER_API_URL}${userId}/review/create`,
      slrData,
      { headers: this.getHeaders() }
    );
  }

  
  getSLRsByUser(userId: number): Observable<SLRDTO[]> {
    console.log('Obteniendo reviews para userId:', userId);
    const userEndpoint = `${this.USER_API_URL}${userId}/my-principal-reviews`;
    console.log('URL (user endpoint):', userEndpoint);
    return this.http.get<SLRDTO[]>(
      userEndpoint,
      { headers: this.getHeaders() }
    );
  }

  getSLRById(reviewId: number): Observable<SLRDTO> {
    return this.http.get<SLRDTO>(
      `${this.API_URL}${reviewId}`,
      { headers: this.getHeaders() }
    );
  }

  updateSLR(reviewId: number, slrData: SLRDTO): Observable<SLRDTO> {
    console.log('URL:', `${this.API_URL}${reviewId}/edit`);
    console.log('Datos a enviar:', slrData);
    return this.http.put<SLRDTO>(
      `${this.API_URL}${reviewId}/edit`,
      slrData,
      { headers: this.getHeaders() }
    );
  }

  deleteSLR(reviewId: number): Observable<any> {
    return this.http.delete(
      `${this.API_URL}${reviewId}/delete`,
      { headers: this.getHeaders() }
    );
  }

   getMyCollaborativeSLRs(userId: number): Observable<SLRDTO[]> {
    return this.http.get<SLRDTO[]>(
      `${this.API_URL}${userId}/my-collaborative-reviews`
    );
  }
}
