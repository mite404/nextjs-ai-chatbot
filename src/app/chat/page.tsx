import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { SignOutButton } from './_components/sign-out-button';

export default async function DashboardPage() {
  //

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome {session.user.email}</h1>
      <SignOutButton />
    </div>
  );
}
