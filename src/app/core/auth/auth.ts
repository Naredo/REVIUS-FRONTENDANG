import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(private authService: AuthService) {}

  login(userName: string, password: string) {
    return this.authService.login(userName, password);
  }

  saveSession(response: any) {
    this.authService.saveSession(response);
  }

  getToken(): string | null {
    return this.authService.getToken();
  }

  logout() {
    this.authService.logout();
  }
}
