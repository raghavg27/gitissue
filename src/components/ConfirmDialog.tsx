"use client";

import { useEffect, useId, useRef } from "react";

// A native modal: the browser traps focus, closes it on Esc and makes the page behind it inert.
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-body`}
      className="m-auto w-[min(24rem,calc(100%-2.5rem))] rounded-3xl border border-line bg-paper p-6 text-ink backdrop:bg-black/70"
    >
      <h2 id={`${id}-title`} className="text-xl font-medium">{title}</h2>
      <p id={`${id}-body`} className="mt-2 text-muted">{body}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button autoFocus onClick={onCancel} className="glass h-11 rounded-full px-5 font-medium transition-colors hover:border-white/40">
          Keep editing
        </button>
        <button onClick={onConfirm} className="h-11 rounded-full bg-rec px-5 font-medium whitespace-nowrap text-paper">
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
