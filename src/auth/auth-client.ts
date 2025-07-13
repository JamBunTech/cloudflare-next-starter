import { createAuthClient } from 'better-auth/client';
import { anonymousClient } from 'better-auth/client/plugins';
import { cloudflareClient } from 'better-auth-cloudflare/client';

const authClient = createAuthClient({
  plugins: [cloudflareClient(), anonymousClient()], // includes geolocation and R2 file features (if configured)
});

export default authClient;
