'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  signInWithEmail,
  type SignInState,
  signUpWithEmail,
  type SignUpState,
} from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useActionState } from 'react';

export function AuthTabs() {
  const initialState: SignInState = { message: null, errors: {} };
  const [signInState, signInAction] = useActionState(signInWithEmail, initialState);

  return (
    <>
      <Tabs className="w-full max-w-md" defaultValue="sign-in">
        <TabsList className="grid grid-cols-2" loop={true}>
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signInAction}>
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
                <div className="flex items-center gap-2">
                  <Checkbox id="remember-me-checkbox" name="remember-me-checkbox" />
                  <Label htmlFor="remember-me-checkbox">Remember me</Label>
                </div>
                <Button className="w-full" type="submit">
                  Login
                </Button>
              </form>
              <Separator />
              <p>social sign up goes here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sign-up">
          <Card>
            <CardHeader />
            <CardContent />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
