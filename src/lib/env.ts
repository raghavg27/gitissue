// Required environment variables are read through this file or env.server.ts, so a missing value
// fails with one clear message. Optional ones (site address, verification tags, Vercel values) are
// read where they are used. Public values are written out in full so Next.js can inline them.

export function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Set it in .env.local (see .env.example and SELF_HOSTING.md).`);
  }
  return value;
}

export const publicEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseKey() {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  },
};
