import { areasCovered } from "@/data/site";

/**
 * A slow, scroll-linked horizontal band of the areas AJIYA works in. Two rows drift in opposite
 * directions as the page scrolls (see data-marquee in hooks/usePageMotion.ts). The text appears
 * once for assistive tech; the visual repeats are aria-hidden.
 */
export function AreaMarquee({ tone = "light" }: { tone?: "light" | "dark" }) {
  const row = (reverse: boolean, hidden: boolean) => {
    const items = reverse ? [...areasCovered].reverse() : areasCovered;
    return (
      <div className="marquee-row" data-marquee={reverse ? "1" : "-1"} aria-hidden={hidden || undefined}>
        <div className="marquee-track">
          {[0, 1, 2].map((copy) => (
            <div className="marquee-set" key={copy} aria-hidden={copy > 0 || undefined}>
              {items.map((area) => <span key={area}>{area}<i aria-hidden="true" /></span>)}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <section className={`area-marquee area-marquee--${tone}`} aria-label="Areas AJIYA is active in">
      {row(false, false)}
      {row(true, true)}
    </section>
  );
}
