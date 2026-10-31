"use client";

import "./globals.css";

// Replaces the root layout when it fails, so it brings its own html and body and stays simple.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-6 px-5 text-center font-sans">
        <h1 className="text-3xl font-medium tracking-tight">Something went wrong</h1>
        <p className="max-w-sm text-muted">GitIssue could not load. Check your internet and try again.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => retry()} className="pill h-12 px-6">Try again</button>
          {/* A full page load, because the app router may be the part that failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="glass inline-flex h-12 items-center rounded-full px-6 font-medium">Go to the home page</a>
        </div>
      </body>
    </html>
  );
}
