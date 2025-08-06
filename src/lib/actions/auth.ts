'use server';

import { z } from 'zod';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { revalidatePath } from 'next/cache';

const signUpSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpUser(values: z.infer<typeof signUpSchema>) {
  try {
    const validatedValues = signUpSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: 'Invalid input.' };
    }

    const { email, password, username } = validatedValues.data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signInUser(values: z.infer<typeof signInSchema>) {
  try {
    const validatedValues = signInSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: 'Invalid input.' };
    }
    const { email, password } = validatedValues.data;
    await signInWithEmailAndPassword(auth, email, password);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      return { error: 'Invalid email or password.' };
    }
    return { error: 'An unexpected error occurred.' };
  }
}

export async function signOutUser() {
  await signOut(auth);
  revalidatePath('/');
}
