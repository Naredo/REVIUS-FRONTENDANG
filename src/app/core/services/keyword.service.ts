import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeywordDTO } from '../models/keyword-dto';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class KeywordService {

  private readonly API_URL = `${environment.apiUrl}/api/review/keyword/`;
  private readonly PROTOCOL_API_URL = `${environment.apiUrl}/api/review/protocol/`;
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

  createAndSave(keyword: KeywordDTO, protocolId: number): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}${protocolId}/create`,
      keyword,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  findAll(): Observable<KeywordDTO[]> {
    return this.http.get<KeywordDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findOne(id: number): Observable<KeywordDTO> {
    return this.http.get<KeywordDTO>(
      `${this.API_URL}${id}`,
      { headers: this.getHeaders() }
    );
  }

  update(keyword: KeywordDTO): Observable<KeywordDTO> {
    if (!keyword.id) {
      throw new Error('Keyword ID is required to update keyword');
    }

    return this.http.put<KeywordDTO>(
      `${this.API_URL}${keyword.id}/edit`,
      keyword,
      { headers: this.getHeaders() }
    );
  }

  deleteFromProtocol(keyword: KeywordDTO, protocolId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.PROTOCOL_API_URL}${protocolId}/delete-keyword?keywordId=${keyword.id}`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  delete(keywordId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${keywordId}/delete`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
