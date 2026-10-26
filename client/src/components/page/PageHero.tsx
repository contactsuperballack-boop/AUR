import { assets } from "@/data/site";

/**
 * Page header. With an `image` it is a photographic hero; without one it is a quiet, typographic
 * hero (deep green, faint architectural grid) so inner pages don't all repeat the home-page photo.
 */
export function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: React.ReactNode; copy: string; image?: string }) {
  const quiet = !image;
  const isBrandHero = image === assets.hero;
  const imageClass = isBrandHero ? "brand-hero-bg" : quiet ? "page-hero-image--quiet" : "";
  return <section className={`page-hero ${quiet ? "page-hero--quiet" : ""}`}><div className={`page-hero-image ${imageClass}`} style={quiet || isBrandHero ? undefined : { backgroundImage: `url(${image})` }} /><div className="page-hero-overlay" /><div className={`container relative z-10 flex items-end pb-14 pt-40 md:pb-20 ${quiet ? "min-h-[420px] md:min-h-[480px]" : "min-h-[480px] md:min-h-[560px]"}`}><div className="max-w-3xl"><p className="eyebrow text-limestone/70">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="page-hero-copy">{copy}</p></div></div></section>;
}
