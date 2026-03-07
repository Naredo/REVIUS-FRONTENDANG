import { MainQuestionDTO } from './main-question-dto';
import { KeywordDTO } from './keyword-dto';
import { SourcesSelectionCriterionDTO } from './sources-selection-criterion-dto';
import { LanguageDTO } from './language-dto';
import { SourceDTO } from './source-dto';
import { StudySelectionCriterionDTO } from './study-selection-criterion-dto';
import { FormDTO } from './form-dto';

export interface ProtocolDTO {
  id?: number;

  mainQuestions?: MainQuestionDTO[];
  keywords?: KeywordDTO[];
  sourcesSelectionCriterions?: SourcesSelectionCriterionDTO[];
  languages?: LanguageDTO[];

  sourcesSearchMethods: string;

  sources?: SourceDTO[];

  studySelectionCriterions?: StudySelectionCriterionDTO[];

  studiesTypesDefinition: string;
  studiesInitialSelection: string;
  studiesQualityEvaluation: string;

  qualityForm?: FormDTO;
  extractionForm?: FormDTO;
}
