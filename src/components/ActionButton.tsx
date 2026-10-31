import { Spinner } from "./Spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; busyLabel?: string };

// A button that starts a server call: while busy it shows a spinner and a new label, and a second click does nothing.
export function ActionButton({ busy = false, busyLabel, disabled, children, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap ${className}`}
    >
      {busy && <Spinner />}
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
