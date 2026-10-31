# Self-hosting GitIssue

This guide tells you how to run your own copy of GitIssue. Do the steps in this order.

## What you need

- Node 22 (see `.nvmrc`) and pnpm 10.
- A [Supabase](https://supabase.com) project (the free plan is sufficient).
- A GitHub account, to make an OAuth app.
- A [Groq](https://console.groq.com) API key, a [Gemini](https://aistudio.google.com) API key, or both.
- A host for Next.js. These steps use [Vercel](https://vercel.com).

## 1. Get the code

```bash
git clone https://github.com/raghavg27/gitissue.git
cd gitissue
pnpm install
```

## 2. Make the database

1. Make a Supabase project. Write down its region.
2. Apply each file in `supabase/migrations/`, in name order. Use one of these methods:
   - With the Supabase CLI:
     ```bash
     supabase link --project-ref <your-project-ref>
     supabase db push
     ```
   - Or, in the Supabase dashboard, open **SQL Editor**, then paste and run each file.
3. Make sure that the tables `profiles`, `device_profiles`, `reports` and `rate_limits` exist, and that the storage bucket `screenshots` exists.

Row-level security is on for each table. The migrations set it.

## 3. Make the GitHub OAuth app

1. In GitHub, go to **Settings > Developer settings > OAuth Apps > New OAuth App**.
2. Set **Homepage URL** to the address of your app.
3. Set **Authorization callback URL** to `https://<your-project-ref>.supabase.co/auth/v1/callback`.
4. Make a client secret. Write down the client ID and the secret.

## 4. Connect GitHub to Supabase

1. In Supabase, go to **Authentication > Sign In / Providers > GitHub**.
2. Turn it on. Paste the client ID and the secret.
3. Go to **Authentication > URL Configuration**.
4. Set **Site URL** to the address of your app.
5. Add these **Redirect URLs**: `http://localhost:3000/**` and `https://<your-app-address>/**`.

GitIssue asks GitHub for the `repo` scope itself. You do not set the scope in Supabase.

## 5. Set the environment variables

Copy `.env.example` to `.env.local` and fill it in. Each variable has a comment in that file.

| Variable | Required | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable (anon) key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key. Keep it on the server. |
| `TOKEN_ENCRYPTION_KEY` | Yes | 32 random bytes in base64. Make it with `openssl rand -base64 32`. It encrypts GitHub tokens and keys the rate-limit hashes. If you change it, all users must sign in again. |
| `GROQ_API_KEY` | One AI key | Groq key. Groq is asked first. |
| `GROQ_MODEL` | No | Groq model ID. Default: `qwen/qwen3.8-27b`. |
| `GEMINI_API_KEY` | One AI key | Gemini key. Used when Groq fails or is not set. |
| `GEMINI_MODEL` | No | Gemini model ID. Default: `gemini-3.8-flash`. |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Public address of the app, with no trailing slash. In development the app always uses `http://localhost:3000`. |
| `GOOGLE_SITE_VERIFICATION` | No | Content of the Google Search Console HTML tag. |
| `BING_SITE_VERIFICATION` | No | Content of the Bing Webmaster Tools `msvalidate.01` tag. |

When a required variable is missing, the app stops with a message that names it.

## 6. Run it on your computer

```bash
pnpm dev
```

Open http://localhost:3000. Sign in with GitHub and open a repo that your account can see.

## 7. Deploy to Vercel

1. Import the repository into Vercel.
2. Add the same environment variables. Set `NEXT_PUBLIC_APP_URL` to the production address.
3. In `vercel.json`, set `regions` to the Vercel region that is nearest to your Supabase region. The default is `hnd1` (Tokyo).
4. Deploy.
5. In the Vercel project, turn on **Web Analytics** and **Speed Insights**.

Use a custom domain from the start, if you can. It is hard to move search ranking from a free subdomain later.

## 8. After the first deploy

- In GitHub, under **Settings > Code security**, turn on **Private vulnerability reporting**. `SECURITY.md` and `/.well-known/security.txt` point to it.
- Add the site to Google Search Console and Bing Webmaster Tools, set the two verification variables, and submit `https://<your-app-address>/sitemap.xml` to both.
- Change the name and logo. The MIT license does not cover the GitIssue name and logo. See [TRADEMARKS.md](TRADEMARKS.md).

## Checks

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript, strict mode
pnpm test        # Unit tests and database smoke tests
pnpm build       # Production build
pnpm test:e2e    # End-to-end and accessibility tests (Playwright)
pnpm perf        # Lighthouse performance budget, after pnpm build
```
