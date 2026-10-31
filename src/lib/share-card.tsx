import { ImageResponse } from "next/og";

export const CARD_SIZE = { width: 1200, height: 630 };

// The 1200 x 630 share card: the GitIssue mark, a title and one line, over soft ink colors.
export function shareCard({ title, line }: { title: string; line: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f7efe8",
          backgroundColor: "#0c0705",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(255,177,92,0.38), transparent 45%), radial-gradient(circle at 15% 90%, rgba(255,95,70,0.34), transparent 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9.5" stroke="#f7efe8" />
            <path d="M6.5 12c1.3 0 1.3-3 2.75-3S10.6 15 12 15s1.3-6 2.75-6S16.2 12 17.5 12" stroke="#ffb15c" />
          </svg>
          GitIssue
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 36, color: "#cdbfb3", maxWidth: 960 }}>{line}</div>
        </div>
      </div>
    ),
    CARD_SIZE,
  );
}
