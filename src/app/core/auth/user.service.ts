import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProtocolDTO } from '../models/protocol-dto';
import { SLRDTO } from '../models/slr-dto';
import { UpdateUserNameDTO } from '../models/update-username-dto';
import { UpdateProfileDTO } from '../models/update-profile--dto';
import { NewPasswordDTO } from '../models/new-password-dto';
import { UserDTO } from '../models/user-dto';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:9002/api/user/'
    : 'http://user-service:9002/api/user/';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserDTO> {
  return this.http.get<UserDTO>(`${this.API_URL}my-profile`);
}


  findAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.API_URL}all`);
  }

  getUserById(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.API_URL}${userId}`);
  }

   updateProfile(id: number, dto: UpdateProfileDTO): Observable<any> {
    return this.http.put(`${this.API_URL}${id}/update`, dto);
  }

  updateUsername(dto: UpdateUserNameDTO): Observable<string> {
    return this.http.put(
      `${this.API_URL}update-username`,
      dto,
      { responseType: 'text' }
    );
  }

  changePassword(dto: NewPasswordDTO): Observable<string> {
    return this.http.put(
      `${this.API_URL}change-password`,
      dto,
      { responseType: 'text' }
    );
  }

  deleteProfile(id: number): Observable<string> {
    return this.http.delete(
      `${this.API_URL}${id}/delete-profile`,
      { responseType: 'text' }
    );
  }

  /*REVISIONES SLR */
  
  addCollaborator(slrId: number, email: string): Observable<any> {
    return this.http.put(
      `${this.API_URL}review/${slrId}/add-researcher/${email}`,
      {}
    );
  }

  /*PROTOCOLOS*/

  createProtocol(slrId: number, dto: ProtocolDTO): Observable<ProtocolDTO> {
    return this.http.post<ProtocolDTO>(
      `${this.API_URL}${slrId}/protocol/create`,
      dto
    );
  }

  updateProtocol(dto: ProtocolDTO): Observable<ProtocolDTO> {
    return this.http.put<ProtocolDTO>(
      `${this.API_URL}protocol/update`,
      dto
    );
  }
}


