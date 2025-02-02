import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
  const { url, codeVerifier } = await digilocker.getAuthUrl();

  // Store the code verifier in a cookie
  cookies().set('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300 // 5 minutes
  });

  return NextResponse.redirect(url);
}