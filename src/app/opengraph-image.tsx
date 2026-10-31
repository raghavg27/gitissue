import { CARD_SIZE, shareCard } from "@/lib/share-card";

export const alt = "GitIssue: say the bug out loud and get a GitHub issue that fits the repo.";
export const size = CARD_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({ title: "Say the bug out loud", line: "Get a GitHub issue that follows the repo's template and uses its real screen names." });
}
