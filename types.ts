export enum ClashStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ClashSeverity {
  CRITICAL = 'Critical',
  DESIGN_ISSUE = 'Design Issue',
  TOLERANCE_ISSUE = 'Tolerance Issue',
  FALSE_CLASH = 'False Clash',
  UNKNOWN = 'Unknown'
}

export enum Discipline {
  ARCH = 'Architecture',
  STRUCT = 'Structure',
  MEP = 'MEP',
  UNKNOWN = 'Unknown'
}

export interface RawClashData {
  id: string;
  testName: string;
  clashName: string;
  item1: string;
  item2: string;
  distance: string;
  layer1: string;
  layer2: string;
}

export interface EnrichedClash extends RawClashData {
  status: ClashStatus;
  aiSeverity: ClashSeverity;
  aiResponsibility: Discipline;
  aiDescription: string;
  aiReasoning?: string;
}

export interface BatchAnalysisResponse {
  results: {
    id: string;
    severity: ClashSeverity;
    responsibility: Discipline;
    description: string;
    reasoning: string;
  }[];
}
