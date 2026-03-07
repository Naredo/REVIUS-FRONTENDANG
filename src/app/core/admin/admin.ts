import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin/admin-service';
import { UserDTO } from '../../core/models/user-dto';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../core/auth/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class Admin implements OnInit {

  admins: UserDTO[] = [];
  loading = false;
  errorMsg: string | null = null;
  users$!: Observable<UserDTO[]>;
  constructor(private adminService: AdminService,  private cdr: ChangeDetectorRef,private userService: UserService) {}

  ngOnInit(): void {
    this.loadAdmins();
     this.users$ = this.userService.findAllUsers();
  }


  loadAdmins(): void {
  this.loading = true;
  this.errorMsg = null;

  this.adminService.findAllAdmins().subscribe({
    next: (data) => {
      this.admins = data ?? [];
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      if (err.status === 204) {
        this.admins = [];
        this.errorMsg = null;
      } else {
        this.errorMsg = 'Error cargando administradores';
      }
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}



  toggleAuthority(user: UserDTO): void {
    if (!confirm(`¿Cambiar permisos de ${user.userName}?`)) {
      return;
    }

    this.adminService.changeAuthority(user.id!).subscribe({
      next: (msg) => {
        alert(msg);
        this.loadAdmins();
      },
      error: (err) => {
        alert(err.error || 'Error cambiando permisos');
      }
    });
  }

  deleteProfile(user: UserDTO): void {
    if (!confirm(`¿Eliminar el perfil de ${user.userName}?`)) {
      return;
    }

    this.adminService.deleteUserProfile(user.id!).subscribe({
      next: (msg) => {
        alert(msg);
        window.location.reload();
      },
      error: (err) => {
        alert(err.error || 'Error eliminando perfil');
      }
    });
  }


  deleteUser(user: UserDTO): void {
    if (!confirm(`⚠️ Eliminar DEFINITIVAMENTE a ${user.userName}?`)) {
      return;
    }

    this.adminService.deleteUser(user.id!).subscribe({
      next: (msg) => {
        alert(msg);
       window.location.reload();

      },
      error: (err) => {
        alert(err.error || 'Error eliminando usuario');
      }
    });
  }
}
