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
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      return NextResponse.redirect(
        new URL(`/error?message=${encodeURIComponent(errorDescription || 'Authentication failed')}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/error?message=No_authorization_code', request.url)
      );
    }

    const cookieStore = cookies();
    const codeVerifier = cookieStore.get('code_verifier');

    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/error?message=Authentication_session_expired', request.url)
      );
    }

    if (!process.env.DIGILOCKER_CLIENT_ID || !process.env.DIGILOCKER_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/error?message=Missing_configuration', request.url)
      );
    }

    const digilocker = new DigilockerService(config);
    const token = await digilocker.exchangeCode(code, codeVerifier.value);

    // Clear the code verifier cookie
    cookieStore.delete('code_verifier');

    // Store token in a cookie
    cookieStore.set('digilocker_token', JSON.stringify(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}