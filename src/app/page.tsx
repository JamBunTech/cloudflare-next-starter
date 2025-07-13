'use client';

import { createAuthClient } from 'better-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { useSession } = createAuthClient();

import authClient from '@/auth/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  const { data: session, error: sessionError } = useSession();
  const [isAuthActionInProgress, setIsAuthActionInProgress] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleAnonymousLogin = async () => {
    setIsAuthActionInProgress(true);
    try {
      const result = await authClient.signIn.anonymous();
      // biome-ignore lint/suspicious/noConsole: log anonymous login result
      console.log('Anonymous login result:', result);

      if (result.error) {
        setIsAuthActionInProgress(false);
        alert(`Anonymous login failed: ${result.error.message}`);
      } else {
        // Login succeeded, redirect to dashboard
        // Don't reset loading state here - let the redirect happen
        window.location.href = '/dashboard';
      }
      // biome-ignore lint/suspicious/noExplicitAny: any
    } catch (e: any) {
      setIsAuthActionInProgress(false);
      alert(`An unexpected error occurred during login: ${e.message}`);
    }
  };

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Error loading session: {sessionError.message}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Powered by better-auth-cloudflare.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-center text-gray-600 text-sm">
            No personal information required.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={isAuthActionInProgress}
            onClick={handleAnonymousLogin}
          >
            {isAuthActionInProgress ? 'Logging In...' : 'Login Anonymously'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
