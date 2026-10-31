import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";

// Layout for public reading pages: features, privacy and terms.
export function ContentPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <Backdrop />
      <AppHeader signedIn={false} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-2xl space-y-8 px-5 pt-6 pb-16">
        <div className="space-y-3">
          <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">{title}</h1>
          <p className="text-lg text-muted">{intro}</p>
        </div>
        {children}
      </main>
    </>
  );
}
