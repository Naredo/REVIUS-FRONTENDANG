export interface FormFieldDTO {
  id?: number;
  fieldName: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'TEXTAREA';
  formId?: number;
}
