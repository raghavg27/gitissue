import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { DeviceList } from "@/components/DeviceList";
import { getViewer } from "@/lib/github/client";
import { createClient } from "@/lib/supabase/server";

export default async function Settings() {
  if (!(await getViewer())) redirect("/");
  const supabase = await createClient();
  const { data } = await supabase.from("device_profiles").select("*").order("created_at");

  return (
    <>
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl space-y-6 px-4 pt-6 pb-16">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold">Devices</h1>
          <p className="text-muted">Save the phones and browsers you test on, then pick one per report instead of dictating it.</p>
        </div>
        <DeviceList devices={data ?? []} />
      </main>
    </>
  );
}
