export interface StudySelectionCriterionDTO {
  id?: number;
  criterion: string;
  studyCriterionType?: 'INCLUSION' | 'EXCLUSION';
}
