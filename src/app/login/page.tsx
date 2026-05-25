'use client';

import { Tabs } from '@/components/ui/tabs';
import { signInWithEmail } from '@/lib/actions';

export default function SignInPage() {
  return (
    // center container
    <div className="flex min-h-svh items-center justify-center">
      <Tabs />
      <form action={signInWithEmail}>
        <input name="email" autoComplete="email" type="email" />
        <input name="password" type="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// submit form btn
// onSubmit={signInWithEmail()}
// server action (signInWithEmail() calls auth.api.signInEmail())
// cookies set nextCookies()
// redirect to '/dashboard'
