export interface FormInstanceDataDTO {
  formInstanceId?: number;
  protocolId: number;
  snowballingId: number;
  formType: 'QUALITY' | 'EXTRACTION';
  values: Record<number, string | null>;
}

export interface FormInstanceSaveRequestDTO {
  values: Record<number, string | null>;
}
