'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });

  redirect('/dashboard');
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  await auth.api.signUpEmail({
    body: { email, password, name },
    headers: await headers(),
  });

  redirect('/dashboard');
}

export async function signOutAction() {
  await auth.api.signOut();
  redirect('/');
}
