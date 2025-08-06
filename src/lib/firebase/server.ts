
import 'server-only';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import 'dotenv/config';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function getAdminApp(): App {
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }

  if (firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    return initializeApp({
      credential: cert(firebaseAdminConfig)
    }, 'admin');
  }

  throw new Error("Firebase Admin SDK credentials are not set. The app will not be able to authenticate users on the server.");
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export async function getAuthenticatedUser(): Promise<DecodedIdToken | null> {
  const auth = getAdminAuth();
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    // Clear the invalid cookie
    cookies().delete('session');
    return null;
  }
}

// Exporting the function to get the app, not the app instance directly
export { getAdminApp };
