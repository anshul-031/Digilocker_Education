import { DigilockerConfig, DigilockerToken, Person, EducationRecord } from './types';
import crypto from 'crypto';

class DigilockerService {
  private config: DigilockerConfig;
  private token: DigilockerToken | null = null;
  private codeVerifier: string | null = null;

  constructor(config: DigilockerConfig) {
    this.config = config;
  }

  private generateCodeVerifier(): string {
    return crypto.randomBytes(32)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async getAuthUrl(): Promise<string> {
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: crypto.randomBytes(16).toString('hex'),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: 'avs_parent' // Using avs_parent scope without OpenID
    });

    return `${this.config.authEndpoint}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<DigilockerToken> {
    if (!this.codeVerifier) {
      throw new Error('Code verifier not found. Please initiate the auth flow again.');
    }

    const response = await fetch(`${this.config.apiEndpoint}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code_verifier: this.codeVerifier
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const token = await response.json();
    
    // Validate the token has the required fields
    if (!token.access_token || !token.token_type || !token.expires_in || !token.refresh_token) {
      throw new Error('Invalid token response from DigiLocker');
    }

    this.token = token;
    return token;
  }

  private async fetchDocument(uri: string): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.config.apiEndpoint}/pull/${uri}`, {
      headers: {
        Authorization: `Bearer ${this.token.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${uri}`);
    }

    return response.json();
  }

  async getEducationRecords(): Promise<EducationRecord[]> {
    const records: EducationRecord[] = [];

    // Fetch 10th marksheet
    try {
      const tenth = await this.fetchDocument('cbse/marksheet10');
      records.push({
        id: tenth.docId,
        type: 'Secondary',
        institution: tenth.school,
        board: 'CBSE',
        yearOfPassing: parseInt(tenth.yearOfPassing),
        percentage: parseFloat(tenth.percentage),
        rollNumber: tenth.rollNumber,
        certificateNumber: tenth.certificateNumber,
        subjects: tenth.subjects.map((s: any) => s.name),
        status: 'Completed'
      });
    } catch (error) {
      console.error('Error fetching 10th marksheet:', error);
    }

    // Fetch 12th marksheet
    try {
      const twelfth = await this.fetchDocument('cbse/marksheet12');
      records.push({
        id: twelfth.docId,
        type: 'HigherSecondary',
        institution: twelfth.school,
        board: 'CBSE',
        yearOfPassing: parseInt(twelfth.yearOfPassing),
        percentage: parseFloat(twelfth.percentage),
        rollNumber: twelfth.rollNumber,
        certificateNumber: twelfth.certificateNumber,
        subjects: twelfth.subjects.map((s: any) => s.name),
        status: 'Completed'
      });
    } catch (error) {
      console.error('Error fetching 12th marksheet:', error);
    }

    return records;
  }

  async getUserProfile(): Promise<Partial<Person>> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.config.apiEndpoint}/user`, {
      headers: {
        Authorization: `Bearer ${this.token.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return {
      name: data.name,
      dateOfBirth: data.dob,
    };
  }
}

export { DigilockerService }