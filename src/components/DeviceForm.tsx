"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { DeviceProfile } from "@/lib/types";

const input = "w-full rounded-lg border border-line bg-card px-3 py-2";

export function DeviceForm({ onSaved, onCancel }: { onSaved: (d: DeviceProfile) => void; onCancel?: () => void }) {
  const [form, setForm] = useState({ device_model: "", platform: "Android", os_version: "", app_version: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await createBrowserSupabase()
      .from("device_profiles")
      .insert({
        label: `${form.device_model} · ${form.platform} ${form.os_version}`,
        platform: form.platform,
        os_version: form.os_version,
        device_model: form.device_model,
        app_version: form.app_version || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return setError("Couldn't save the device. Check your connection and try again.");
    onSaved(data);
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-xl border border-line bg-card p-4">
      <input required placeholder="Device, e.g. Pixel 7" value={form.device_model} onChange={set("device_model")} className={input} />
      <div className="flex gap-2">
        <select value={form.platform} onChange={set("platform")} className={input}>
          {["Android", "iOS", "iPadOS", "Web", "Windows", "macOS", "Linux"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <input required placeholder="OS version" value={form.os_version} onChange={set("os_version")} className={input} />
      </div>
      <input placeholder="App version (optional)" value={form.app_version} onChange={set("app_version")} className={input} />
      {error && <p className="text-sm text-rec">{error}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="flex-1 rounded-lg bg-ink px-4 py-2 font-bold text-paper disabled:opacity-60">
          Save device
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-muted">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
