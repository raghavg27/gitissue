// The screen that the Back link opens from each report screen, or null where there is no way back.
// The review screen goes back only when there are matches to show.
export function backTarget(stage: string, hasMatches: boolean): "describe" | "duplicates" | null {
  if (stage === "duplicates") return "describe";
  if (stage === "choose" || stage === "comment") return "duplicates";
  return stage === "review" && hasMatches ? "duplicates" : null;
}
