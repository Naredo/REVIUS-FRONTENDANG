import { SecondaryQuestionDTO } from './secondary-question-dto';

export interface MainQuestionDTO {
  id?: number;
  question: string;
  secondaryQuestions?: SecondaryQuestionDTO[];
}
