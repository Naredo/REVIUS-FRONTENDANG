import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService} from '../user.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {

  userName = '';
  password = '';

  usernameError = '';
  passwordError = '';

  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  onLoginClick() {
    this.usernameError = '';
    this.passwordError = '';

    if (!this.userName) {
      this.usernameError = 'Username vacío';
      return;
    }

    if (!this.password) {
      this.passwordError = 'Password vacío';
      return;
    }

    const passwordRegex =
      /^(?=.*[ña-z])(?=.*[ÑA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[ña-zÑA-Z\d!@#$%^&*(),.?":{}|<>]{8,32}$/;

    if (!passwordRegex.test(this.password)) {
      this.passwordError = 'Password inválido';
      return;
    }

    this.login();
  }

 login() {
  this.authService.login(this.userName, this.password)
    .subscribe({
      next: (data) => {
        this.authService.saveSession(data);
        this.authService.validate(data.tokenDTO.token)

          .subscribe({
            next: (user) => {
              this.authService.setUser(user);
              this.authService.setUserFromToken(data.tokenDTO.token);
              this.router.navigate(['/reviews']);
            },
            error: () => {
              alert('Error validando sesión');
            }
          });
      },
      error: () => {
        alert('Error en login');
      }
    });
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/signup']);
  }
}