import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SnowballingDTO } from '../models/snowballing-dto';

@Injectable({
  providedIn: 'root'
})
export class SnowballingService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/snowballing/'
    : 'http://review-service:9003/api/review/snowballing/';
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

  findAll(): Observable<SnowballingDTO[]> {
    return this.http.get<SnowballingDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findOne(id: number): Observable<SnowballingDTO> {
    return this.http.get<SnowballingDTO>(
      `${this.API_URL}${id}`,
      { headers: this.getHeaders() }
    );
  }

  createAndSave(snowballing: SnowballingDTO, protocolId: number): Observable<SnowballingDTO> {
    return this.http.post<SnowballingDTO>(
      `${this.API_URL}${protocolId}/create`,
      snowballing,
      { headers: this.getHeaders() }
    );
  }

  update(snowballing: SnowballingDTO): Observable<SnowballingDTO> {
    return this.http.put<SnowballingDTO>(
      `${this.API_URL}update`,
      snowballing,
      { headers: this.getHeaders() }
    );
  }

  deleteFromProtocol(snowballingId: number, protocolId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${snowballingId}/protocol/${protocolId}/delete`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
