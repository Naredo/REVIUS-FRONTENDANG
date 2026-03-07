export interface SLRDTO {
  id?: number;
  title: string;
  description: string;
  workField: string;
  objective: string;
  publicVisibility: boolean;
  initDate?: Date;
  endDate?: Date;
  protocol?: ProtocolDTO;
  principalResearcher?: UserForReviewServiceDTO;
  collaboratorResearchers?: UserForReviewServiceDTO[];
  report?: ReportDTO;
  status?: string;
  scope?: string;
}

export interface ProtocolDTO {
  id?: number;
}

export interface ReportDTO {
  id?: number;
}

export interface UserForReviewServiceDTO {
  id?: number;
  userName?: string;
  completeName?: string;
  email?: string;
}

export interface SLRResponse {
  success: boolean;
  data?: SLRDTO;
  message?: string;
}
