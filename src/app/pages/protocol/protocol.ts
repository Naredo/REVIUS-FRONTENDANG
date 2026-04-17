import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { ProtocolService } from '../../core/services/protocol.service';
import { FormFieldService } from '../../core/services/form-field.service';
import { KeywordService } from '../../core/services/keyword.service';
import { MainQuestionService } from '../../core/services/main-question.service';
import { SecondaryQuestionService } from '../../core/services/secondary-question.service';
import { SourceService } from '../../core/services/source.service';
import { SnowballingService } from '../../core/services/snowballing.service';
import { StudySelectionCriterionService } from '../../core/services/study-selection-criterion.service';
import { SourcesSelectionCriterionService } from '../../core/services/sources-selection-criterion.service';
import { ReviewService } from '../../reviews/review.service';
import { ProtocolDTO } from '../../core/models/protocol-dto';
import { KeywordDTO } from '../../core/models/keyword-dto';
import { MainQuestionDTO } from '../../core/models/main-question-dto';
import { SecondaryQuestionDTO } from '../../core/models/secondary-question-dto';
import { SourceDTO } from '../../core/models/source-dto';
import { SnowballingDTO } from '../../core/models/snowballing-dto';
import { StudySelectionCriterionDTO } from '../../core/models/study-selection-criterion-dto';
import { SourcesSelectionCriterionDTO } from '../../core/models/sources-selection-criterion-dto';
import { FormFieldDTO } from '../../core/models/form-field-dto';
import { ScopusService } from '../../core/services/scopus.service';
import { ScopusSearchDTO } from '../../core/models/scopus-search-dto';
import { ScopusStudyDTO } from '../../core/models/scopus-study-dto';

@Component({
  selector: 'app-protocol',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './protocol.html',
  styleUrls: ['./protocol.scss']
})
export class ProtocolComponent implements OnInit {

  protocolForm: FormGroup;
  bibliographicSourceOptions: string[] = [
    'URL',
    'Artículo',
    'Libro',
    'Tesis y trabajos académicos',
    'Informes y documentos oficiales'
  ];
  otherBibliographicSourceValue = 'otro';
  slrId: number = 0;
  protocolId?: number;
  loading = false;
  submitError = '';
  currentSection: 'basic' | 'keywords' | 'questions' | 'sources' | 'criteria' | 'forms' = 'basic';
  
  // Listas de entidades
  keywords: KeywordDTO[] = [];
  mainQuestions: MainQuestionDTO[] = [];
  sources: SourceDTO[] = [];
  snowballings: SnowballingDTO[] = [];
  studyCriteria: StudySelectionCriterionDTO[] = [];
  sourcesCriteria: SourcesSelectionCriterionDTO[] = [];

  // Formularios auxiliares
  newKeyword: string = '';
  newMainQuestion: string = '';
  newSecondaryQuestions: Record<number, string> = {};
  selectedMainQuestionId?: number;
  editingMainQuestionId?: number;
  editingMainQuestionText: string = '';
  editingSecondaryQuestionId?: number;
  editingSecondaryQuestionText: string = '';
  newSourceName: string = '';
  newSourceNameOther: string = '';
  newSourceUrl: string = '';
  newSnowballingSource: string = '';
  newSnowballingType: 'FORWARD' | 'BACKWARDS' = 'FORWARD';
  snowballingDocumentUploading = false;

  scopusQuery = '';
  scopusObservations = '';
  scopusLoading = false;
  scopusError = '';
  scopusResult?: ScopusSearchDTO;
  scopusStudies: ScopusStudyDTO[] = [];
  scopusPageSize = 10;
  scopusPageIndex = 0;
  scopusSnowballingType: 'FORWARD' | 'BACKWARDS' = 'FORWARD';

  studyCriterionKind: 'INCLUSION' | 'EXCLUSION' = 'INCLUSION';

  studyCriterionOptions: Array<{ value: string; label: string; kind: 'INCLUSION' | 'EXCLUSION' }> = [
    {
      value: '1 I El título, la lista de palabras clave y el resumen dejan explícito que el artículo está relacionado con [tema].',
      label: '1 El título, palabras clave y resumen indican relación con [tema]',
      kind: 'INCLUSION'
    },
    {
      value: '2 I El artículo presenta contribuciones relacionadas con [tema], por ejemplo: [lista de temas].',
      label: '2 Presenta contribuciones relacionadas con [tema]',
      kind: 'INCLUSION'
    },
    {
      value: '3 E El artículo no está en inglés (o en cualquier otro idioma de interés).',
      label: '3 No está en inglés (u otro idioma de interés)',
      kind: 'EXCLUSION'
    },
    {
      value: '4 E El artículo no pertenece al dominio [nombre(s) del dominio].',
      label: '4 No pertenece al dominio [dominio]',
      kind: 'EXCLUSION'
    },
    {
      value: '5 E El artículo es solo un resumen de tutorial, workshop o póster.',
      label: '5 Solo resumen (tutorial/workshop/póster)',
      kind: 'EXCLUSION'
    },
    {
      value: '6 E El artículo se relaciona con [tema] únicamente en los trabajos relacionados.',
      label: '6 Relación con [tema] solo en trabajos relacionados',
      kind: 'EXCLUSION'
    },
    {
      value: '7 E El artículo aparece varias veces en el conjunto de resultados.',
      label: '7 Duplicado en el conjunto de resultados',
      kind: 'EXCLUSION'
    },
    {
      value: '8 E El texto completo del artículo no está disponible para su descarga.',
      label: '8 No hay texto completo disponible para descarga',
      kind: 'EXCLUSION'
    }
  ];
  otherStudyCriterionValue = 'OTHER';
  selectedStudyCriterion: string = '';
  otherStudyCriterionText: string = '';

  newSourcesCriterion: string = '';

  get scopusTotalPages(): number {
    const pageSize = this.scopusPageSize || 0;
    if (pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(this.scopusStudies.length / pageSize));
  }

  get pagedScopusStudies(): ScopusStudyDTO[] {
    const pageSize = this.scopusPageSize || 0;
    if (pageSize <= 0) return this.scopusStudies;

    const safePageIndex = Math.max(0, Math.min(this.scopusPageIndex, this.scopusTotalPages - 1));
    const start = safePageIndex * pageSize;
    return this.scopusStudies.slice(start, start + pageSize);
  }

  prevScopusPage() {
    this.scopusPageIndex = Math.max(0, this.scopusPageIndex - 1);
  }

  nextScopusPage() {
    this.scopusPageIndex = Math.min(this.scopusTotalPages - 1, this.scopusPageIndex + 1);
  }

  qualityFormFields: FormFieldDTO[] = [];
  extractionFormFields: FormFieldDTO[] = [];
  newQualityFieldName = '';
  newExtractionFieldName = '';
  newQualityFieldType: FormFieldDTO['fieldType'] = 'TEXT';
  newExtractionFieldType: FormFieldDTO['fieldType'] = 'TEXT';
  formsLoading = false;
  formsMessage = '';

  fieldTypeOptions: Array<{ value: FormFieldDTO['fieldType']; label: string }> = [
    { value: 'TEXT', label: 'Texto libre' },
    { value: 'PICKONELIST', label: 'Selección única' },
    { value: 'PICKMANYLIST', label: 'Selección múltiple' },
    { value: 'NUMBERSCALE', label: 'Escala numérica' },
    { value: 'LABELEDSCALE', label: 'Escala etiquetada' }
  ];

  yesNoOptions: Array<{ value: string; label: string }> = [
    { value: 'true', label: 'Sí' },
    { value: 'false', label: 'No' }
  ];

  numericScaleOptions: number[] = Array.from({ length: 10 }, (_, index) => index + 1);

  labeledScaleOptions: Array<{ value: string; label: string }> = [
    { value: '0', label: '0 - Muy deficiente' },
    { value: '1', label: '1 - Deficiente' },
    { value: '2', label: '2 - Aceptable' },
    { value: '3', label: '3 - Bueno' },
    { value: '4', label: '4 - Muy bueno' },
    { value: '5', label: '5 - Excelente' }
  ];

  constructor(
    private protocolService: ProtocolService,
    private formFieldService: FormFieldService,
    private keywordService: KeywordService,
    private mainQuestionService: MainQuestionService,
    private secondaryQuestionService: SecondaryQuestionService,
    private sourceService: SourceService,
    private snowballingService: SnowballingService,
    private scopusService: ScopusService,
    private studySelectionCriterionService: StudySelectionCriterionService,
    private sourcesSelectionCriterionService: SourcesSelectionCriterionService,
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.protocolForm = this.fb.group({
      sourcesSearchMethods: ['', Validators.required],
      studiesTypesDefinition: ['', Validators.required],
      studiesInitialSelection: ['', Validators.required],
      studiesQualityEvaluation: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('slrId');
      if (id) {
        this.slrId = parseInt(id, 10);
        this.loadProtocol();
      }
    });
  }

  loadProtocol() {
    if (!this.slrId) return;
    
    this.loading = true;
    
    // Obtener el SLR para verificar si tiene un protocolo asociado
    this.reviewService.getSLRById(this.slrId).subscribe({
      next: (slr) => {
        if (slr.protocol && slr.protocol.id) {
          // Si el SLR tiene un protocolo, cargarlo
          this.protocolId = slr.protocol.id;
          this.protocolService.findOne(this.protocolId).subscribe({
            next: (protocol) => {
              // Cargar los datos del formulario
              this.protocolForm.patchValue({
                sourcesSearchMethods: protocol.sourcesSearchMethods || '',
                studiesTypesDefinition: protocol.studiesTypesDefinition || '',
                studiesInitialSelection: protocol.studiesInitialSelection || '',
                studiesQualityEvaluation: protocol.studiesQualityEvaluation || ''
              });
              
              // Cargar las listas de entidades
              this.keywords = protocol.keywords ?? [];
              this.mainQuestions = protocol.mainQuestions ?? [];
              this.splitSourcesAndSnowballings(protocol.sources);
              this.studyCriteria = protocol.studySelectionCriterions ?? [];
              this.sourcesCriteria = protocol.sourcesSelectionCriterions ?? [];

              this.loadFormDefinitions();
              
              this.loading = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Error cargando protocolo:', err);
              this.loading = false;
            }
          });
        } else {
          // No hay protocolo todavía, preparar para crear uno nuevo
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando SLR:', err);
        this.loading = false;
      }
    });
  }

  changeSection(section: 'basic' | 'keywords' | 'questions' | 'sources' | 'criteria' | 'forms') {
    this.currentSection = section;

    if (section === 'forms' && this.protocolId) {
      this.loadFormDefinitions();
    }
  }

  private loadFormDefinitions() {
    if (!this.protocolId) return;

    this.formsLoading = true;
    this.formsMessage = '';

    forkJoin({
      quality: this.protocolService.findFormData(this.protocolId, 'QUALITY'),
      extraction: this.protocolService.findFormData(this.protocolId, 'EXTRACTION')
    }).subscribe({
      next: ({ quality, extraction }) => {
        this.qualityFormFields = quality ?? [];
        this.extractionFormFields = extraction ?? [];
        this.formsLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando formularios:', err);
        this.formsLoading = false;
        this.formsMessage = 'No se pudieron cargar los campos de los formularios';
        this.cdr.markForCheck();
      }
    });
  }

  addQualityField() {
    const name = this.newQualityFieldName.trim();
    if (!name) return;

    if (this.qualityFormFields.some(field => field.fieldName.toLowerCase() === name.toLowerCase())) {
      this.formsMessage = 'Ya existe un campo de calidad con ese nombre';
      return;
    }

    this.qualityFormFields = [...this.qualityFormFields, { fieldName: name, fieldType: this.newQualityFieldType }];
    this.newQualityFieldName = '';
    this.newQualityFieldType = 'TEXT';
    this.formsMessage = '';
  }

  addExtractionField() {
    const name = this.newExtractionFieldName.trim();
    if (!name) return;

    if (this.extractionFormFields.some(field => field.fieldName.toLowerCase() === name.toLowerCase())) {
      this.formsMessage = 'Ya existe un campo de extracción con ese nombre';
      return;
    }

    this.extractionFormFields = [...this.extractionFormFields, { fieldName: name, fieldType: this.newExtractionFieldType }];
    this.newExtractionFieldName = '';
    this.newExtractionFieldType = 'TEXT';
    this.formsMessage = '';
  }

  saveFormsDefinition() {
    if (!this.protocolId) return;

    this.formsLoading = true;
    this.formsMessage = '';

    this.protocolService.findOne(this.protocolId).pipe(
      switchMap((protocol: ProtocolDTO) => {
        protocol.qualityForm = {
          id: protocol.qualityForm?.id,
          formType: 'QUALITY',
          formFields: this.qualityFormFields
        };
        protocol.extractionForm = {
          id: protocol.extractionForm?.id,
          formType: 'EXTRACTION',
          formFields: this.extractionFormFields
        };
        return this.protocolService.update(protocol);
      })
    ).subscribe({
      next: () => {
        this.formsLoading = false;
        this.formsMessage = 'Formularios guardados correctamente';
        this.loadFormDefinitions();
      },
      error: (err) => {
        console.error('Error guardando formularios:', err);
        this.formsLoading = false;
        this.formsMessage = 'No se pudieron guardar los formularios';
        this.cdr.markForCheck();
      }
    });
  }

  getFieldPlaceholder(fieldType: FormFieldDTO['fieldType']): string {
    if (fieldType === 'PICKONELIST') return 'Selecciona una opción';
    if (fieldType === 'PICKMANYLIST') return 'Varias opciones separadas por coma';
    if (fieldType === 'NUMBERSCALE') return 'Valor numérico';
    if (fieldType === 'LABELEDSCALE') return 'Escala con etiqueta (ej. 4 - Bueno)';
    return 'Valor';
  }

  private splitSourcesAndSnowballings(protocolSources: unknown) {
    const isSnowballing = (value: any): value is SnowballingDTO => {
      return !!value && typeof value === 'object' && 'snowballingType' in value && 'source' in value;
    };

    const sources = Array.isArray(protocolSources) ? protocolSources : [];
    this.snowballings = sources.filter(isSnowballing);
    this.sources = sources.filter((s) => !isSnowballing(s));
  }

  // ============ SCOPUS SEARCH ============
  searchScopus() {
    if (!this.protocolId) {
      this.scopusError = 'Primero debes crear el protocolo';
      return;
    }

    let query = this.scopusQuery.trim();
    const observations = this.scopusObservations.trim();

    if (!query || !observations) {
      this.scopusError = 'Introduce una query y observaciones';
      return;
    }

    this.scopusLoading = true;
    this.scopusError = '';
    this.scopusResult = undefined;
    this.scopusStudies = [];
    this.scopusPageIndex = 0;

    const keywordTerms = (this.keywords ?? [])
      .map(k => (k?.keyword ?? '').toString().trim())
      .filter(k => k.length > 0);

    if (keywordTerms.length > 0) {
      query = `${query} AND ${keywordTerms.join(' AND ')}`;
    }

    const payload: ScopusSearchDTO = {
      query,
      observations,
      sourceName: 'Scopus',
      protocolId: this.protocolId
    };

    this.scopusService.search(payload).subscribe({
      next: (result) => {
        this.scopusResult = result;
        this.scopusStudies = (result.studies ?? []) as ScopusStudyDTO[];
        this.scopusPageIndex = 0;
        this.scopusLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error en búsqueda Scopus:', err);
        this.scopusLoading = false;
        this.scopusError = err?.error || 'No se pudo realizar la búsqueda en Scopus';
        this.cdr.markForCheck();
      }
    });
  }

  addSnowballingFromScopus(study: ScopusStudyDTO) {
    if (!this.protocolId) return;

    const studyId = study.id;
    const title = (study.dcTitle || study.dcIdentifier || study.eid || '').toString().trim();
    if (!studyId || !title) {
      alert('El estudio no tiene id/título válido para crear snowballing');
      return;
    }

    const alreadyExists = this.snowballings.some(s => s.studyId === studyId);
    if (alreadyExists) {
      alert('Este estudio ya está añadido como snowballing');
      return;
    }

    const snowballing: SnowballingDTO = {
      name: title,
      source: 'Scopus',
      snowballingType: this.scopusSnowballingType,
      studyId
    };

    this.snowballingService.createAndSave(snowballing, this.protocolId).subscribe({
      next: (created) => {
        this.snowballings.push(created);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error creando snowballing desde Scopus:', err);
        alert('Error al añadir snowballing desde Scopus');
      }
    });
  }

  canAddAllSnowballingsFromScopus(): boolean {
    if (!this.protocolId) return false;
    if (!this.scopusStudies || this.scopusStudies.length === 0) return false;

    return this.scopusStudies.some(study => {
      const studyId = study?.id;
      const title = (study?.dcTitle || study?.dcIdentifier || study?.eid || '').toString().trim();
      if (!studyId || !title) return false;
      return !this.snowballings.some(s => s.studyId === studyId);
    });
  }

  addAllSnowballingsFromScopus() {
    if (!this.protocolId) return;

    const studiesToAdd = (this.scopusStudies ?? []).filter(study => {
      const studyId = study?.id;
      const title = (study?.dcTitle || study?.dcIdentifier || study?.eid || '').toString().trim();
      if (!studyId || !title) return false;
      return !this.snowballings.some(s => s.studyId === studyId);
    });

    if (studiesToAdd.length === 0) {
      alert('No hay nuevos estudios de Scopus para añadir');
      return;
    }

    const requests = studiesToAdd.map(study => {
      const studyId = study.id;
      const title = (study.dcTitle || study.dcIdentifier || study.eid || '').toString().trim();

      const snowballing: SnowballingDTO = {
        name: title,
        source: 'Scopus',
        snowballingType: this.scopusSnowballingType,
        studyId
      };

      return this.snowballingService.createAndSave(snowballing, this.protocolId!).pipe(
        catchError((err) => {
          console.error('Error creando snowballing desde Scopus (bulk):', err);
          return of(null);
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (createdList) => {
        const created = (createdList ?? []).filter((s): s is SnowballingDTO => !!s);
        if (created.length > 0) {
          this.snowballings.push(...created);

          const createdStudyIds = new Set(
            created
              .map(s => s.studyId)
              .filter((id): id is number => typeof id === 'number')
          );

          if (createdStudyIds.size > 0) {
            this.scopusStudies = (this.scopusStudies ?? []).filter(study => {
              const id = study?.id;
              return typeof id !== 'number' || !createdStudyIds.has(id);
            });
            this.scopusPageIndex = 0;
          }
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo todos los snowballings desde Scopus:', err);
        alert('Error al añadir todos los snowballings desde Scopus');
      }
    });
  }

  trackByScopusStudyId(_index: number, study: ScopusStudyDTO) {
    return study.id ?? study.dcIdentifier ?? study.eid ?? study.dcTitle ?? _index;
  }

  private refreshProtocolData() {
    if (!this.protocolId) return;

    this.protocolService.findOne(this.protocolId).subscribe({
      next: (protocol) => {
        this.keywords = protocol.keywords ?? [];
        this.splitSourcesAndSnowballings(protocol.sources);
        this.mainQuestions = protocol.mainQuestions ?? [];
        this.studyCriteria = protocol.studySelectionCriterions ?? [];
        this.sourcesCriteria = protocol.sourcesSelectionCriterions ?? [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error recargando protocolo:', err);
      }
    });
  }

  // ============ KEYWORDS ============
  addKeyword() {
    if (!this.newKeyword.trim() || !this.protocolId) return;

    const keyword: KeywordDTO = { keyword: this.newKeyword.trim() };
    this.keywordService.createAndSave(keyword, this.protocolId).subscribe({
      next: () => {
        this.newKeyword = '';
        this.refreshProtocolData();
      },
      error: (err) => {
        console.error('Error añadiendo keyword:', err);
        alert('Error al añadir palabra clave');
      }
    });
  }

  removeKeyword(keyword: KeywordDTO) {
    if (!keyword.id || !this.protocolId) return;

    this.keywordService.deleteFromProtocol(keyword, this.protocolId).subscribe({
      next: () => {
        this.refreshProtocolData();
      },
      error: (err) => {
        console.error('Error eliminando keyword:', err);
        alert('Error al eliminar palabra clave');
      }
    });
  }

  // ============ MAIN QUESTIONS ============
  addMainQuestion() {
    if (!this.newMainQuestion.trim() || !this.protocolId) return;

    const question: MainQuestionDTO = { question: this.newMainQuestion.trim() };
    this.mainQuestionService.createAndSave(question, this.protocolId).subscribe({
      next: () => {
        this.newMainQuestion = '';
        this.refreshProtocolData();
      },
      error: (err) => {
        console.error('Error añadiendo pregunta principal:', err);
        alert('Error al añadir pregunta principal');
      }
    });
  }

  addSecondaryQuestion(mainQuestionId: number) {
    const newQuestion = (this.newSecondaryQuestions[mainQuestionId] || '').trim();
    if (!newQuestion) return;

    const question: SecondaryQuestionDTO = { 
      question: newQuestion,
      mainQuestionId
    };
    this.secondaryQuestionService.createAndSave(question, mainQuestionId).subscribe({
      next: () => {
        this.newSecondaryQuestions[mainQuestionId] = '';
        this.refreshProtocolData();
      },
      error: (err) => {
        console.error('Error añadiendo pregunta secundaria:', err);
        alert('Error al añadir pregunta secundaria');
      }
    });
  }

  startEditMainQuestion(question: MainQuestionDTO) {
    if (!question.id) return;
    this.editingMainQuestionId = question.id;
    this.editingMainQuestionText = question.question;
  }

  cancelEditMainQuestion() {
    this.editingMainQuestionId = undefined;
    this.editingMainQuestionText = '';
  }

  saveMainQuestion(question: MainQuestionDTO) {
    if (!question.id || !this.editingMainQuestionText.trim()) return;

    const updatedQuestion: MainQuestionDTO = {
      id: question.id,
      question: this.editingMainQuestionText.trim(),
      secondaryQuestions: question.secondaryQuestions ?? []
    };

    this.mainQuestionService.update(updatedQuestion).subscribe({
      next: () => {
        this.cancelEditMainQuestion();
        this.refreshProtocolData();
      },
      error: (err: any) => {
        console.error('Error editando pregunta principal:', err);
        alert('Error al editar pregunta principal');
      }
    });
  }

  removeMainQuestion(question: MainQuestionDTO) {
    if (!question.id) return;
    if (!confirm('¿Deseas eliminar esta pregunta principal y sus secundarias?')) return;

    this.mainQuestionService.delete(question.id).subscribe({
      next: () => {
        this.refreshProtocolData();
      },
      error: (err: any) => {
        console.error('Error eliminando pregunta principal:', err);
        alert('Error al eliminar pregunta principal');
      }
    });
  }

  startEditSecondaryQuestion(secQuestion: SecondaryQuestionDTO) {
    if (!secQuestion.id) return;
    this.editingSecondaryQuestionId = secQuestion.id;
    this.editingSecondaryQuestionText = secQuestion.question;
  }

  cancelEditSecondaryQuestion() {
    this.editingSecondaryQuestionId = undefined;
    this.editingSecondaryQuestionText = '';
  }

  saveSecondaryQuestion(secQuestion: SecondaryQuestionDTO, mainQuestionId: number) {
    if (!secQuestion.id || !this.editingSecondaryQuestionText.trim()) return;

    const updatedQuestion: SecondaryQuestionDTO = {
      id: secQuestion.id,
      question: this.editingSecondaryQuestionText.trim(),
      mainQuestionId
    };

    this.secondaryQuestionService.update(updatedQuestion).subscribe({
      next: () => {
        this.cancelEditSecondaryQuestion();
        this.refreshProtocolData();
      },
      error: (err: any) => {
        console.error('Error editando pregunta secundaria:', err);
        alert('Error al editar pregunta secundaria');
      }
    });
  }

  removeSecondaryQuestion(secQuestion: SecondaryQuestionDTO) {
    if (!secQuestion.id) return;
    if (!confirm('¿Deseas eliminar esta pregunta secundaria?')) return;

    this.secondaryQuestionService.delete(secQuestion.id).subscribe({
      next: () => {
        this.refreshProtocolData();
      },
      error: (err: any) => {
        console.error('Error eliminando pregunta secundaria:', err);
        alert('Error al eliminar pregunta secundaria');
      }
    });
  }

  // ============ SOURCES ============
  addSource() {
    if (!this.protocolId) return;

    const selectedSourceName = this.newSourceName === this.otherBibliographicSourceValue
      ? this.newSourceNameOther.trim()
      : this.newSourceName.trim();

    if (!selectedSourceName) return;

    const source: SourceDTO = { 
      name: selectedSourceName,
      url: this.newSourceUrl.trim() || undefined
    };
    this.sourceService.createAndSave(source, this.protocolId).subscribe({
      next: () => {
        this.newSourceName = '';
        this.newSourceNameOther = '';
        this.newSourceUrl = '';
        this.refreshProtocolData();
      },
      error: (err) => {
        console.error('Error añadiendo fuente:', err);
        alert('Error al añadir fuente');
      }
    });
  }

  get isOtherBibliographicSourceSelected(): boolean {
    return this.newSourceName === this.otherBibliographicSourceValue;
  }

  get canAddBibliographicSource(): boolean {
    if (!this.protocolId) return false;
    if (this.isOtherBibliographicSourceSelected) return !!this.newSourceNameOther.trim();
    return !!this.newSourceName.trim();
  }

  removeSource(source: SourceDTO) {
    if (!source.id || !this.protocolId) return;

    this.sourceService.deleteFromProtocol(source.id, this.protocolId).subscribe({
      next: () => {
        this.refreshProtocolData();
      },
      error: (err) => {
        console.error('Error eliminando fuente:', err);
        alert('Error al eliminar fuente');
      }
    });
  }

  // ============ SNOWBALLING ============
  addSnowballing() {
    if (!this.newSnowballingSource.trim() || !this.protocolId) return;

    const sourceValue = this.newSnowballingSource.trim();

    const snowballing: SnowballingDTO = {
      name: sourceValue,
      source: sourceValue,
      snowballingType: this.newSnowballingType
    };
    this.snowballingService.createAndSave(snowballing, this.protocolId).subscribe({
      next: (created) => {
        this.snowballings.push(created);
        this.newSnowballingSource = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo snowballing:', err);
        alert('Error al añadir snowballing');
      }
    });
  }

  attachSnowballingDocument(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.protocolId) {
      input.value = '';
      return;
    }

    const origin = this.newSnowballingSource.trim();
    if (!origin) {
      alert('Indica primero la fuente de origen');
      input.value = '';
      return;
    }

    this.snowballingDocumentUploading = true;
    this.snowballingService.uploadDocument(this.protocolId, this.newSnowballingType, origin, file).subscribe({
      next: (created) => {
        this.snowballings.push(created);
        this.newSnowballingSource = '';
        alert('Documento adjuntado correctamente');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error adjuntando documento a snowballing:', err);
        alert('Error al adjuntar documento');
      },
      complete: () => {
        this.snowballingDocumentUploading = false;
        input.value = '';
        this.cdr.markForCheck();
      }
    });
  }

  removeSnowballing(snowballing: SnowballingDTO) {
    if (!snowballing.id || !this.protocolId) return;

    this.snowballingService.delete(snowballing.id).subscribe({
      next: () => {
        this.snowballings = this.snowballings.filter(s => s.id !== snowballing.id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error eliminando snowballing:', err);
        alert('Error al eliminar snowballing');
      }
    });
  }

  onStudyCriterionPresetChange() {
    const preset = this.studyCriterionOptions.find(option => option.value === this.selectedStudyCriterion);
    if (preset) {
      this.studyCriterionKind = preset.kind;
    }

    if (this.selectedStudyCriterion !== this.otherStudyCriterionValue) {
      this.otherStudyCriterionText = '';
    }
  }

  canAddStudyCriterion(): boolean {
    if (!this.selectedStudyCriterion) return false;
    if (this.selectedStudyCriterion === this.otherStudyCriterionValue) {
      return !!this.otherStudyCriterionText.trim();
    }
    return true;
  }

  // ============ STUDY SELECTION CRITERIA ============
  addStudyCriterion() {
    if (!this.protocolId || !this.canAddStudyCriterion()) return;

    const criterionText = this.selectedStudyCriterion === this.otherStudyCriterionValue
      ? this.otherStudyCriterionText.trim()
      : this.selectedStudyCriterion;

    const kindLabel = this.studyCriterionKind === 'INCLUSION' ? 'Inclusión' : 'Exclusión';
    const formattedCriterion = `${kindLabel}: ${criterionText}`;

    const criterion: StudySelectionCriterionDTO = { 
      criterion: formattedCriterion
    };
    this.studySelectionCriterionService.createAndSave(criterion, this.protocolId).subscribe({
      next: () => {
        this.studyCriteria.push(criterion);
        this.selectedStudyCriterion = '';
        this.otherStudyCriterionText = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo criterio de estudio:', err);
        alert('Error al añadir criterio de selección de estudio');
      }
    });
  }

  // ============ SOURCES SELECTION CRITERIA ============
  addSourcesCriterion() {
    if (!this.newSourcesCriterion.trim() || !this.protocolId) return;

    const criterion: SourcesSelectionCriterionDTO = { 
      criterion: this.newSourcesCriterion.trim()
    };
    this.sourcesSelectionCriterionService.createAndSave(criterion, this.protocolId).subscribe({
      next: () => {
        this.sourcesCriteria.push(criterion);
        this.newSourcesCriterion = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo criterio de fuente:', err);
        alert('Error al añadir criterio de selección de fuente');
      }
    });
  }

  // ============ SUBMIT ============
  onSubmitProtocol() {
    if (this.protocolForm.invalid) {
      this.submitError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.submitError = '';

    const protocolData: ProtocolDTO = {
      id: this.protocolId,
      ...this.protocolForm.value
    };

    if (this.protocolId) {
      // Actualizar
      this.protocolService.update(protocolData).subscribe({
        next: () => {
          alert('Protocolo actualizado correctamente');
          this.router.navigate(['/reviews']);
        },
        error: (err) => {
          console.error('Error actualizando protocolo:', err);
          this.submitError = 'Error al actualizar el protocolo';
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.protocolService.createAndSave(protocolData, this.slrId).subscribe({
        next: (created) => {
          this.protocolId = created.id;
          alert('Protocolo creado correctamente');
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error creando protocolo:', err);
          this.submitError = 'Error al crear el protocolo';
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/reviews']);
  }
}
