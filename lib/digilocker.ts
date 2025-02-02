import { DigilockerConfig, DigilockerToken, Person, EducationRecord } from './types';
import crypto from 'crypto';

class DigilockerService {
  private config: DigilockerConfig;
  private token: DigilockerToken | null = null;

  constructor(config: DigilockerConfig) {
    this.config = config;
    console.log('DigilockerService initialized with config:', {
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri,
      authEndpoint: this.config.authEndpoint,
      apiEndpoint: this.config.apiEndpoint
    });
  }

  private generateCodeVerifier(): string {
    console.log('Generating code verifier...');
    const verifier = crypto.randomBytes(32)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    console.log('Generated code verifier:', verifier);
    return verifier;
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    console.log('Generating code challenge for verifier:', verifier);
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hash));
    const hashString = hashArray.map(byte => String.fromCharCode(byte)).join('');
    const base64 = btoa(hashString);
    
    const challenge = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    console.log('Generated code challenge:', challenge);
    return challenge;
  }

  async getAuthUrl(): Promise<{ url: string; codeVerifier: string }> {
    console.log('Generating authorization URL...');
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: crypto.randomBytes(16).toString('hex'),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: 'avs_parent'
    });

    const url = `${this.config.authEndpoint}?${params.toString()}`;
    console.log('Generated authorization URL:', url);
    
    return { url, codeVerifier };
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<DigilockerToken> {
    console.log('Starting code exchange process...');
    console.log('Authorization code:', code);
    console.log('Code verifier:', codeVerifier);

    const tokenEndpoint = 'https://api.digitallocker.gov.in/public/oauth2/1/token';
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code_verifier: codeVerifier
    });

    try {
      console.log('Token exchange request:', {
        url: tokenEndpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        params: Object.fromEntries(params)
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString()
      });

      console.log('Token exchange response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });

      const responseText = await response.text();
      console.log('Token exchange response body:', responseText);

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} - ${responseText}`);
      }

      let token;
      try {
        token = JSON.parse(responseText);
        console.log('Parsed token response:', {
          ...token,
          access_token: token.access_token ? '***' : undefined,
          refresh_token: token.refresh_token ? '***' : undefined
        });
      } catch (e) {
        console.error('Failed to parse token response:', e);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!token.access_token || !token.token_type || !token.expires_in) {
        console.error('Invalid token structure:', token);
        throw new Error('Invalid token response from DigiLocker');
      }

      this.token = token;
      return token;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error instanceof Error ? error : new Error('Failed to exchange code for token');
    }
  }

  private async fetchDocument(uri: string): Promise<any> {
    if (!this.token) {
      console.error('Attempted to fetch document without authentication');
      throw new Error('Not authenticated');
    }

    // First, get the list of issued documents
    const url = 'https://api.digitallocker.gov.in/public/oauth2/1/file/issued';
    console.log(`Fetching issued documents from: ${url}`);
    console.log('Request headers:', {
      Authorization: 'Bearer ***',
      Accept: 'application/json'
    });

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token.access_token}`,
          'Accept': 'application/json',
        },
      });

      console.log(`Document fetch response for ${uri}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });

      const responseText = await response.text();
      console.log(`Document fetch response body for ${uri}:`, responseText);

      if (!response.ok) {
        throw new Error(`Failed to fetch document ${uri}: ${response.status} - ${responseText}`);
      }

      try {
        const parsedResponse = JSON.parse(responseText);
        console.log(`Parsed response for ${uri}:`, parsedResponse);
        
        // Find the specific document in the issued documents list
        const documents = parsedResponse.items || [];
        const document = documents.find((doc: any) => doc.uri === uri || doc.doctype === uri);
        
        if (!document) {
          throw new Error(`Document not found: ${uri}`);
        }

        // Now fetch the specific document details
        const documentUrl = `https://api.digitallocker.gov.in/public/oauth2/1/xml/${document.uri}`;
        const documentResponse = await fetch(documentUrl, {
          headers: {
            'Authorization': `Bearer ${this.token.access_token}`,
            'Accept': 'application/json',
          },
        });

        const documentText = await documentResponse.text();
        console.log(`Document details response for ${uri}:`, documentText);

        if (!documentResponse.ok) {
          throw new Error(`Failed to fetch document details: ${documentResponse.status} - ${documentText}`);
        }

        return JSON.parse(documentText);
      } catch (e) {
        console.error(`Failed to parse response for ${uri}:`, e);
        throw new Error(`Invalid JSON response for ${uri}: ${responseText}`);
      }
    } catch (error) {
      console.error(`Error fetching document ${uri}:`, error);
      throw error;
    }
  }

  async getEducationRecords(): Promise<EducationRecord[]> {
    console.log('Fetching education records...');
    const records: EducationRecord[] = [];

    try {
      console.log('Attempting to fetch 10th marksheet...');
      const tenth = await this.fetchDocument('CBSE/MARKS10');
      console.log('Successfully fetched 10th marksheet:', tenth);
      records.push({
        id: tenth.docId || tenth.id,
        type: 'Secondary',
        institution: tenth.school || tenth.institution,
        board: 'CBSE',
        yearOfPassing: parseInt(tenth.yearOfPassing || tenth.year),
        percentage: parseFloat(tenth.percentage || tenth.marks),
        rollNumber: tenth.rollNumber || tenth.roll,
        certificateNumber: tenth.certificateNumber || tenth.certificate,
        subjects: Array.isArray(tenth.subjects) ? tenth.subjects.map((s: any) => s.name || s) : [],
        status: 'Completed'
      });
    } catch (error) {
      console.error('Error fetching 10th marksheet:', error);
    }

    try {
      console.log('Attempting to fetch 12th marksheet...');
      const twelfth = await this.fetchDocument('CBSE/MARKS12');
      console.log('Successfully fetched 12th marksheet:', twelfth);
      records.push({
        id: twelfth.docId || twelfth.id,
        type: 'HigherSecondary',
        institution: twelfth.school || twelfth.institution,
        board: 'CBSE',
        yearOfPassing: parseInt(twelfth.yearOfPassing || twelfth.year),
        percentage: parseFloat(twelfth.percentage || twelfth.marks),
        rollNumber: twelfth.rollNumber || twelfth.roll,
        certificateNumber: twelfth.certificateNumber || twelfth.certificate,
        subjects: Array.isArray(twelfth.subjects) ? twelfth.subjects.map((s: any) => s.name || s) : [],
        status: 'Completed'
      });
    } catch (error) {
      console.error('Error fetching 12th marksheet:', error);
    }

    if (records.length === 0) {
      console.error('No education records found');
      throw new Error('No education records found');
    }

    console.log('Successfully fetched education records:', records);
    return records;
  }

  async getUserProfile(): Promise<Partial<Person>> {
    if (!this.token) {
      console.error('Attempted to fetch user profile without authentication');
      throw new Error('Not authenticated');
    }

    const url = 'https://api.digitallocker.gov.in/public/oauth2/1/user';
    console.log('Fetching user profile from:', url);
    console.log('Request headers:', {
      Authorization: 'Bearer ***',
      Accept: 'application/json'
    });

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token.access_token}`,
          'Accept': 'application/json',
        },
      });

      console.log('User profile response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });

      const responseText = await response.text();
      console.log('User profile response body:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status} - ${responseText}`);
      }

      try {
        const data = JSON.parse(responseText);
        console.log('Parsed user profile:', data);
        return {
          name: data.name || data.full_name,
          dateOfBirth: data.dob || data.birth_date,
        };
      } catch (e) {
        console.error('Failed to parse user profile response:', e);
        throw new Error(`Invalid JSON response for user profile: ${responseText}`);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}

export { DigilockerService }