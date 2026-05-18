import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProtocolDTO } from '../models/protocol-dto';
import { StudySelectionCriterionDTO } from '../models/study-selection-criterion-dto';
import { FormFieldDTO } from '../models/form-field-dto';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProtocolService {

  private readonly API_URL = `${environment.apiUrl}/api/review/protocol/`;
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

  findAll(): Observable<ProtocolDTO[]> {
    return this.http.get<ProtocolDTO[]>(
      `${this.API_URL}all`,
      { headers: this.getHeaders() }
    );
  }

  findOne(protocolId: number): Observable<ProtocolDTO> {
    return this.http.get<ProtocolDTO>(
      `${this.API_URL}${protocolId}`,
      { headers: this.getHeaders() }
    );
  }

  createAndSave(protocol: ProtocolDTO, slrId: number): Observable<ProtocolDTO> {
    return this.http.post<ProtocolDTO>(
      `${this.API_URL}${slrId}/create`,
      protocol,
      { headers: this.getHeaders() }
    );
  }

  update(protocol: ProtocolDTO): Observable<ProtocolDTO> {
    return this.http.put<ProtocolDTO>(
      `${this.API_URL}update`,
      protocol,
      { headers: this.getHeaders() }
    );
  }

  delete(protocolId: number): Observable<any> {
    return this.http.delete(
      `${this.API_URL}${protocolId}/delete`,
      { headers: this.getHeaders() }
    );
  }

  findSelectionCriterionsByProtocolId(protocolId: number): Observable<StudySelectionCriterionDTO[]> {
    return this.http.get<StudySelectionCriterionDTO[]>(
      `${this.API_URL}${protocolId}/get-selection-criteria`,
      { headers: this.getHeaders() }
    );
  }

  findFormData(protocolId: number, formType: 'QUALITY' | 'EXTRACTION'): Observable<FormFieldDTO[]> {
    return this.http.get<FormFieldDTO[]>(
      `${this.API_URL}${protocolId}/get-form-data/${formType}`,
      { headers: this.getHeaders() }
    );
  }
}
