'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { Sign } from 'crypto';

const SignInSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }).max(255),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).max(255),
});

const SignUpSchema = SignInSchema.extend({
  name: z.string().min(1, { message: 'Please enter your name' }),
});

export type SignInState = {
  errors?: { email?: Array<string>; password?: Array<string> };
  message?: string | null;
};

export type SignUpState = {
  errors?: { name?: Array<string>; email?: Array<string>; password?: Array<string> };
  message?: string | null;
};

export async function signInWithEmail(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const validated = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await auth.api.signInEmail({
    body: validated.data,
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
