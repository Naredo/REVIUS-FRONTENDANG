import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScopusSearchDTO } from '../models/scopus-search-dto';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ScopusService {
  private readonly API_URL = `${environment.apiUrl}/scopus/`;

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

  search(search: ScopusSearchDTO): Observable<ScopusSearchDTO> {
    return this.http.post<ScopusSearchDTO>(
      `${this.API_URL}search`,
      search,
      { headers: this.getHeaders() }
    );
  }
}
