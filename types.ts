export enum ReviewSource {
  Google = 'Google',
  Facebook = 'Facebook',
  Yelp = 'Yelp',
  AppStore = 'App Store',
  Trustpilot = 'Trustpilot',
}

export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
  Unknown = 'Unknown',
}

export enum ReviewStatus {
  PendingAnalysis = 'PendingAnalysis',
  Analyzing = 'Analyzing',
  PendingResponse = 'PendingResponse',
  Generating = 'Generating',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Error = 'Error',
}

export interface AnalysisResult {
  sentiment: Sentiment;
  intent: string;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: ReviewSource;
  status: ReviewStatus;
  businessName?: string;
  analysis?: AnalysisResult;
  response?: string;
  errorMessage?: string;
  rowIndex?: number; // Added for efficient updates with Sheets API v4
}

export interface Business {
  id: number;
  name: string;
  rowIndex?: number; // Added for efficient updates with Sheets API v4
}
