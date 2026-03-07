import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormDTO } from '../models/form-dto';
import { FormFieldDTO } from '../models/form-field-dto';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9003/api/review/form/'
    : 'http://review-service:9003/api/review/form/';
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

  findOne(formId: number): Observable<FormDTO> {
    return this.http.get<FormDTO>(
      `${this.API_URL}${formId}`,
      { headers: this.getHeaders() }
    );
  }

  findAll(): Observable<FormDTO[]> {
    return this.http.get<FormDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findFormWithFields(protocolId: number, formType: 'QUALITY' | 'EXTRACTION'): Observable<FormFieldDTO[]> {
    return this.http.get<FormFieldDTO[]>(
      `${this.API_URL}protocol/${protocolId}/type/${formType}/fields`,
      { headers: this.getHeaders() }
    );
  }

  createAndSave(form: FormDTO, protocolId: number): Observable<number> {
    return this.http.post<number>(
      `${this.API_URL}${protocolId}/create`,
      form,
      { headers: this.getHeaders() }
    );
  }

  update(form: FormDTO): Observable<FormDTO> {
    return this.http.put<FormDTO>(
      `${this.API_URL}update`,
      form,
      { headers: this.getHeaders() }
    );
  }

  delete(form: FormDTO): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${form.id}/delete`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
