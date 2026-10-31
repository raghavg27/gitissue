import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">My reports</h1>
        <SkeletonRows label="Loading reports" />
      </main>
    </>
  );
}
