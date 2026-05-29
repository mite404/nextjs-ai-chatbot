'use client';
import { signOutAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit">Sign Out</Button>
    </form>
  );
}
