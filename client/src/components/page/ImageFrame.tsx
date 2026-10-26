
/**
 * Framed image. `parallax` lets the picture drift slightly inside its frame as the page
 * scrolls (driven by lib/page-motion.ts via the data attributes below); the frame itself
 * never moves, so layout is unaffected and reduced-motion users simply get a still image.
 */
export function ImageFrame({ src, alt, className = "", eager = false, parallax = false }: { src?: string; alt: string; className?: string; eager?: boolean; parallax?: boolean }) {
  if (!src) return <div className={`image-frame image-frame--empty ${className}`} role="img" aria-label={alt} />;
  return <div className={`image-frame ${className}`}><img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" {...(parallax ? { "data-parallax-in": "" } : {})} /></div>;
}
