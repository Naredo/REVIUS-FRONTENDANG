export interface SnowballingDTO {
  id?: number;
  name: string;
  url?: string;
  source: string;
  snowballingType: 'FORWARD' | 'BACKWARD';
  studyId?: number;
}
