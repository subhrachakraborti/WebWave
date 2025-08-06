
import 'server-only';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import "dotenv/config";

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminApp: App;

if (getApps().length === 0) {
  if (firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    adminApp = initializeApp({
      credential: cert(firebaseAdminConfig)
    }, 'admin');
  } else {
    console.error("Firebase Admin SDK credentials are not set. The app will not be able to authenticate users on the server.");
  }
} else {
  adminApp = getApps().find(app => app.name === 'admin')!;
}


export async function getAuthenticatedUser() {
  const auth = getAuth(adminApp);
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
    cookies().delete('session');
    return null;
  }
}

export { adminApp };
