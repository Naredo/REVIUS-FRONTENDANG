import { ScopusAffiliationDTO } from './scopus-affiliation-dto';
import { ScopusLinkDTO } from './scopus-link-dto';

export interface ScopusStudyDTO {
  id?: number;

  prismUrl?: string;
  dcIdentifier?: string;
  eid?: string;
  dcTitle?: string;
  dcCreator?: string;

  prismPublicationName?: string;
  prismIssn?: string;
  prismEIssn?: string;
  prismVolume?: string;
  prismIssueIdentifier?: string;
  prismPageRange?: string;
  prismCoverDate?: string;
  prismCoverDisplayDate?: string;
  prismDoi?: string;

  citedbyCount?: string;

  pubmedId?: string;
  prismAggregationType?: string;
  subtype?: string;
  subtypeDescription?: string;
  articleNumber?: string;
  sourceId?: string;

  openaccess?: string;
  openaccessFlag?: boolean;
  pii?: string;

  links?: ScopusLinkDTO[];
  affiliations?: ScopusAffiliationDTO[];
}
