
import 'server-only';
import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import "dotenv/config";

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export const adminApp: App =
  getApps().find((it) => it.name === 'admin') ||
  initializeApp(
    {
      credential: cert(firebaseAdminConfig),
    },
    'admin'
  );


export async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
