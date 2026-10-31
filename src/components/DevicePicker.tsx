"use client";

import { useEffect, useState } from "react";
import { detectDevice, type DetectedDevice } from "@/lib/device-detect";
import type { DeviceProfile } from "@/lib/types";
import { DeviceForm } from "./DeviceForm";

const KEY = "gitissue:device";

// Detect this device first, enter one by hand second, or pick a saved one. The choice is remembered on this browser (FR-17).
export function DevicePicker({
  devices: initial,
  value,
  onChange,
}: {
  devices: DeviceProfile[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [devices, setDevices] = useState(initial);
  const [form, setForm] = useState<{ detected?: DetectedDevice } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && initial.some((d) => d.id === saved)) onChange(saved);
    } catch {}
  }, [initial, onChange]);

  function select(id: string) {
    onChange(id);
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.removeItem(KEY);
    } catch {}
  }

  if (form) {
    return (
      <DeviceForm
        devices={devices}
        initial={form.detected}
        onCancel={() => setForm(null)}
        onUseExisting={(d) => {
          select(d.id!);
          setForm(null);
        }}
        onSaved={(d) => {
          setDevices([...devices, d]);
          select(d.id!);
          setForm(null);
        }}
      />
    );
  }

  const chosen = devices.find((d) => d.id === value);
  if (chosen) {
    return (
      <div className="glass flex items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5">
        <span className="min-w-0 truncate">{chosen.label}</span>
        <button type="button" onClick={() => select("")} className="h-9 shrink-0 rounded-full px-4 text-sm text-muted transition-colors hover:text-ink">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={async () => setForm({ detected: await detectDevice() })}
          className="pill h-11 px-5"
        >
          Detect this device
        </button>
        <button type="button" onClick={() => setForm({})} className="h-11 rounded-full px-3 text-muted underline-offset-4 transition-colors hover:text-ink hover:underline">
          Enter it by hand
        </button>
      </div>
      {devices.length > 0 && (
        <div>
          <label htmlFor="device" className="sr-only">Or pick a saved device</label>
          <select id="device" value="" onChange={(e) => select(e.target.value)} className="glass h-11 w-full rounded-full px-4">
            <option value="">Or pick a saved device</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
