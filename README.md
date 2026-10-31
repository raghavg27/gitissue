# GitIssue

Dictate a bug from your phone and get a GitHub issue that follows the repo's own template and contributing rules, uses the app's real screen names from its code, and lands on the existing issue when the bug is already reported.

Built with Next.js, Supabase (Auth, Postgres, Storage), the GitHub REST API and Groq, with Gemini's free tier as a backup.

## Setup

1. **Supabase project.** Create one, then apply the schema:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
   This creates `profiles`, `device_profiles`, `reports` and the public `screenshots` bucket.
2. **GitHub OAuth app** (GitHub → Settings → Developer settings → OAuth Apps). Use `https://<ref>.supabase.co/auth/v1/callback` as the callback URL.
3. **Supabase Auth → Providers → GitHub.** Enable it and paste the OAuth app's client ID and secret. The app requests the `repo` scope itself.
4. **Supabase Auth → URL Configuration.** Set the Site URL to your app URL and add `http://localhost:3000/**` and `https://<your-app>.vercel.app/**` to Redirect URLs.
5. **Groq key** from the Groq console, and a **Gemini key** from Google AI Studio. The app uses Groq first and Gemini when Groq fails. Each call has a 20 second limit. You can set only one of the two keys.
6. **Environment.** Copy `.env.example` to `.env.local` and fill it in. Generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -base64 32`.

```bash
pnpm install
pnpm dev
```

## Deploy

Import the repo into Vercel, add the same environment variables (set `NEXT_PUBLIC_APP_URL` to the Vercel URL), and deploy.

## How it works

- `/<owner>/<repo>` is the report screen, so any GitHub repo URL with `github.com` swapped for the app's domain opens straight into a report. Extra path segments such as `/issues/12` are ignored.
- **Analyze** (`/api/analyze`) does three things in parallel:
  - reads issue templates, CONTRIBUTING and README (cached per tree SHA), plus recent issues;
  - picks screen, route and navigation files from the tree using keywords from the dictation;
  - searches open and closed issues for duplicates.

  One AI call then returns both the duplicate ranking and a draft. Screen names the model returns are kept only if they appear in the scanned code.
- When the tester confirms a duplicate, they comment on an open issue, or reopen and comment on a closed one if they have triage access or opened it. Otherwise they choose between commenting and filing a "possible regression" issue.
- Nothing is written to GitHub until the tester taps Post. The GitHub token is stored AES-GCM-encrypted and is only readable with the service-role key on the server.

## Scripts

`pnpm test` (Vitest), `pnpm lint`, `pnpm build`.

## License

The code is available under the [MIT License](LICENSE).
