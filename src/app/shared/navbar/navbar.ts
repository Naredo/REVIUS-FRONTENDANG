import { Component,OnInit,ChangeDetectorRef,Inject,PLATFORM_ID} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {FormBuilder,FormGroup,ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService} from '../../core/auth/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { DataRefreshService } from '../services/data-refresh.service';
import { UserDTO } from '../../core/models/user-dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule   ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  showProfileModal = false;
  loadingProfile = false;
  savingProfile = false;

  userProfile: UserDTO | null = null;
  profileForm!: FormGroup;

  isBrowser = false;
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private refreshService: DataRefreshService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
  
  }



goToAdmin(): void {
  this.showProfileModal = false;
  this.router.navigate(['/admin']);
}



  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showProfileModal = false;
    this.userProfile = null;
    this.router.navigate(['/login']);
  }

  /* PROFILE MODAL */

  openProfileModal(): void {
    this.showProfileModal = true;
    this.loadingProfile = true;

    this.userService.getProfile().subscribe({
      next: (profile: UserDTO) => {
        this.userProfile = profile;

        this.profileForm = this.fb.group({
          name: [profile.completeName],
          email: [profile.email],
          workField: [profile.workField],
          institution: [profile.institution],
          userName: [profile.userName],
          oldPassword: [''],
          newPassword: ['']
        });

        this.loadingProfile = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.loadingProfile = false;
        this.showProfileModal = false;
        alert('Error al cargar el perfil');
        this.cdr.markForCheck();
      }
    });
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  cancelEdit(): void {
    this.showProfileModal = false;
  }

  saveProfile(): void {
    if (!this.userProfile || this.profileForm.invalid) {
      return;
    }

    this.savingProfile = true;

    this.userService
      .updateProfile(this.userProfile.id!, this.profileForm.value)
      .subscribe({
        next: () => {
          this.savingProfile = false;
          this.showProfileModal = false;
          this.refreshService.triggerReviewsRefresh();
        },
        error: (err) => {
          console.error('Error guardando perfil:', err);
          this.savingProfile = false;
          alert('Error al guardar el perfil');
        }
      });

      if(this.profileForm.get('oldPassword')?.value && !this.profileForm.get('newPassword')?.value){
        const userName = this.profileForm.get('userName')?.value;
        const password = this.profileForm.get('oldPassword')?.value;
        
        this.userService.updateUsername({
          userName,
          password
        }).subscribe({
          next: (msg) => {
            alert(msg);
            this.logout();
          },
          error: err => {
            console.error('Error actualizando username:', err);
            alert(err.error || 'Error al actualizar el nombre de usuario');
          }
        });
      }
      if(this.profileForm.get('oldPassword')?.value && this.profileForm.get('newPassword')?.value){
        
        const oldPassword = this.profileForm.get('oldPassword')?.value;
        const newPassword = this.profileForm.get('newPassword')?.value;
         const dto = {
          username: this.userProfile.userName,
          oldPassword,
          newPassword
        };
          this.userService.changePassword(dto).subscribe({
            next: () => {
              alert('Contraseña cambiada correctamente');
              this.profileForm.patchValue({
                oldPassword: '',
                newPassword: ''
              });
              this.logout();
            },
            error: err => {
              console.error('Error cambiando contraseña:', err);
              alert('Error al cambiar la contraseña');
            }
          });
     }
        }

}
