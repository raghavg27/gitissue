"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { DeviceProfile } from "@/lib/types";
import { ActionButton } from "./ActionButton";

const input = "glass h-11 w-full rounded-full px-4";

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
    <form onSubmit={save} className="glass space-y-3 rounded-3xl p-5">
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
        <ActionButton busy={saving} busyLabel="Saving…" className="pill h-11 flex-1 px-5">
          Save device
        </ActionButton>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full px-5 text-muted transition-colors hover:text-ink">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
