"use server";

import { updateTag } from "next/cache";
import { devicesTag } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { DeviceProfile } from "@/lib/types";
import { validateDevice, type DeviceErrors, type DeviceInput } from "@/lib/validation";

export type SaveDeviceResult = { device: DeviceProfile } | { errors: DeviceErrors } | { error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Device writes run on the server with the user's own session, so row-level security still applies.
export async function saveDevice(input: DeviceInput): Promise<SaveDeviceResult> {
  const checked = validateDevice(input);
  if (!checked.ok) return { errors: checked.errors };
  const supabase = await createClient();
  const { data, error } = await supabase.from("device_profiles").insert(checked.value).select().single();
  if (error) return { error: "Could not save the device. Check your connection and try again." };
  updateTag(devicesTag(data.user_id));
  return { device: data };
}

export async function deleteDevice(id: string): Promise<{ ok: boolean }> {
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  const { error, count } = await supabase.from("device_profiles").delete({ count: "exact" }).eq("id", id);
  if (!error && count === 1) updateTag(devicesTag(data.user.id));
  return { ok: !error && count === 1 };
}
