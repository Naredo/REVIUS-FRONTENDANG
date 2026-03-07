import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login';
import { Register } from './core/auth/register/register';
import { ReviewsComponent } from './pages/reviews/reviews';
import { Admin } from './core/admin/admin';
import { ProtocolComponent } from './pages/protocol/protocol';
import { ReportComponent } from './pages/report/report';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'protocol/:slrId', component: ProtocolComponent },
  { path: 'report/:slrId', component: ReportComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'signup', component: Register },
  { path: 'admin', component: Admin },
];
