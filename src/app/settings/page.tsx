import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { DeviceList } from "@/components/DeviceList";
import { getViewer } from "@/lib/github/client";
import { createClient } from "@/lib/supabase/server";

export default async function Settings() {
  if (!(await getViewer())) redirect("/");
  const supabase = await createClient();
  const { data } = await supabase.from("device_profiles").select("*").order("created_at");

  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Devices</h1>
          <p className="text-muted">Save the phones and browsers you test on, then pick one per report instead of dictating it.</p>
        </div>
        <DeviceList devices={data ?? []} />
      </main>
    </>
  );
}
