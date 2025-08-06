
'use server';

import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '../firebase/server';

export async function createSessionCookie(idToken: string) {
  const auth = getAuth(adminApp);
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return { error: 'Could not create session. Please try again.' };
  }
}

export async function signOutUser() {
  cookies().delete('session');
  return { success: true };
}
