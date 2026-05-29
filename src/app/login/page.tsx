'use client';

import styles from './page.module.css';
import { AuthTabs } from '@/app/login/_components/auth-tabs';

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AuthTabs />
      </main>
    </div>
  );
}

// submit form btn
// onSubmit={signInWithEmail()}
// server action (signInWithEmail() calls auth.api.signInEmail())
// cookies set nextCookies()
// redirect to '/dashboard'
