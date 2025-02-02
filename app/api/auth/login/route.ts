import { NextResponse } from 'next/server';
import { DigilockerService } from '@/lib/digilocker';

const config = {
  clientId: process.env.DIGILOCKER_CLIENT_ID!,
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET!,
  redirectUri: process.env.DIGILOCKER_REDIRECT_URI!,
  authEndpoint: 'https://api.digitallocker.gov.in/public/oauth2/1/authorize',
  apiEndpoint: 'https://api.digitallocker.gov.in/public/api/1',
};

export async function GET() {
  const digilocker = new DigilockerService(config);
  const authUrl = await digilocker.getAuthUrl();
  return NextResponse.redirect(authUrl);
}