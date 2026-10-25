import { type Project } from "@/lib/cms-client";

/** "Construction" reads as a fairly technical/internal term — shown to visitors as "In Progress" instead, matching how the business actually talks about active projects. Other statuses pass through unchanged. */
export function projectStatusLabel(status: Project["status"]) {
  return status === "Construction" ? "In Progress" : status;
}
