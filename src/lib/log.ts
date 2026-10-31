// Logs only what is needed to debug: where, the error type, a short message and an HTTP status.
// Full error objects can hold request data, tokens, emails or user text, so they are never logged.
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

export function safeError(e: unknown): { name: string; message: string; status?: number } {
  const err = e as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
  const message = typeof err?.message === "string" ? err.message : String(e);
  return {
    name: typeof err?.name === "string" ? err.name : "Error",
    message: message.replace(EMAIL, "[email]").slice(0, 200),
    status: typeof err?.status === "number" ? err.status : undefined,
  };
}

export function logError(where: string, e: unknown) {
  console.error(where, safeError(e));
}
