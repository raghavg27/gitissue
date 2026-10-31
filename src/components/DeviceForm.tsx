"use client";

import { useState } from "react";
import { saveDevice } from "@/lib/devices/actions";
import type { DeviceProfile } from "@/lib/types";
import { LIMITS, PLATFORMS, validateDevice, type DeviceErrors } from "@/lib/validation";
import { ActionButton } from "./ActionButton";

const input = "glass h-11 w-full rounded-full px-4 aria-[invalid=true]:border-rec";
const labelText = "mb-1 block text-sm text-muted";

const sameDevice = (a: DeviceProfile, b: { device_model: string; platform: string; os_version: string }) =>
  a.device_model.toLowerCase() === b.device_model.toLowerCase() &&
  a.platform === b.platform &&
  a.os_version.toLowerCase() === b.os_version.toLowerCase();

export function DeviceForm({
  devices,
  onSaved,
  onCancel,
  onUseExisting,
}: {
  devices: DeviceProfile[];
  onSaved: (d: DeviceProfile) => void;
  onCancel?: () => void;
  onUseExisting?: (d: DeviceProfile) => void;
}) {
  const [form, setForm] = useState({ device_model: "", platform: "Android", os_version: "", app_version: "" });
  const [errors, setErrors] = useState<DeviceErrors>({});
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<DeviceProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors({ ...errors, [k]: undefined });
    setExisting(null);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const checked = validateDevice(form);
    if (!checked.ok) return setErrors(checked.errors);
    const match = devices.find((d) => sameDevice(d, checked.value));
    if (match) return setExisting(match);
    setSaving(true);
    const result = await saveDevice(form).catch(() => ({ error: "Could not reach GitIssue. Check your internet and try again." }));
    setSaving(false);
    if ("errors" in result) return setErrors(result.errors);
    if ("error" in result) return setError(result.error);
    onSaved(result.device);
  }

  // Each field gets its own id, label and error message.
  const field = (k: keyof DeviceErrors) => ({
    id: `device-${k}`,
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `device-${k}-error` : undefined,
  });
  const fieldError = (k: keyof DeviceErrors) =>
    errors[k] && <p id={`device-${k}-error`} className="mt-1 text-sm text-rec">{errors[k]}</p>;

  return (
    <form onSubmit={save} noValidate className="glass space-y-3 rounded-3xl p-5">
      <div>
        <label htmlFor="device-device_model" className={labelText}>Device</label>
        <input {...field("device_model")} required maxLength={LIMITS.device_model.max} placeholder="For example, Pixel 7" value={form.device_model} onChange={set("device_model")} className={input} />
        {fieldError("device_model")}
      </div>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="device-platform" className={labelText}>Platform</label>
          <select {...field("platform")} value={form.platform} onChange={set("platform")} className={input}>
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {fieldError("platform")}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="device-os_version" className={labelText}>OS version</label>
          <input {...field("os_version")} required maxLength={LIMITS.os_version.max} placeholder="For example, 15" value={form.os_version} onChange={set("os_version")} className={input} />
          {fieldError("os_version")}
        </div>
      </div>
      <div>
        <label htmlFor="device-app_version" className={labelText}>App version (optional)</label>
        <input {...field("app_version")} maxLength={LIMITS.appVersion.max} value={form.app_version} onChange={set("app_version")} className={input} />
        {fieldError("app_version")}
      </div>
      {existing && (
        <div role="status" className="rounded-2xl bg-warn-bg p-4 text-warn-ink">
          <p>You already saved this device: {existing.label}.</p>
          {onUseExisting && (
            <button type="button" onClick={() => onUseExisting(existing)} className="mt-2 font-medium underline underline-offset-4">
              Use this device
            </button>
          )}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-rec">{error}</p>}
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
