import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { SkeletonBlock, SkeletonSection } from "@/components/Skeleton";

// The shape of the "What went wrong?" step of the report screen.
export default function Loading() {
  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl px-5 pt-6">
        <SkeletonSection label="Loading the report form" className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-8 w-2/3" />
            <SkeletonBlock className="h-6 w-16" />
          </div>
          <SkeletonBlock className="h-5 w-40" />
          <div className="flex items-start gap-3">
            <div className="h-56 flex-1 animate-pulse rounded-3xl bg-white/10" />
            <SkeletonBlock className="h-14 w-14" />
          </div>
          <SkeletonBlock className="h-11 w-full" />
          <div className="h-20 w-36 animate-pulse rounded-2xl bg-white/10" />
        </SkeletonSection>
      </main>
    </>
  );
}
