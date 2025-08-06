'use server';

import {z} from 'zod';
import {auth} from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {getAuth} from 'firebase-admin/auth';
import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInUser(values: z.infer<typeof signInSchema>) {
  try {
    const validatedValues = signInSchema.safeParse(values);
    if (!validatedValues.success) {
      return {error: 'Invalid input.'};
    }
    const {email, password} = validatedValues.data;
    
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    const idToken = await userCredential.user.getIdToken();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn,
    });
    
    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    return {success: true};
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      return {error: 'Invalid email or password.'};
    }
    return {error: 'An unexpected error occurred.'};
  }
}

export async function signOutUser() {
  await signOut(auth);
  cookies().delete('session');
  revalidatePath('/');
}