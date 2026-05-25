import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  //

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div>
      <h1>Welcome {session.user.email}</h1>
      <button
        onClick={() => {
          redirect('/api/auth/sign-out');
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
