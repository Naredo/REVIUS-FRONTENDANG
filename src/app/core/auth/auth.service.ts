import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';
import { environment } from '../../../enviroment';

export interface LoginResponse {
  userId: number;
  tokenDTO: {
    token: string;
  };
}

export interface RegisterUser {
  userName: string;
  password: string;
  isAdmin: boolean;
  completeName: string;
  workField: string;
  institution: string;
  email: string;
}

export interface User {
  userId?: number;
  userName: string;
  completeName: string;
  email: string;
  workField: string;
  institution: string;
  isAdmin: boolean;
}



interface JwtPayload {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}




@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:9002/api/login/'
    : 'http://user-service:9002/api/login/';
  private isBrowser: boolean;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  
    private loadUserFromStorage() {
    if (!this.isBrowser) return;

    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.userSubject.next(JSON.parse(userJson));
    }
  }

  login(userName: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.API_URL, {
      userName,
      password
    });
  }

  register(user: RegisterUser): Observable<any> {
    return this.http.post(
      `${this.API_URL}register`,
      user,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  validate(token: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}validate`, null, {
      params: {
        token
      }
    });
  }

  saveSession(response: LoginResponse) {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', response.tokenDTO.token);
      localStorage.setItem('userId', response.userId.toString());
       
    }
  }
    setUser(user: User) {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
  }
setUserFromToken(token: string) {
  const decoded = jwtDecode<JwtPayload>(token);

  const user: User = {
    userName: decoded.sub,
    completeName: '',
    email: '',
    workField: '',
    institution: '',
    isAdmin: decoded.roles.includes('ROLE_ADMIN')
  };

  if (this.isBrowser) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  this.userSubject.next(user);
}
  

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private clearSession() {
    if (!this.isBrowser) {
      this.userSubject.next(null);
      return;
    }

    localStorage.clear();
    this.userSubject.next(null);
  }

  logout() {
    if (!this.isBrowser) {
      this.userSubject.next(null);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.clearSession();
      return;
    }

    const logoutUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:9002/api/logout/'
      : 'http://user-service:9002/api/logout/';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .post(logoutUrl, null, { headers, responseType: 'text' })
      .pipe(finalize(() => this.clearSession()))
      .subscribe({
        next: () => {},
        error: (err) => {
          console.warn('Logout remoto falló; limpiando sesión local igualmente.', err);
        }
      });
  }

  isLoggedIn(): boolean {
  return this.userSubject.value !== null;
}

isAdmin(): boolean {
  return this.userSubject.value?.isAdmin === true;
}

getUser(): User | null {
  return this.userSubject.value;
}

}
