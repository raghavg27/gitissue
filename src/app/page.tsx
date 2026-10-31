import { Hero } from "@/components/Hero";
import { RepoPicker } from "@/components/RepoPicker";
import { getViewer } from "@/lib/github/client";

export default async function Home({ searchParams }: PageProps<"/">) {
  const viewer = await getViewer();
  const { error } = await searchParams;

  return (
    <Hero
      signedIn={!!viewer}
      badge="For testers on any GitHub repo"
      title="Say the bug out loud"
      sub="GitIssue turns what you say into an issue that follows the repo's template and uses the app's real screen names. If the bug is already reported, your findings go on that issue."
    >
      {error === "auth" && (
        <p className="mb-4 rounded-2xl bg-warn-bg px-5 py-3 text-warn-ink">GitHub sign-in did not finish. Try again.</p>
      )}
      <RepoPicker />
      {!viewer && (
        <p className="mt-6 text-sm text-muted">No account is needed to start. You sign in with GitHub when you are ready to draft.</p>
      )}
    </Hero>
  );
}
