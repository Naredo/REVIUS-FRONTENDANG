export interface SnowballingDTO {
  id?: number;
  name: string;
  url?: string;
  source: string;
  snowballingType: 'FORWARD' | 'BACKWARDS';
  studyId?: number;

  // Optional Study metadata (kept minimal for Identification form)
  dcTitle?: string; // título
  dcCreator?: string; // autor(es)
  prismCoverDate?: string; // año (YYYY)
  subtypeDescription?: string; // tipo
  prismUrl?: string; // sourceURL
  prismPublicationName?: string; // lugar/venue
  prismDoi?: string; // DOI

  selectionDecision?: 'INCLUDE' | 'EXCLUDE' | null;
  exclusionCriterion?: string | null;
}
