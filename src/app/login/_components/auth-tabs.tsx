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
              <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
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
                    variant="outline"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center text-sm font-medium whitespace-nowrap shadow transition-colors"
                    type="submit"
                    aria-label="Login"
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
                    aria-label="Sign in with Google"
                    onClick={handleGoogleSignIn}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="0.98em"
                      height="1em"
                      viewBox="0 0 256 262"
                    >
                      <path
                        fill="#4285F4"
                        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                      ></path>
                      <path
                        fill="#EB4335"
                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      ></path>
                    </svg>
                    <span className="hidden sm:inline">Google</span>
                  </Button>
                  <Button
                    className="border-input bg-background hover:bg-accent inline-flex items-center justify-center rounded-md border text-sm font-medium whitespace-nowrap shadow-sm transition-colors"
                    variant="outline"
                    type="button"
                    aria-label="Sign in with GitHub"
                    onClick={handleGitHubSignIn}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.2em"
                      height="1.2em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                      ></path>
                    </svg>
                    <span className="hidden sm:inline">GitHub</span>
                  </Button>
                </div>
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
