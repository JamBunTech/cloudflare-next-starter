// Setup script for local development
/** biome-ignore-all lint/suspicious/noConsole: Script for Setting for Local Development */

const { execSync } = require('node:child_process');

console.log('-> Setting up environment variables');
execSync('node ./scripts/setup-env.js', { encoding: 'utf-8' });

console.log('-> Setting up database');
execSync('pnpm run db:migrate:dev', { encoding: 'utf-8' });
