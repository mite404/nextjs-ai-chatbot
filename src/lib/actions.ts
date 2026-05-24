'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { auth } from '@/lib/auth';

export async function signInWithEmail(formData: FormData) {
  // email
  // password
  // await auth.api
  // send body obj
  // redirect to ..?
}

export async function signOutAction() {
  await auth.api.signOut();
  redirect('/');
}
