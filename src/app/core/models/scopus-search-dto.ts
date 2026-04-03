import { ScopusStudyDTO } from './scopus-study-dto';

export interface ScopusSearchDTO {
  id?: number;
  searchDate?: string;

  query: string;
  observations: string;

  sourceName?: string;
  protocolId?: number;

  studies?: ScopusStudyDTO[];
}
