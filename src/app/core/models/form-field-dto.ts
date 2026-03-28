export interface FormFieldDTO {
  id?: number;
  fieldName: string;
  fieldType: 'TEXT' | 'PICKONELIST' | 'PICKMANYLIST' | 'NUMBERSCALE' | 'LABELEDSCALE';
  formId?: number;
}
