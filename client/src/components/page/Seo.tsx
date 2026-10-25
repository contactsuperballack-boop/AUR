import { useEffect } from "react";
import { useLocation } from "wouter";
import { applyHead, buildHead, type SeoInput } from "@/lib/seo";
import { collectHead } from "@/lib/head-collector";

export type SeoProps = Omit<SeoInput, "path">;

/**
 * Per-page title, meta description, Open Graph/Twitter tags, canonical URL and JSON-LD.
 *
 * Two paths from one builder (lib/seo.ts):
 *  - Prerender (server): the head is collected during render and written into each page's
 *    static HTML, so crawlers and link-preview bots (WhatsApp, LinkedIn, Facebook, X) see the
 *    correct per-page tags without running JavaScript.
 *  - Browser: after hydration/navigation the same data is applied to document.head.
 */
export function Seo(props: SeoProps) {
  const [path] = useLocation();
  const head = buildHead({ ...props, path });

  if (typeof window === "undefined") collectHead(head);

  const dependency = JSON.stringify(head);
  useEffect(() => {
    applyHead(head);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);

  return null;
}
