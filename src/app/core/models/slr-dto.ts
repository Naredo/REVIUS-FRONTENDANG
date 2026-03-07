import { ProtocolDTO } from './protocol-dto';
import { UserForReviewServiceDTO } from './user-for-review-service-dto';

export interface SLRDTO {
  id?: number;
  title: string;
  description: string;
  workField: string;
  objective: string;
  publicVisibility: boolean;
  protocol?: ProtocolDTO;
  principalResearcher?: UserForReviewServiceDTO;
  collaboratorResearchers?: UserForReviewServiceDTO[];
  emails?: string[];
}
