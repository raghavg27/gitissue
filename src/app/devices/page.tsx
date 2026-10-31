import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { DeviceList } from "@/components/DeviceList";
import { getDevices } from "@/lib/data";
import { getViewer } from "@/lib/github/client";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Devices",
  description: "The phones and browsers you test on, saved for your reports.",
  path: "/devices",
  noindex: true,
});

export default async function Devices() {
  const viewer = await getViewer();
  if (!viewer) redirect("/");
  const devices = await getDevices(viewer.userId);

  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Devices</h1>
          <p className="text-muted">Save the phones and browsers you test on, then pick one per report instead of dictating it.</p>
        </div>
        <DeviceList devices={devices} />
      </main>
    </>
  );
}
