export interface EducationRecord {
  id: string;
  type: 'Secondary' | 'HigherSecondary' | 'Undergraduate' | 'Postgraduate' | 'Other';
  institution: string;
  board: string;
  yearOfPassing: number;
  percentage: number;
  rollNumber: string;
  certificateNumber: string;
  subjects: string[];
  status: 'Completed' | 'Ongoing';
}

export interface Person {
  name: string;
  dateOfBirth: string;
  educationRecords: EducationRecord[];
}

export interface DigilockerConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authEndpoint: string;
  apiEndpoint: string;
}

export interface DigilockerToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}