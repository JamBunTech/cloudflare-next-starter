/** biome-ignore-all lint/suspicious/noConsole: Script for Setting for Local Development */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Generate a secure random string for BETTER_AUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Path to .env file
const envPath = path.join(process.cwd(), '.env');

const updateEnvFile = () => {
  try {
    // Check if .env file already exists
    if (fs.existsSync(envPath)) {
      console.log('.env file already exists. Skipping creation.');
      return;
    }

    // Generate a new secret
    const newSecret = generateSecret();

    // Create the .env content with all required variables
    const envContent = `BETTER_AUTH_SECRET="${newSecret}"
BETTER_AUTH_URL=http://localhost:3000

`;

    // Write the content to .env file (only if it doesn't exist)
    fs.writeFileSync(envPath, envContent);
    console.log('.env file has been created with the required variables');
  } catch (error) {
    console.error('Error creating .env file:', error);
    process.exit(1);
  }
};

updateEnvFile();
