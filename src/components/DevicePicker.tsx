"use client";

import { useEffect, useState } from "react";
import type { DeviceProfile } from "@/lib/types";
import { DeviceForm } from "./DeviceForm";

const KEY = "gitissue:device";

// Pick the device under test once per session; the choice is remembered on this browser (FR-17).
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
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && initial.some((d) => d.id === saved)) onChange(saved);
    } catch {}
  }, [initial, onChange]);

  function select(id: string) {
    onChange(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  }

  if (adding) {
    return (
      <DeviceForm
        devices={devices}
        onCancel={() => setAdding(false)}
        onUseExisting={(d) => {
          select(d.id!);
          setAdding(false);
        }}
        onSaved={(d) => {
          setDevices([...devices, d]);
          select(d.id!);
          setAdding(false);
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="device" className="sr-only">Device</label>
      <select
        id="device"
        value={value}
        onChange={(e) => (e.target.value === "__add" ? setAdding(true) : select(e.target.value))}
        className="glass h-11 min-w-0 flex-1 rounded-full px-4"
      >
        <option value="">No device profile</option>
        {devices.map((d) => (
          <option key={d.id} value={d.id}>{d.label}</option>
        ))}
        <option value="__add">Add a device…</option>
      </select>
    </div>
  );
}
