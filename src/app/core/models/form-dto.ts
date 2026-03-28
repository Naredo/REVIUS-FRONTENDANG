import { FormFieldDTO } from './form-field-dto';

export interface FormDTO {
  id?: number;
  formType: 'EXTRACTION' | 'QUALITY';
  formFields?: FormFieldDTO[];
}
