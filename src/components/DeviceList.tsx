"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { DeviceProfile } from "@/lib/types";
import { DeviceForm } from "./DeviceForm";

export function DeviceList({ devices: initial }: { devices: DeviceProfile[] }) {
  const [devices, setDevices] = useState(initial);
  const [adding, setAdding] = useState(initial.length === 0);

  async function remove(id: string) {
    const { error } = await createBrowserSupabase().from("device_profiles").delete().eq("id", id);
    if (!error) setDevices(devices.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      {devices.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-bold">{d.device_model}</p>
                <p className="text-sm text-muted">
                  {d.platform} {d.os_version}
                  {d.app_version && `, app ${d.app_version}`}
                </p>
              </div>
              <button onClick={() => remove(d.id!)} className="text-sm text-rec">Delete</button>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <DeviceForm onSaved={(d) => { setDevices([...devices, d]); setAdding(false); }} onCancel={() => setAdding(false)} />
      ) : (
        <button onClick={() => setAdding(true)} className="w-full rounded-xl border border-dashed border-line px-4 py-3 font-bold">
          Add a device
        </button>
      )}
    </div>
  );
}
