import type { HeadData } from "./seo";

/**
 * Server-only scratchpad: during prerender, <Seo> pushes the head it computed here and the
 * prerender script reads it back after rendering a route. Unused in the browser.
 */
let collected: HeadData | null = null;

export function collectHead(head: HeadData): void {
  collected = head;
}

export function takeHead(): HeadData | null {
  const head = collected;
  collected = null;
  return head;
}
