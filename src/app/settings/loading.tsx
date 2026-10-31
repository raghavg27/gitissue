import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { SkeletonBlock, SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Devices</h1>
          <p className="text-muted">Save the phones and browsers you test on, then pick one per report instead of dictating it.</p>
        </div>
        <div className="space-y-4">
          <SkeletonRows label="Loading devices" rows={2} />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </main>
    </>
  );
}
