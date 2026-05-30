import VoidBackground from '@/components/void-background';
import { AuthTabs } from '@/app/login/_components/auth-tabs';

export default function SignInPage() {
  return (
    <div className="dark relative min-h-screen overflow-hidden">
      {/* Background layer — the void */}
      <div className="absolute inset-0 z-0">
        <VoidBackground />
      </div>

      {/* Foreground layer — the auth form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthTabs />
        </div>
      </div>
    </div>
  );
}
