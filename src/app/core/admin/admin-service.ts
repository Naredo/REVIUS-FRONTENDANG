import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../models/user-dto';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9002/api/admin/'
    : 'http://user-service:9002/api/admin/';

  constructor(private http: HttpClient) {}

 
  findAllAdmins(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.API_URL}all`);
  }

  deleteUserProfile(id: number): Observable<string> {
    return this.http.delete(
      `${this.API_URL}user/${id}/delete-profile`,
      { responseType: 'text' }
    );
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete(
      `${this.API_URL}user/${id}/delete`,
      { responseType: 'text' }
    );
  }
  changeAuthority(id: number): Observable<string> {
    return this.http.put(
      `${this.API_URL}user/${id}/change-authority`,
      {},
      { responseType: 'text' }
    );
  }
}
