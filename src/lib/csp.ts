// The Content Security Policy for each page. Scripts run only with this request's nonce, or when
// a nonced script loads them ('strict-dynamic'). React needs 'unsafe-eval' in development only.
export function buildCsp({ nonce, dev, supabaseUrl, appUrl }: { nonce: string; dev: boolean; supabaseUrl: string; appUrl: string }): string {
  const supabase = new URL(supabaseUrl).origin;
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // React sets style attributes, which a nonce cannot cover.
    "style-src 'self' 'unsafe-inline'",
    // Screenshots come only from this site's own storage bucket.
    `img-src 'self' data: blob: ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' ${supabase}`,
    // canvas-confetti draws in a worker made from a blob URL.
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    // Sign-in posts here, then redirects through Supabase and GitHub back to the app's callback URL.
    // Chrome checks each of these redirects, and the callback URL can differ from this page's origin.
    `form-action 'self' ${new URL(appUrl).origin} ${supabase} https://github.com`,
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
