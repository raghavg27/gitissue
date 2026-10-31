"use client";

import { useEffect, useRef, useState } from "react";
import { plural } from "@/lib/format";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

export type Shot = { url: string; name: string };

// Camera roll / file picker / paste → Supabase Storage at an unguessable public path (FR-24..27).
export function ScreenshotPicker({
  shots,
  onChange,
}: {
  shots: Shot[];
  onChange: React.Dispatch<React.SetStateAction<Shot[]>>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  async function add(files: File[]) {
    setError("");
    const room = MAX_FILES - shots.length - uploading;
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length < files.length) setError("Only images can be attached.");
    const tooBig = images.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) setError("Images must be 10 MB or smaller.");
    const ok = images.filter((f) => f.size <= MAX_BYTES).slice(0, Math.max(room, 0));
    if (images.length - tooBig.length > room) setError(`You can attach up to ${plural(MAX_FILES, "screenshot")}.`);
    if (!ok.length) return;

    setUploading((n) => n + ok.length);
    const storage = createBrowserSupabase().storage.from("screenshots");
    const uploaded = await Promise.all(
      ok.map(async (file) => {
        const ext = (file.name.split(".").pop() || file.type.split("/")[1] || "png").toLowerCase();
        const path = `${crypto.randomUUID()}/${crypto.randomUUID()}.${ext}`;
        const { error } = await storage.upload(path, file, { contentType: file.type });
        if (error) return null;
        return { url: storage.getPublicUrl(path).data.publicUrl, name: file.name };
      }),
    );
    setUploading((n) => n - ok.length);
    if (uploaded.includes(null)) setError("Some screenshots didn't upload. Try them again.");
    onChange((prev) => [...prev, ...uploaded.filter((s) => s !== null)]);
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (files.length) add(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {shots.map((s) => (
          <div key={s.url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.url} alt={s.name} className="h-20 w-20 rounded-2xl border border-line object-cover" />
            <button
              type="button"
              onClick={() => onChange((prev) => prev.filter((x) => x.url !== s.url))}
              aria-label={`Remove ${s.name}`}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-pill text-sm text-pill-ink"
            >
              ×
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <div key={i} role="status" aria-busy="true" aria-label="Uploading screenshot" className="h-20 w-20 animate-pulse rounded-2xl bg-line" />
        ))}
        {shots.length + uploading < MAX_FILES && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="h-20 rounded-2xl border border-dashed border-white/25 px-5 text-sm text-muted transition-colors hover:border-white/50 hover:text-ink"
          >
            Add screenshot
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {error && <p className="text-sm text-rec">{error}</p>}
    </div>
  );
}
