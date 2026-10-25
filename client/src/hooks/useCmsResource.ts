import { useMemo } from "react";
import { CmsNotFoundError } from "@/lib/cms-client";

export type CmsQueryState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "not-found" }
  | { status: "empty" }
  | { status: "success"; data: T };

/**
 * Resolves `fetcher` synchronously against the build-time content snapshot (see
 * lib/cms-client.ts) and reduces the result to success / empty / not-found / error. It is
 * synchronous on purpose: that is what lets the prerender step emit real content into the
 * HTML instead of a loading spinner. The "loading" member of CmsQueryState is kept only so
 * CmsState's rendering contract stays unchanged; this hook never returns it.
 *
 * Usage:
 *   const state = useCmsResource(() => getProjects(), []);
 *   const projectState = useCmsResource(() => getProjectBySlug(slug), [slug]);
 */
export function useCmsResource<T>(fetcher: () => T, deps: React.DependencyList): CmsQueryState<T> {
  return useMemo<CmsQueryState<T>>(() => {
    try {
      const data = fetcher();
      if (Array.isArray(data) && data.length === 0) return { status: "empty" };
      return { status: "success", data };
    } catch (err) {
      if (err instanceof CmsNotFoundError) return { status: "not-found" };
      // eslint-disable-next-line no-console
      console.error("Content lookup failed:", err);
      return { status: "error", error: "This content couldn't be loaded. Please try again shortly." };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
