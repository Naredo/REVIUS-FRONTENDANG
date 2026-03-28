import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService, SLRDTO } from '../../reviews';
import { UserService } from '../../core/auth/user.service';
import { UserDTO } from '../../core/models/user-dto';
import { DataRefreshService } from '../../shared/services/data-refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.scss']
})
export class ReviewsComponent implements OnInit, OnDestroy {

  reviewForm: FormGroup;
  reviews: SLRDTO[] = [];
  loading = false;
  showCreateForm = false;
  userId: number = 0;
  page: number = 0;
  isEditing = false;
  editingReviewId?: number;
  submitError = '';
  showDetailPanel = false;
  selectedReviewDetail?: SLRDTO;
  detailLoading = false;
  collaboratorEmail = '';
  collaboratorSearchLoading = false;
  collaboratorAddLoading = false;
  collaboratorSearchError = '';
  collaboratorSearchResult?: UserDTO;
  collaboratorActionMessage = '';
  private isBrowser: boolean;
  private refreshSubscription?: Subscription;
  private pollingIntervalId?: number;

  constructor(
    private reviewService: ReviewService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private refreshService: DataRefreshService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      objective: ['', Validators.required],
      workField: ['', Validators.required],
      publicVisibility: [false, Validators.required]
    });
  }

  ngOnInit() {
    this.loadUserIdAndReviews();
    this.refreshSubscription = this.refreshService.refreshReviews$.subscribe(() => {
      console.log('Refresco de reviews disparado');
      if (this.userId) {
        this.loadReviews();
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    this.stopPollingPrincipalReviews();
  }

  loadUserIdAndReviews() {
    if (!this.isBrowser) return;
    
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.userId = parseInt(userIdStr, 10);
      console.log('UserId cargado:', this.userId);
      this.loadReviews();
      this.startPollingPrincipalReviews();
      this.cdr.markForCheck();
    } else {
      console.log('No userId en localStorage');
      this.cdr.markForCheck();
    }
  }

  startPollingPrincipalReviews() {
    if (!this.isBrowser || !this.userId) return;
    this.fetchPrincipalReviews();
    
    this.pollingIntervalId = window.setInterval(() => this.fetchPrincipalReviews(), 10000) as unknown as number;
  }

  stopPollingPrincipalReviews() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = undefined;
    }
  }

  async fetchPrincipalReviews() {
    if (!this.isBrowser || !this.userId) return;
    const accessToken = localStorage.getItem('accessToken');
    const url = `http://localhost:9002/api/user/${this.userId}/my-principal-reviews`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });

      if (res.status === 200) {
        const data = await res.json();
        this.reviews = data || [];
      } else if (res.status === 204) {
        this.reviews = [];
      } else {
        console.warn('fetchPrincipalReviews: status', res.status);
      }
    } catch (err) {
      console.error('Error en fetchPrincipalReviews:', err);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  handleChangePage(event: any, newPage: number) {
    this.page = newPage;
  }

  viewDetails(review: SLRDTO) {
    if (!review || !review.id) return;
    this.detailLoading = true;
    this.showDetailPanel = true;
    this.resetCollaboratorSearch();
    this.reviewService.getSLRById(review.id).subscribe({
      next: (detail) => {
        console.log('Detalles de review cargados:', detail);
        console.log('Principal researcher:', detail.principalResearcher);
        console.log('Collaborators:', detail.collaboratorResearchers);
        if (detail.collaboratorResearchers && detail.collaboratorResearchers.length > 0) {
          console.log('Primer colaborador:', detail.collaboratorResearchers[0]);
        }
        this.selectedReviewDetail = detail;
        this.detailLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando detalles:', err);
        this.selectedReviewDetail = review;
        this.detailLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeDetailPanel() {
    this.showDetailPanel = false;
    this.selectedReviewDetail = undefined;
    this.resetCollaboratorSearch();
    this.cdr.markForCheck();
  }

  searchCollaboratorByEmail() {
    const email = this.collaboratorEmail.trim();
    this.collaboratorSearchError = '';
    this.collaboratorActionMessage = '';
    this.collaboratorSearchResult = undefined;

    if (!email) {
      this.collaboratorSearchError = 'Introduce un email para buscar';
      return;
    }

    this.collaboratorSearchLoading = true;
    this.userService.findByEmail(email).subscribe({
      next: (user) => {
        this.collaboratorSearchResult = user;
        this.collaboratorSearchLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.collaboratorSearchLoading = false;
        this.collaboratorSearchError = err?.status === 404
          ? 'No se encontró un usuario con ese email'
          : 'Error al buscar usuario por email';
        this.cdr.markForCheck();
      }
    });
  }

  addCollaboratorToSelectedReview() {
    const slrId = this.selectedReviewDetail?.id;
    const email = this.collaboratorSearchResult?.email || this.collaboratorEmail.trim();

    this.collaboratorSearchError = '';
    this.collaboratorActionMessage = '';

    if (!slrId || !email) {
      this.collaboratorSearchError = 'Selecciona una revisión y busca un usuario válido';
      return;
    }

    this.collaboratorAddLoading = true;
    this.userService.addCollaborator(slrId, email).subscribe({
      next: () => {
        this.collaboratorAddLoading = false;
        this.collaboratorActionMessage = 'Colaborador añadido correctamente';
        this.reviewService.getSLRById(slrId).subscribe({
          next: (detail) => {
            this.selectedReviewDetail = detail;
            this.cdr.markForCheck();
          },
          error: () => {
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.collaboratorAddLoading = false;
        this.collaboratorSearchError = err?.error || 'Error al añadir colaborador';
        this.cdr.markForCheck();
      }
    });
  }

  private resetCollaboratorSearch() {
    this.collaboratorEmail = '';
    this.collaboratorSearchLoading = false;
    this.collaboratorAddLoading = false;
    this.collaboratorSearchError = '';
    this.collaboratorSearchResult = undefined;
    this.collaboratorActionMessage = '';
  }

  loadReviews() {
    if (!this.userId) {
      console.log('Sin userId, no se pueden cargar reviews');
      return;
    }
    console.log('Iniciando loadReviews');
    this.loading = true;
    this.reviewService.getSLRsByUser(this.userId).subscribe({
      next: (reviews) => {
        console.log('✓ Reviews cargadas:', reviews);
        console.log('Cantidad:', reviews ? reviews.length : 0);
        this.reviews = reviews || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando reviews:', err);        
        if (err.status === 404) {
          console.log('Endpoint retorna 404 - Sin reviews o endpoint no configurado');
          this.reviews = [];
        } else {
          this.reviews = [];
        }
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.reviewForm.reset();
      this.submitError = '';
      this.isEditing = false;
      this.editingReviewId = undefined;
    } else {
      
      this.isEditing = false;
      this.editingReviewId = undefined;
    }
  }

  onCreateReview() {
    if (this.reviewForm.invalid) {
      this.submitError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.submitError = '';

    const slrData: SLRDTO = {
      title: this.reviewForm.value.title,
      description: this.reviewForm.value.description,
      objective: this.reviewForm.value.objective,
      workField: this.reviewForm.value.workField,
      publicVisibility: this.reviewForm.value.publicVisibility || false,
      initDate: null as any,
      endDate: null as any,
      protocol: null as any,
      report: null as any,
      principalResearcher: null as any,
      collaboratorResearchers: []
    };
    if (this.isEditing && this.editingReviewId) {
      
      console.log('Actualizando review id:', this.editingReviewId);
      this.reviewService.updateSLR(this.editingReviewId, slrData).subscribe({
        next: (updated) => {
          console.log('Respuesta updateSLR:', updated);
          
          let updatedObj: SLRDTO;
          if (updated && typeof updated === 'object' && (updated.id || updated.title)) {
            updatedObj = updated as SLRDTO;
          } else {
            updatedObj = { ...(slrData as SLRDTO), id: this.editingReviewId };
          }
         
          this.reviews = this.reviews.map(r => r.id === updatedObj.id ? updatedObj : r);
          this.reviewForm.reset();
          this.isEditing = false;
          this.editingReviewId = undefined;
          this.showCreateForm = false;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error actualizando review:', err);
          this.submitError = err.error?.message || err.message || 'Error al actualizar la revisión';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      
      this.reviewService.createSLR(this.userId, slrData).subscribe({
        next: (newReview) => {
          console.log('Review creada:', newReview);
          this.reviews.unshift(newReview);
          this.reviewForm.reset();
          this.showCreateForm = false;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error completo:', err);
          console.error('Status:', err.status);
          console.error('Error body:', err.error);
          this.submitError = err.error?.message || 'Error al crear la revisión';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  startEdit(review: SLRDTO) {
    if (!review || !review.id) return;
    this.isEditing = true;
    this.editingReviewId = review.id;
    this.showCreateForm = true;
    this.submitError = '';
    this.reviewForm.patchValue({
      title: review.title,
      description: review.description,
      objective: review.objective,
      workField: review.workField,
      publicVisibility: review.publicVisibility
    });
    this.cdr.markForCheck();
  }

  manageProtocol(reviewId: number) {
    this.router.navigate(['/protocol', reviewId]);
  }

  manageReport(reviewId: number) {
    this.router.navigate(['/report', reviewId]);
  }

  deleteReview(reviewId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta revisión?')) {
      this.reviewService.deleteSLR(reviewId).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error eliminando review:', err);
          alert('Error al eliminar la revisión');
          this.cdr.markForCheck();
        }
      });
    }
  }
}
