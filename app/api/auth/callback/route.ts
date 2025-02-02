import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DigilockerService } from '@/lib/digilocker';

const config = {
  clientId: process.env.DIGILOCKER_CLIENT_ID!,
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET!,
  redirectUri: process.env.DIGILOCKER_REDIRECT_URI!,
  authEndpoint: 'https://api.digitallocker.gov.in/public/oauth2/1/authorize',
  apiEndpoint: 'https://api.digitallocker.gov.in/public/api/1',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect('/error?message=No_authorization_code');
  }

  try {
    const digilocker = new DigilockerService(config);
    const token = await digilocker.exchangeCode(code);

    // Store token in an HTTP-only cookie
    cookies().set('digilocker_token', JSON.stringify(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    return NextResponse.redirect('/dashboard');
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect('/error?message=Authentication_failed');
  }
}