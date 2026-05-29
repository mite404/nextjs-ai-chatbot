import { AuthTabs } from '@/app/login/_components/auth-tabs';

export default function SignInPage() {
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthTabs />
      </div>
    </div>
  );
}
