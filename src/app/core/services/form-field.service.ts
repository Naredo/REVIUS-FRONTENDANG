import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormFieldDTO } from '../models/form-field-dto';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class FormFieldService {

  private readonly API_URL = `${environment.apiUrl}/api/review/form-field/`;
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

  findAll(): Observable<FormFieldDTO[]> {
    return this.http.get<FormFieldDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findOne(id: number): Observable<FormFieldDTO> {
    return this.http.get<FormFieldDTO>(
      `${this.API_URL}${id}`,
      { headers: this.getHeaders() }
    );
  }

  createAndSave(formField: FormFieldDTO, formId: number): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}${formId}/create`,
      formField,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }

  update(field: FormFieldDTO): Observable<FormFieldDTO> {
    return this.http.put<FormFieldDTO>(
      `${this.API_URL}update`,
      field,
      { headers: this.getHeaders() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}${id}/delete`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}
