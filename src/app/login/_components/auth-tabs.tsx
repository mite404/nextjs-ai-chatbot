'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithEmail, signUpWithEmail } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export function AuthTabs() {
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
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
              />
              <Label>Password</Label>
              <Input name="password" type="password" placeholder="password" />
              <Checkbox>Remember Me</Checkbox>
              <Button className="w-3.5 rounded-2xl bg-white" type="submit">
                Login
              </Button>
              <p>social sign up goes here</p>
              <p>------------------</p>
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
