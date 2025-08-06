
'use server-only';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

function getAdminApp(): App {
  // Return the existing app if it has already been initialized
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }

  // Get credentials from environment variables
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Check if all required credentials are available
  if (privateKey && clientEmail && projectId) {
    // Initialize the app
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, 'admin');
  }

  // Throw an error if credentials are not set
  throw new Error("Firebase Admin SDK credentials are not set in environment variables. The app cannot authenticate users on the server.");
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export async function getAuthenticatedUser(): Promise<DecodedIdToken | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Initialize Auth and verify the session cookie
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    // Clear the invalid cookie
    cookies().delete('session');
    return null;
  }
}
