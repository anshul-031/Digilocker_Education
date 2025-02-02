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
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('digilocker_token');

  if (!tokenCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const digilocker = new DigilockerService(config);
    const token = JSON.parse(tokenCookie.value);
    Object.assign(digilocker, { token });

    const [profile, records] = await Promise.all([
      digilocker.getUserProfile(),
      digilocker.getEducationRecords()
    ]);

    return NextResponse.json({
      ...profile,
      educationRecords: records
    });
  } catch (error) {
    console.error('Error fetching education data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education data' },
      { status: 500 }
    );
  }
}