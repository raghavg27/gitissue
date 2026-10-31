"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

function getRecognition(): (new () => Recognition) | undefined {
  const w = window as unknown as Record<string, new () => Recognition>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noSubscribe = () => () => {};

// In-app dictation via the Web Speech API (FR-13). Hidden where unsupported; the text box + Wispr Flow still works.
export function MicButton({ onText, size = "lg" }: { onText: (text: string) => void; size?: "lg" | "sm" }) {
  const supported = useSyncExternalStore(noSubscribe, () => !!getRecognition(), () => false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const rec = useRef<Recognition | null>(null);

  useEffect(() => () => rec.current?.stop(), []);

  function toggle() {
    if (recording) return rec.current?.stop();
    const Ctor = getRecognition()!;
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = false;
    r.lang = navigator.language || "en-US";
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim());
      }
    };
    r.onend = () => setRecording(false);
    r.onerror = (e) =>
      setError(e.error === "not-allowed" ? "The browser blocks the microphone. Allow it in the site settings, or type instead." : "");
    rec.current = r;
    setError("");
    r.start();
    setRecording(true);
  }

  if (!supported) return null;
  const dim = size === "lg" ? "h-14 w-14" : "h-10 w-10";
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={recording}
        aria-label={recording ? "Stop recording" : "Dictate"}
        className={`${dim} flex shrink-0 items-center justify-center rounded-full transition-colors ${
          recording ? "animate-pulse bg-rec text-paper" : "bg-pill text-pill-ink hover:bg-white/85"
        }`}
      >
        {recording ? (
          <span className="h-4 w-4 rounded-sm bg-paper" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" />
          </svg>
        )}
      </button>
      {/* Always in the page, so screen readers announce the change. */}
      <span role="status" className="text-xs font-medium text-rec">{recording ? "Listening" : ""}</span>
      {error && <span role="alert" className="text-xs text-rec">{error}</span>}
    </div>
  );
}
