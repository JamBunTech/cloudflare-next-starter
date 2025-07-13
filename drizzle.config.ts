import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler');
    const dbFile = fs
      .readdirSync(basePath, { encoding: 'utf-8', recursive: true })
      .find((f) => f.endsWith('.sqlite'));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: run locally
    console.log(`Error  ${err}`);
  }
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/index.ts',
  out: './drizzle',
  ...(process.env.NODE_ENV === 'production'
    ? {
        driver: 'd1-http',
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID,
          databaseId: process.env.CLOUDFLARE_DATABASE_ID,
          token: process.env.CLOUDFLARE_D1_API_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: `file:${getLocalD1DB()}`,
        },
      }),
  migrations: {
    prefix: 'index',
    table: '__drizzle_migrations',
    schema: 'public',
  },
});
