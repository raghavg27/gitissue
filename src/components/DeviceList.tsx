"use client";

import { useState } from "react";
import { deleteDevice } from "@/lib/devices/actions";
import type { DeviceProfile } from "@/lib/types";
import { DeviceForm } from "./DeviceForm";
import { EmptyState } from "./EmptyState";

export function DeviceList({ devices: initial }: { devices: DeviceProfile[] }) {
  const [devices, setDevices] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Removes the row at once; if the server says no, the row comes back in the same place.
  async function remove(device: DeviceProfile) {
    setError("");
    const index = devices.indexOf(device);
    setDevices((list) => list.filter((d) => d.id !== device.id));
    const { ok } = await deleteDevice(device.id!).catch(() => ({ ok: false }));
    if (!ok) {
      setDevices((list) => [...list.slice(0, index), device, ...list.slice(index)]);
      setError(`Could not delete ${device.device_model}. Check your connection and try again.`);
    }
  }

  return (
    <div className="space-y-4">
      {devices.length > 0 && (
        <ul className="glass divide-y divide-line overflow-hidden rounded-3xl">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{d.device_model}</p>
                <p className="text-sm text-muted">
                  {d.platform} {d.os_version}
                  {d.app_version && `, app ${d.app_version}`}
                </p>
              </div>
              <button onClick={() => remove(d)} className="text-sm text-rec">Delete</button>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="text-sm text-rec">{error}</p>}
      {devices.length === 0 && !adding ? (
        <EmptyState
          drawing="devices"
          line="Save a phone or browser once, then pick it for each report."
          action={<button onClick={() => setAdding(true)} className="pill h-12 px-6">Add a device</button>}
        />
      ) : adding ? (
        <DeviceForm devices={devices} onSaved={(d) => { setDevices([...devices, d]); setAdding(false); }} onCancel={() => setAdding(false)} />
      ) : (
        <button onClick={() => setAdding(true)} className="h-12 w-full rounded-full border border-dashed border-white/25 px-5 font-medium text-muted transition-colors hover:border-white/50 hover:text-ink">
          Add a device
        </button>
      )}
    </div>
  );
}
