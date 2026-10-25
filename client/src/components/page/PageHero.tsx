import { assets } from "@/data/site";

export function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: React.ReactNode; copy: string; image?: string }) {
  const isDefaultBrandHero = !image || image === assets.hero;
  return <section className="page-hero"><div className={`page-hero-image ${isDefaultBrandHero ? "brand-hero-bg" : ""}`} style={isDefaultBrandHero ? undefined : { backgroundImage: `url(${image})` }} /><div className="page-hero-overlay" /><div className="container relative z-10 flex min-h-[480px] items-end pb-14 pt-40 md:min-h-[560px] md:pb-20"><div className="max-w-3xl"><p className="eyebrow text-limestone/70">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="page-hero-copy">{copy}</p></div></div></section>;
}
