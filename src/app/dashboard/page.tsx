import {
  Building,
  Clock,
  FileText,
  Github,
  Globe,
  MapPin,
  Navigation,
  Package,
  Server,
} from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SignOutButton from '@/app/dashboard/signout-button'; // Import the client component
import { initAuth } from '@/auth';
import FileUploadDemo from '@/components/FileUploadDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: demo dashboard page
export default async function DashboardPage() {
  const authInstance = await initAuth();
  // Fetch session using next/headers per better-auth docs for server components
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/'); // Redirect to home if no session
  }

  // Get geolocation data from our plugin's endpoint
  const cloudflareGeolocationData = await authInstance.api.getGeolocation({
    headers: await headers(),
  });

  // Access another plugin's endpoint to demonstrate plugin type inference is still intact
  const openAPISpec = await authInstance.api.generateOpenAPISchema();

  return (
    <div className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="font-bold text-3xl">Dashboard</h1>
            <p className="mt-2 text-gray-500 text-sm">
              Powered by better-auth-cloudflare
            </p>
          </div>

          <Tabs className="w-full" defaultValue="user">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="user">User Info</TabsTrigger>
              <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
              <TabsTrigger value="upload">File Upload</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value="user">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="font-semibold text-xl">
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg">
                    Welcome,{' '}
                    <span className="font-semibold">
                      {session.user?.name ||
                        session.user?.email ||
                        'Anonymous User'}
                    </span>
                    !
                  </p>
                  {session.user?.email && (
                    <p className="break-words text-md">
                      <strong>Email:</strong>{' '}
                      <span className="break-all">{session.user.email}</span>
                    </p>
                  )}
                  {!session.user?.email && (
                    <p className="text-md">
                      <strong>Account Type:</strong> Anonymous
                    </p>
                  )}
                  {session.user?.id && (
                    <p className="text-md">
                      <strong>User ID:</strong> {session.user.id}
                    </p>
                  )}
                  <SignOutButton />{' '}
                  {/* Use the client component for sign out */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="geolocation">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-semibold text-xl">
                    <MapPin className="h-5 w-5" />
                    Your Location
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Automatically detected using Cloudflare's global network
                  </p>
                </CardHeader>
                <CardContent>
                  {cloudflareGeolocationData &&
                    'error' in cloudflareGeolocationData && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4">
                        <div className="text-red-500">⚠️</div>
                        <p className="text-red-700">
                          <strong>Error:</strong>{' '}
                          {cloudflareGeolocationData.error}
                        </p>
                      </div>
                    )}
                  {cloudflareGeolocationData &&
                    !('error' in cloudflareGeolocationData) && (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-3 p-2">
                          <Clock className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Timezone
                            </p>
                            <p className="text-gray-600">
                              {cloudflareGeolocationData.timezone || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2">
                          <Building className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">City</p>
                            <p className="text-gray-600">
                              {cloudflareGeolocationData.city || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Country</p>
                            <p className="text-gray-600">
                              {cloudflareGeolocationData.country || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2">
                          <MapPin className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Region</p>
                            <p className="text-gray-600">
                              {cloudflareGeolocationData.region || 'Unknown'}
                              {cloudflareGeolocationData.regionCode &&
                                ` (${cloudflareGeolocationData.regionCode})`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2">
                          <Server className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Data Center
                            </p>
                            <p className="text-gray-600">
                              {cloudflareGeolocationData.colo || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {(cloudflareGeolocationData.latitude ||
                          cloudflareGeolocationData.longitude) && (
                          <div className="flex items-center gap-3 p-2">
                            <Navigation className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Coordinates
                              </p>
                              <p className="text-gray-600">
                                {cloudflareGeolocationData.latitude &&
                                cloudflareGeolocationData.longitude
                                  ? `${cloudflareGeolocationData.latitude}, ${cloudflareGeolocationData.longitude}`
                                  : 'Partially available'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="space-y-6" value="upload">
              <FileUploadDemo />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="mt-8 w-full py-4 text-center text-gray-500 text-sm">
        <div className="space-y-3">
          <div>Powered by better-auth-cloudflare</div>
          <div className="flex items-center justify-center gap-4">
            <a
              className="flex items-center gap-1 transition-colors hover:text-gray-700"
              href="https://github.com/zpg6/better-auth-cloudflare"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
            <a
              className="flex items-center gap-1 transition-colors hover:text-gray-700"
              href="https://www.npmjs.com/package/better-auth-cloudflare"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Package size={16} />
              <span>npm</span>
            </a>
            <Link
              className="flex items-center gap-1 transition-colors hover:text-gray-700"
              href="/api/auth/reference#tag/cloudflare/get/cloudflare/geolocation"
              title={`OpenAPI v${openAPISpec.openapi} Schema`}
            >
              <FileText size={16} />
              <span>OpenAPI</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
