import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormInstanceDataDTO, FormInstanceSaveRequestDTO } from '../models/form-instance-data-dto';

@Injectable({
  providedIn: 'root'
})
export class FormInstanceService {
  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/form-instance/'
    : 'http://review-service:9003/api/review/form-instance/';
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

  getFormInstanceData(protocolId: number, snowballingId: number, formType: 'QUALITY' | 'EXTRACTION'): Observable<FormInstanceDataDTO> {
    return this.http.get<FormInstanceDataDTO>(
      `${this.API_URL}protocol/${protocolId}/snowballing/${snowballingId}/type/${formType}`,
      { headers: this.getHeaders() }
    );
  }

  saveFormInstanceData(
    protocolId: number,
    snowballingId: number,
    formType: 'QUALITY' | 'EXTRACTION',
    request: FormInstanceSaveRequestDTO
  ): Observable<FormInstanceDataDTO> {
    return this.http.put<FormInstanceDataDTO>(
      `${this.API_URL}protocol/${protocolId}/snowballing/${snowballingId}/type/${formType}`,
      request,
      { headers: this.getHeaders() }
    );
  }
}
