
/**
 * Converts a YouTube/Vimeo share link into a privacy-friendly embed URL. Only these two
 * hosts are ever embedded (also enforced by the server CSP's frame-src) — any other URL
 * returns null and simply renders no player, rather than iframing arbitrary content.
 */
export function toEmbedUrl(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") return url.toString();
  } catch {
    return null;
  }
  return null;
}
