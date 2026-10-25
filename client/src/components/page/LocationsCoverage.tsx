import { areasCovered } from "@/data/site";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/** Static trust/coverage signal — not tied to actual listings, just areas AJIYA is active in/around. */
export function LocationsCoverage() {
  const gridRef = useScrollReveal<HTMLDivElement>(".location-pill", []);
  return <div className="locations-coverage"><p className="eyebrow">Where we're active</p><h2 className="mt-3 font-display text-2xl">Across Abuja's growing districts.</h2><div className="location-pill-grid mt-8" ref={gridRef}>{areasCovered.map((area) => <span className="location-pill" key={area}>{area}</span>)}</div></div>;
}
