import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SourceDTO } from '../models/source-dto';

@Injectable({
  providedIn: 'root'
})
export class SourceService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/data-source/'
    : 'http://review-service:9003/api/review/data-source/';
  private readonly PROTOCOL_API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/protocol/'
    : 'http://review-service:9003/api/review/protocol/';
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

  findAll(): Observable<SourceDTO[]> {
    return this.http.get<SourceDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findOne(id: number): Observable<SourceDTO> {
    return this.http.get<SourceDTO>(
      `${this.API_URL}${id}`,
      { headers: this.getHeaders() }
    );
  }

  createAndSave(source: SourceDTO, protocolId: number): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}${protocolId}/create`,
      source,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  update(source: SourceDTO): Observable<void> {
    const sourceId = (source as any)?.id;
    return this.http.put<void>(
      `${this.API_URL}${sourceId}/edit`,
      source,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  delete(sourceId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${sourceId}/delete`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  deleteFromProtocol(sourceId: number, protocolId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.PROTOCOL_API_URL}${protocolId}/delete-source?sourceId=${sourceId}`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
