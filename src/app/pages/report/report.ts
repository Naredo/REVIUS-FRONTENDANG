import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { ReportDTO } from '../../core/models/report-dto';
import { ReviewService } from '../../reviews/review.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './report.html',
  styleUrls: ['./report.scss']
})
export class ReportComponent implements OnInit {

  reportForm: FormGroup;
  slrId: number = 0;
  reportId?: number;
  loading = false;
  submitError = '';
  existingReport?: ReportDTO;
  private isBrowser: boolean;

  constructor(
    private reportService: ReportService,
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.reportForm = this.fb.group({
      resume: ['', [Validators.required, Validators.minLength(50)]],
      conclusions: ['', [Validators.required, Validators.minLength(50)]],
      analysis: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('slrId');
      if (id) {
        this.slrId = parseInt(id, 10);
        this.loadReport();
      }
    });
  }

  loadReport() {
    if (!this.slrId) return;
    
    this.loading = true;
    this.reviewService.getSLRById(this.slrId).subscribe({
      next: (slr) => {
        if (slr.report && slr.report.id) {
          this.reportId = slr.report.id;
          this.reportService.findOne(this.reportId).subscribe({
            next: (report) => {
              this.existingReport = report;
              this.reportForm.patchValue({
                resume: report.resume || '',
                conclusions: report.conclusions || '',
                analysis: report.analysis || ''
              });
              this.loading = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Error cargando reporte:', err);
              this.loading = false;
              this.cdr.markForCheck();
            }
          });
          return;
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando SLR:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitReport() {
    if (this.reportForm.invalid) {
      this.submitError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.submitError = '';

    const reportData: ReportDTO = {
      ...this.reportForm.value,
      slrId: this.slrId
    };

    if (this.reportId) {
      // Actualizar
      this.reportService.update({ ...reportData, id: this.reportId }).subscribe({
        next: () => {
          alert('Reporte actualizado correctamente');
          this.router.navigate(['/reviews']);
        },
        error: (err) => {
          console.error('Error actualizando reporte:', err);
          this.submitError = 'Error al actualizar el reporte';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      // Crear
      this.reportService.createAndSave(reportData, this.slrId).subscribe({
        next: (created) => {
          this.reportId = created.id;
          alert('Reporte creado correctamente');
          this.router.navigate(['/reviews']);
        },
        error: (err) => {
          console.error('Error creando reporte:', err);
          this.submitError = 'Error al crear el reporte';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/reviews']);
  }
}
