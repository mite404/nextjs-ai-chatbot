'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  signInWithEmail,
  type SignInState,
  signUpWithEmail,
  type SignUpState,
} from '@/lib/actions';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useActionState } from 'react';

const handleGoogleSignIn = () => {
  authClient.signIn.social({
    provider: 'google',
    callbackURL: '/dashboard',
  });
};

const handleGitHubSignIn = () => {
  authClient.signIn.social({
    provider: 'github',
    callbackURL: '/dashboard',
  });
};

export function AuthTabs() {
  const signInInitialState: SignInState = { message: null, errors: {} };
  const signUpInitialState: SignUpState = { message: null, errors: {} };
  const [signInState, signInAction] = useActionState(signInWithEmail, signInInitialState);
  const [signUpState, signUpAction] = useActionState(signUpWithEmail, signUpInitialState);

  return (
    <>
      <Tabs className="w-full max-w-md" defaultValue="sign-in">
        <TabsList className="grid grid-cols-2" loop={true}>
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>

        {/* Sign In Tab */}
        <TabsContent value="sign-in">
          <Card>
            <CardHeader className="bg-card text-card-foreground flex flex-col space-y-1.5 rounded-xl border p-6">
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form action={signInAction}>
                <Label className="gap-4">Email</Label>
                <Input
                  className="gap-4"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                />
                {signInState.errors?.email?.map((e) => (
                  <p key={e} className="aria-invalid mt-1 text-sm text-red-500">
                    {e}
                  </p>
                ))}
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="password" />
                {signInState.errors?.password?.map((e) => (
                  <p key={e} className="aria-invalid mt-1 text-sm text-red-500">
                    {e}
                  </p>
                ))}
                <div className="flex items-center gap-2">
                  <Checkbox id="remember-me-checkbox" name="remember-me-checkbox" />
                  <Label htmlFor="remember-me-checkbox">Remember me</Label>
                </div>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap shadow transition-colors"
                  type="submit"
                >
                  Login
                </Button>
              </form>
              <Separator />
              <div className="grid grid-cols-2 gap-1">
                <Button
                  className="border-input bg-background hover:bg-accent inline-flex items-center justify-center rounded-md border text-sm font-medium whitespace-nowrap shadow-sm transition-colors"
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignIn}
                >
                  Google
                </Button>
                <Button
                  className="border-input bg-background hover:bg-accent inline-flex items-center justify-center rounded-md border text-sm font-medium whitespace-nowrap shadow-sm transition-colors"
                  variant="outline"
                  type="button"
                  onClick={handleGitHubSignIn}
                >
                  GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex items-center p-6 pt-0" />
          </Card>
        </TabsContent>

        {/* Sign Up Tab */}
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Sign up for an account</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signUpAction}>
                <Label>Name</Label>
                <Input name="name" type="name" placeholder="John/Jane Doe" />
                {signUpState.errors?.name?.map((e) => (
                  <p key={e} className="text-sm text-red-500">
                    {e}
                  </p>
                ))}
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                />
                {signInState.errors?.email?.map((e) => (
                  <p key={e} className="text-sm text-red-500">
                    {e}
                  </p>
                ))}
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="password" />
                {signInState.errors?.password?.map((e) => (
                  <p key={e} className="text-sm text-red-500">
                    {e}
                  </p>
                ))}
                <Button className="w-full" type="submit">
                  Sign Up
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
