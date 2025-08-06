
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

const apps = getApps();
if (apps.length === 0) {
  if (firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    adminApp = initializeApp({
      credential: cert(firebaseAdminConfig)
    }, 'admin');
  } else {
    // This case will result in an error if getAuthenticatedUser is called.
    // It's a configuration issue that needs to be resolved by the developer.
    console.error("Firebase Admin SDK not initialized. Missing environment variables.");
    // To prevent a hard crash, we create a placeholder. The app will fail gracefully
    // when auth is attempted.
    adminApp = {} as App; 
  }
} else {
  adminApp = apps.find(app => app.name === 'admin')!;
}


export async function getAuthenticatedUser() {
  // Ensure the app is initialized before trying to use it.
  if (!adminApp.name) {
    console.error("Firebase Admin not available. Cannot authenticate user.");
    return null;
  }
  
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
    // Clear the invalid cookie
    cookies().delete('session');
    return null;
  }
}

export { adminApp };
