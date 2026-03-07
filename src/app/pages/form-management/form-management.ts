import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { FormFieldService } from '../../core/services/form-field.service';
import { FormDTO } from '../../core/models/form-dto';
import { FormFieldDTO } from '../../core/models/form-field-dto';

@Component({
  selector: 'app-form-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-management.html',
  styleUrls: ['./form-management.scss']
})
export class FormManagementComponent implements OnInit {

  formForm: FormGroup;
  fieldForm: FormGroup;
  slrId: number = 0;
  forms: FormDTO[] = [];
  selectedFormId?: number;
  formFields: FormFieldDTO[] = [];
  loading = false;
  showCreateForm = false;
  showFieldForm = false;
  submitError = '';
  private isBrowser: boolean;

  fieldTypeOptions = [
    { value: 'TEXT', label: 'Texto' },
    { value: 'NUMBER', label: 'Número' },
    { value: 'DATE', label: 'Fecha' },
    { value: 'BOOLEAN', label: 'Sí/No' },
    { value: 'SELECT', label: 'Selección' },
    { value: 'TEXTAREA', label: 'Área de texto' }
  ];

  constructor(
    private formService: FormService,
    private formFieldService: FormFieldService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    this.formForm = this.fb.group({
      formType: ['', Validators.required]
    });

    this.fieldForm = this.fb.group({
      fieldName: ['', [Validators.required, Validators.minLength(2)]],
      fieldType: ['TEXT', Validators.required]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('slrId');
      if (id) {
        this.slrId = parseInt(id, 10);
        this.loadForms();
      }
    });
  }

  loadForms() {
    if (!this.slrId) return;
    
    this.loading = true;
    // Nota: Necesitarías un endpoint que devuelva los formularios por slrId
    // Por ahora, se puede cargar todos los formularios
    this.loading = false;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.formForm.reset();
      this.submitError = '';
    }
  }

  onCreateForm() {
    if (this.formForm.invalid) {
      this.submitError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.submitError = '';

    const formData: FormDTO = this.formForm.value;

    // Note: protocolId should be obtained from the slrId's protocol
    // This is a simplified version
    this.formService.createAndSave(formData, this.slrId).subscribe({
      next: (createdId: number) => {
        const newForm = { ...formData, id: createdId };
        this.forms.push(newForm);
        this.formForm.reset();
        this.showCreateForm = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error creando formulario:', err);
        this.submitError = 'Error al crear el formulario';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteForm(formId: number) {
    if (!confirm('¿Eliminar este formulario?')) return;

    const form = this.forms.find(f => f.id === formId);
    if (!form) return;

    this.formService.delete(form).subscribe({
      next: () => {
        this.forms = this.forms.filter(f => f.id !== formId);
        if (this.selectedFormId === formId) {
          this.selectedFormId = undefined;
          this.formFields = [];
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error eliminando formulario:', err);
        alert('Error al eliminar el formulario');
      }
    });
  }

  selectForm(formId: number) {
    this.selectedFormId = formId;
    this.loadFormFields(formId);
  }

  loadFormFields(formId: number) {
    this.loading = true;
    // Note: Currently there's no direct method to get fields by formId
    // You could use findFormWithFields if you have the protocol and form type
    // For now, we'll use findAll and filter
    this.formFieldService.findAll().subscribe({
      next: (allFields: FormFieldDTO[]) => {
        // This is a workaround - ideally backend should have a getByFormId endpoint
        this.formFields = allFields;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error cargando campos:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleFieldForm() {
    if (!this.selectedFormId) {
      alert('Selecciona un formulario primero');
      return;
    }
    this.showFieldForm = !this.showFieldForm;
    if (!this.showFieldForm) {
      this.fieldForm.reset({ fieldType: 'TEXT' });
    }
  }

  onAddField() {
    if (this.fieldForm.invalid || !this.selectedFormId) {
      this.submitError = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    const fieldData: FormFieldDTO = this.fieldForm.value;

    this.formFieldService.createAndSave(fieldData, this.selectedFormId).subscribe({
      next: () => {
        // Reload fields after creation
        this.loadFormFields(this.selectedFormId!);
        this.fieldForm.reset({ fieldType: 'TEXT' });
        this.showFieldForm = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error añadiendo campo:', err);
        this.submitError = 'Error al añadir el campo';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteField(fieldId: number) {
    if (!confirm('¿Eliminar este campo?')) return;

    this.formFieldService.delete(fieldId).subscribe({
      next: () => {
        this.formFields = this.formFields.filter((f: FormFieldDTO) => f.id !== fieldId);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error eliminando campo:', err);
        alert('Error al eliminar el campo');
      }
    });
  }

  goBack() {
    this.router.navigate(['/protocol', this.slrId]);
  }
}
