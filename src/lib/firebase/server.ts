'use server';
import {getAuth} from 'firebase-admin/auth';
import {initializeApp, getApps, App, getApp} from 'firebase-admin/app';
import {credential} from 'firebase-admin';

const firebaseAdminConfig = {
  credential: credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseAdminConfig);
}

export async function getUserIdFromSession(sessionCookie?: string) {
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedToken = await getAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    return decodedToken.uid;
  } catch (error) {
    