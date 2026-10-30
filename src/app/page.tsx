import { AppHeader } from "@/components/AppHeader";
import { RepoPicker } from "@/components/RepoPicker";
import { SignIn } from "@/components/SignIn";
import { getViewer } from "@/lib/github/client";

export default async function Home({ searchParams }: PageProps<"/">) {
  const viewer = await getViewer();
  const { error } = await searchParams;

  return (
    <>
      <AppHeader signedIn={!!viewer} />
      <main className="mx-auto w-full max-w-xl space-y-8 px-4 pt-8 pb-16">
        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight">
          Say the bug out loud. Post an issue that fits the repo.
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          GitIssue reads the repo&apos;s templates, contributing rules and code, so your report uses the app&apos;s
          real screen names. If the bug is already filed, your findings go on that issue instead.
        </p>
        {error === "auth" && (
          <p className="rounded-xl bg-warn-bg p-4 text-warn-ink">GitHub sign-in didn&apos;t finish. Try again.</p>
        )}
        {viewer ? <RepoPicker /> : <SignIn />}
      </main>
    </>
  );
}
