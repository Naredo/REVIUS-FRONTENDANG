import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProtocolService } from '../../core/services/protocol.service';
import { KeywordService } from '../../core/services/keyword.service';
import { MainQuestionService } from '../../core/services/main-question.service';
import { SecondaryQuestionService } from '../../core/services/secondary-question.service';
import { SourceService } from '../../core/services/source.service';
import { SnowballingService } from '../../core/services/snowballing.service';
import { StudySelectionCriterionService } from '../../core/services/study-selection-criterion.service';
import { SourcesSelectionCriterionService } from '../../core/services/sources-selection-criterion.service';
import { FormService } from '../../core/services/form.service';
import { FormFieldService } from '../../core/services/form-field.service';
import { ProtocolDTO } from '../../core/models/protocol-dto';
import { KeywordDTO } from '../../core/models/keyword-dto';
import { MainQuestionDTO } from '../../core/models/main-question-dto';
import { SecondaryQuestionDTO } from '../../core/models/secondary-question-dto';
import { SourceDTO } from '../../core/models/source-dto';
import { SnowballingDTO } from '../../core/models/snowballing-dto';
import { StudySelectionCriterionDTO } from '../../core/models/study-selection-criterion-dto';
import { SourcesSelectionCriterionDTO } from '../../core/models/sources-selection-criterion-dto';

@Component({
  selector: 'app-protocol',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './protocol.html',
  styleUrls: ['./protocol.scss']
})
export class ProtocolComponent implements OnInit {

  protocolForm: FormGroup;
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
  newSecondaryQuestion: string = '';
  selectedMainQuestionId?: number;
  newSourceName: string = '';
  newSourceUrl: string = '';
  newSnowballingSource: string = '';
  newSnowballingType: 'FORWARD' | 'BACKWARD' = 'FORWARD';
  newStudyCriterion: string = '';
  newSourcesCriterion: string = '';

  private isBrowser: boolean;

  constructor(
    private protocolService: ProtocolService,
    private keywordService: KeywordService,
    private mainQuestionService: MainQuestionService,
    private secondaryQuestionService: SecondaryQuestionService,
    private sourceService: SourceService,
    private snowballingService: SnowballingService,
    private studySelectionCriterionService: StudySelectionCriterionService,
    private sourcesSelectionCriterionService: SourcesSelectionCriterionService,
    private formService: FormService,
    private formFieldService: FormFieldService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
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
    // Aquí cargarías el protocolo existente si ya existe
    // Por ahora, solo preparamos para crear uno nuevo
    this.loading = false;
  }

  changeSection(section: 'basic' | 'keywords' | 'questions' | 'sources' | 'criteria' | 'forms') {
    this.currentSection = section;
  }

  // ============ KEYWORDS ============
  addKeyword() {
    if (!this.newKeyword.trim() || !this.protocolId) return;

    const keyword: KeywordDTO = { keyword: this.newKeyword.trim() };
    this.keywordService.createAndSave(keyword, this.protocolId).subscribe({
      next: () => {
        this.keywords.push(keyword);
        this.newKeyword = '';
        this.cdr.markForCheck();
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
        this.keywords = this.keywords.filter(k => k.id !== keyword.id);
        this.cdr.markForCheck();
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
      next: (id) => {
        this.mainQuestions.push({ ...question, id });
        this.newMainQuestion = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo pregunta principal:', err);
        alert('Error al añadir pregunta principal');
      }
    });
  }

  addSecondaryQuestion(mainQuestionId: number) {
    if (!this.newSecondaryQuestion.trim()) return;

    const question: SecondaryQuestionDTO = { 
      question: this.newSecondaryQuestion.trim(),
      mainQuestionId
    };
    this.secondaryQuestionService.createAndSave(question, mainQuestionId).subscribe({
      next: () => {
        this.newSecondaryQuestion = '';
        alert('Pregunta secundaria añadida correctamente');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo pregunta secundaria:', err);
        alert('Error al añadir pregunta secundaria');
      }
    });
  }

  // ============ SOURCES ============
  addSource() {
    if (!this.newSourceName.trim() || !this.protocolId) return;

    const source: SourceDTO = { 
      name: this.newSourceName.trim(),
      url: this.newSourceUrl.trim() || undefined
    };
    this.sourceService.createAndSave(source, this.protocolId).subscribe({
      next: () => {
        this.sources.push(source);
        this.newSourceName = '';
        this.newSourceUrl = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error añadiendo fuente:', err);
        alert('Error al añadir fuente');
      }
    });
  }

  removeSource(source: SourceDTO) {
    if (!source.id || !this.protocolId) return;

    this.sourceService.deleteFromProtocol(source.id, this.protocolId).subscribe({
      next: () => {
        this.sources = this.sources.filter(s => s.id !== source.id);
        this.cdr.markForCheck();
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

    const snowballing: SnowballingDTO = {
      name: 'Snowballing',
      source: this.newSnowballingSource.trim(),
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

  removeSnowballing(snowballing: SnowballingDTO) {
    if (!snowballing.id || !this.protocolId) return;

    this.snowballingService.deleteFromProtocol(snowballing.id, this.protocolId).subscribe({
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

  // ============ STUDY SELECTION CRITERIA ============
  addStudyCriterion() {
    if (!this.newStudyCriterion.trim() || !this.protocolId) return;

    const criterion: StudySelectionCriterionDTO = { 
      criterion: this.newStudyCriterion.trim()
    };
    this.studySelectionCriterionService.createAndSave(criterion, this.protocolId).subscribe({
      next: () => {
        this.studyCriteria.push(criterion);
        this.newStudyCriterion = '';
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
