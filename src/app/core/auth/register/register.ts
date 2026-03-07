import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  form: FormGroup;

  showPassword = false;
  showRepeatedPassword = false;

  errors = {
    username: '',
    password: '',
    repeatedPassword: '',
    name: '',
    email: '',
    workField: '',
    institution: ''
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      repeatedPassword: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      workField: ['', Validators.required],
      institution: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleRepeatedPassword() {
    this.showRepeatedPassword = !this.showRepeatedPassword;
  }

 onSignUp() {
  this.resetErrors();
  console.log('Registering user');
  const {
    username,
    password,
    repeatedPassword,
    name,
    email,
    workField,
    institution
  } = this.form.value;

  if (!username) {
    this.errors.username = 'Username vacío';
    return;
  }

  if (!password) {
    this.errors.password = 'Password vacío';
    return;
  }

  if (password !== repeatedPassword) {
    this.errors.repeatedPassword = 'Las contraseñas no coinciden';
    return;
  }

  if (!name) {
    this.errors.name = 'Nombre vacío';
    return;
  }

  if (!email) {
    this.errors.email = 'Email vacío';
    return;
  }

  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    this.errors.email = 'Email inválido';
    return;
  }

  if (!workField) {
    this.errors.workField = 'Campo de trabajo vacío';
    return;
  }

  if (!institution) {
    this.errors.institution = 'Institución vacía';
    return;
  }

  if (!/^(?=.*[ña-z])(?=.*[ÑA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[ña-zÑA-Z\d!@#$%^&*(),.?":{}|<>]{8,32}$/.test(password)) {
    this.errors.password = 'Password inválido';
    return;
  }

  const user = {
    userName: username,
    password,
    isAdmin: false,
    completeName: name,
    workField,
    institution,
    email
  };

  this.authService.register(user).subscribe({
    next: (res) => {
      console.log('RESPUESTA OK', res.status);
      this.router.navigateByUrl('/login');
    },
    error: (err) => {
      console.error('ERROR', err);
    }
  });
}

  private resetErrors() {
    Object.keys(this.errors).forEach(
      key => (this.errors[key as keyof typeof this.errors] = '')
    );
  }

}
