'use server';

import {z} from 'zod';
import {auth} from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

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
    
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
        
    return {success: true};
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return {error: 'Invalid email or password.'};
    }
    console.error('Sign-in error:', error);
    return {error: 'An unexpected error occurred.'};
  }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch(error) {
        console.error('Sign-out error:', error);
        return { error: 'Failed to sign out.' };
    }
}
