import { getCloudflareContext } from '@opennextjs/cloudflare';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous, openAPI } from 'better-auth/plugins';
import { withCloudflare } from 'better-auth-cloudflare';
import { getDb } from '../db';

// Define an asynchronous function to build your auth configuration
async function authBuilder() {
  const dbInstance = await getDb();
  return betterAuth(
    withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: getCloudflareContext().cf,
        d1: {
          // biome-ignore lint/suspicious/noExplicitAny: Database instance from getDb()
          db: dbInstance as any,
          options: {
            usePlural: true, // Optional: Use plural table names (e.g., "users" instead of "user")
            debugLogs: true, // Optional
          },
        },
        // Make sure "KV" is the binding in your wrangler.toml
        // biome-ignore lint/suspicious/noExplicitAny: KV namespace from process.env
        kv: process.env.USER_SESSIONS as any,
        // R2 configuration for file storage (R2_BUCKET binding from wrangler.toml)
        r2: {
          bucket: getCloudflareContext().env.R2_BUCKET,
          maxFileSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: ['.jpg', '.jpeg', '.png', '.gif'],
          additionalFields: {
            category: { type: 'string', required: false },
            isPublic: { type: 'boolean', required: false },
            description: { type: 'string', required: false },
          },
          hooks: {
            upload: {
              before: (_file, ctx) => {
                // Only allow authenticated users to upload files
                if (ctx.session === null) {
                  return null; // Blocks upload
                }
              },
              after: (file, _ctx) => {
                // biome-ignore lint/suspicious/noConsole: log file uploaded
                console.log('File uploaded:', file);
              },
            },
            download: {
              before: (file, ctx) => {
                // Only allow user to access their own files (by default all files are public)
                if (
                  file.isPublic === false &&
                  file.userId !== ctx.session?.user.id
                ) {
                  return null; // Blocks download
                }
                // Allow download
              },
            },
          },
        },
      },
      // Your core Better Auth configuration (see Better Auth docs for all options)
      {
        rateLimit: {
          enabled: true,
          // ... other rate limiting options
        },
        plugins: [openAPI(), anonymous()],
        // ... other Better Auth options
      }
    )
  );
}

// Singleton pattern to ensure a single auth instance
let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null;

// Asynchronously initializes and retrieves the shared auth instance
export async function initAuth() {
  if (!authInstance) {
    authInstance = await authBuilder();
  }
  return authInstance;
}

/* ======================================================================= */
/* Configuration for Schema Generation                                     */
/* ======================================================================= */

// This simplified configuration is used by the Better Auth CLI for schema generation.
// It includes only the options that affect the database schema.
// It's necessary because the main `authBuilder` performs operations (like `getDb()`)
// which use `getCloudflareContext` (not available in a CLI context only on Cloudflare).
// For more details, see: https://www.answeroverflow.com/m/1362463260636479488
export const auth = betterAuth({
  ...withCloudflare(
    {
      autoDetectIpAddress: true,
      geolocationTracking: true,
      cf: {},
      // R2 configuration for schema generation
      r2: {
        // biome-ignore lint/suspicious/noExplicitAny: Mock bucket for schema generation
        bucket: {} as any,
        additionalFields: {
          category: { type: 'string', required: false },
          isPublic: { type: 'boolean', required: false },
          description: { type: 'string', required: false },
        },
      },
      // No actual database or KV instance is needed here, only schema-affecting options
    },
    {
      // Include only configurations that influence the Drizzle schema,
      // e.g., if certain features add tables or columns.
      // socialProviders: { /* ... */ } // If they add specific tables/columns
      plugins: [openAPI(), anonymous()],
    }
  ),

  // Used by the Better Auth CLI for schema generation.
  // biome-ignore lint/suspicious/noExplicitAny: Mock database for schema generation
  database: drizzleAdapter(process.env.DATABASE as any, {
    provider: 'sqlite',
    usePlural: true,
    debugLogs: true,
  }),
});
