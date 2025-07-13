// biome-ignore lint/performance/noNamespaceImport: This is for the auth schema
import * as authSchema from './auth.schema';

export const schema = {
  ...authSchema,
} as const;
