# GitIssue

GitIssue changes a spoken bug report into a GitHub issue that is ready to post.

- The issue follows the issue template and the contributing rules of the repo.
- The issue uses the real screen names from the code of the repo.
- If the bug is already reported, your findings go on the existing issue.
- Nothing goes to GitHub until you tap Post.

Live app: https://report-git-issue.vercel.app

<!-- SCREENSHOTS -->

## How to use it

1. Open a repo. Paste its GitHub link on the home page. Or, on a GitHub repo page, change `github.com` in the address to the GitIssue address.
2. Say or type what went wrong. You do not need an account for this step.
3. Sign in with GitHub when you are ready for the draft.
4. Read the possible duplicate issues. If one is your bug, add your findings to it.
5. Read the draft. Edit it, or ask for a change in plain words.
6. Tap Post.

The [features page](https://report-git-issue.vercel.app/features) lists each feature and the reason for it.

## How it works

- `/<owner>/<repo>` is the report screen. Extra path segments, such as `/issues/12`, are ignored.
- The analyze step (`/api/analyze`) does three things at the same time:
  - It reads the issue templates, CONTRIBUTING and README of the repo, and the recent issues.
  - It finds the screen, route and navigation files in the file tree that match the words of the report.
  - It searches open and closed issues for duplicates.
- One AI call then gives the duplicate ranking and the draft. GitIssue keeps a screen name only if the name is in the scanned code.
- Groq writes the draft first. Gemini is the backup. Each AI call has a 20 second limit.
- For a duplicate, you comment on an open issue. For a closed issue, you reopen it and comment if you have triage access or if you opened it. If not, you comment, or you file a new "possible regression" issue.
- GitIssue encrypts the GitHub token with AES-256-GCM. Only the server can read it.

## Built with

Next.js 16, React 19, Tailwind CSS 4, Supabase (Auth, Postgres, Storage), the GitHub REST API, Groq and Google Gemini.

## Run your own copy

Read [SELF_HOSTING.md](SELF_HOSTING.md). It gives each setup step and each environment variable.

## Checks

| Command | What it does |
| --- | --- |
| `pnpm lint` | Runs ESLint with the Next.js rules. |
| `pnpm typecheck` | Runs TypeScript in strict mode. |
| `pnpm test` | Runs the unit tests and the database smoke tests. |
| `pnpm build` | Makes the production build. |
| `pnpm test:e2e` | Runs the end-to-end and accessibility tests. Run `pnpm build` first. |
| `pnpm perf` | Runs the Lighthouse performance budget. Run `pnpm build` first. |

CI runs lint, typecheck, tests, build and the end-to-end tests on each push.

## Help and support

- To report a bug or ask for a feature, read [CONTRIBUTING.md](CONTRIBUTING.md).
- To report a security problem, read [SECURITY.md](SECURITY.md). Do not open a public issue.
- To support the project, [buy me a coffee](https://buymeacoffee.com/raghavg27).

## License

The code is available under the [MIT License](LICENSE). The GitIssue name and logo are not part of the license; see [TRADEMARKS.md](TRADEMARKS.md). The licenses of the font and other assets are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
