'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react'; // Added useState and useTransition
import authClient from '@/auth/auth-client'; // Assuming default export from your authClient setup
import { Button } from '@/components/ui/button'; // Import the shadcn/ui Button

export default function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // For smoother UI updates

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Example of client-side geolocation data fetching
      const result = await authClient.cloudflare.geolocation();
      if (result.error) {
        // biome-ignore lint/suspicious/noConsole: log error
        console.error('Error fetching geolocation:', result.error);
      } else if (result.data && !('error' in result.data)) {
        // biome-ignore lint/suspicious/noConsole: log geolocation data
        console.log('Geolocation data:', {
          timezone: result.data.timezone,
          city: result.data.city,
          country: result.data.country,
          region: result.data.region,
          regionCode: result.data.regionCode,
          colo: result.data.colo,
          latitude: result.data.latitude,
          longitude: result.data.longitude,
        });
      }

      // Actually sign out
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            startTransition(() => {
              router.replace('/'); // Redirect to home page on sign out
            });
          },
          onError: (err) => {
            // biome-ignore lint/suspicious/noConsole: log error
            console.error('Sign out error:', err);
            setError(err.error.message || 'Sign out failed. Please try again.');
            // Optionally, still attempt to redirect or handle UI differently
            // router.replace("/");
          },
        },
      });
      // biome-ignore lint/suspicious/noExplicitAny: any
    } catch (e: any) {
      // Catch any unexpected errors during the signOut call itself
      // biome-ignore lint/suspicious/noConsole: log error
      console.error('Unexpected sign out error:', e);
      setError(e.message || 'An unexpected error occurred. Please try again.');
      // router.replace("/"); // Fallback redirect
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 flex w-full flex-col items-center">
      {/* Container for button and error message */}
      <Button
        className="w-full max-w-xs"
        disabled={isLoading || isPending}
        onClick={handleSignOut} // Use destructive variant for sign out
        variant="destructive"
      >
        {isLoading || isPending ? 'Signing Out...' : 'Sign Out'}
      </Button>
      {error && (
        <p className="mt-2 text-center text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
