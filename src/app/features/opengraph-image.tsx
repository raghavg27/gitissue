import { CARD_SIZE, shareCard } from "@/lib/share-card";

export const alt = "GitIssue features: dictation, repo templates, real screen names and duplicate checks, each with its reason.";
export const size = CARD_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({ title: "Features", line: "Dictation, repo templates, real screen names and duplicate checks, each with its reason." });
}
