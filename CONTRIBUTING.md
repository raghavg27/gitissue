# Contributing to GitIssue

Thank you for your help. This file tells you how to report a problem, ask for a feature and send a change.

## Report a bug or ask for a feature

1. Search the [open and closed issues](https://github.com/raghavg27/gitissue/issues?q=is%3Aissue) first. If the issue exists, add a comment to it.
2. If it does not exist, open a new issue. Use the bug report form or the feature request form.
3. For a security problem, do not open an issue. Follow [SECURITY.md](SECURITY.md).

## Set up the project

Follow the steps in [SELF_HOSTING.md](SELF_HOSTING.md). You need Node 22 and pnpm.

```bash
pnpm install
pnpm dev
```

## Make a change

1. Make a branch from `main`.
2. Keep each change small. One pull request does one thing.
3. Add or change tests for each rule that you change.
4. Run all the checks. They must pass:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   pnpm test:e2e
   ```

5. Open a pull request. Fill in the template.

## Commit messages

Use this format: `type(scope): description`. For example: `fix(ui): keep long titles on one line`.

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.

## Rules for text

- Use simple English. Do not use contractions ("do not", not "don't"). Do not use em dashes.
- An error message tells the user what happened and what to do next.
- Use one name for one thing on all pages.
- Write documentation in ASD-STE100 Simplified Technical English.

## Rules for privacy

When your change sends data to a new outside service, update the privacy policy in `src/app/privacy/page.tsx` in the same pull request.

## Database changes

Put each database change in a new file in `supabase/migrations/`. Do not change a migration that is already on `main`.

## License

When you send a change, you agree that it is licensed under the [MIT License](LICENSE).
