import { prerender } from "react-dom/static";
import { Router } from "wouter";
import App from "./App";
import { takeHead } from "./lib/head-collector";
import { headToHtml, SITE_ORIGIN, type HeadData } from "./lib/seo";

// Re-exported so the prerender script uses the exact same <head> serializer and site origin as
// the app (sitemap/robots then always match the canonical URLs, however VITE_SITE_URL is set).
export { headToHtml, SITE_ORIGIN };

export interface RenderResult {
  html: string;
  head: HeadData | null;
}

/**
 * Renders one route to an HTML string for the prerender script. `prerender` (React 19) waits
 * for every lazy page chunk to resolve, so the output is the complete page, not a fallback.
 * Any render error fails the build rather than shipping a broken page.
 */
export async function render(url: string): Promise<RenderResult> {
  takeHead(); // clear anything left over from a previous route
  const errors: unknown[] = [];
  const { prelude } = await prerender(
    <Router ssrPath={url}>
      <App />
    </Router>,
    { onError: (error) => void errors.push(error) }
  );
  const html = await new Response(prelude).text();
  if (errors.length > 0) {
    throw new Error(`Prerender of ${url} failed: ${String((errors[0] as Error)?.stack ?? errors[0])}`);
  }
  return { html, head: takeHead() };
}
