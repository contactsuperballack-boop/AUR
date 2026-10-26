import { ArrowUpRight, MapPin } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { ImageFrame } from "@/components/page/ImageFrame";
import { Link } from "wouter";
import { LocationsCoverage } from "@/components/page/LocationsCoverage";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { type Property, getProperties, resolveMediaUrl } from "@/lib/cms-client";
import { Seo } from "@/components/page/Seo";
import { filterProperties } from "@/lib/format";
import { useCmsResource } from "@/hooks/useCmsResource";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState } from "react";

export function PropertiesPage() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [maxBudget, setMaxBudget] = useState(100);
  const state = useCmsResource(() => getProperties(), []);
  // Reveals on first load only — deliberately not re-triggered on every filter keystroke/click,
  // since re-running a scroll reveal each time the filtered subset changes would need each
  // filter action to also replay an entrance animation, which reads as flickery rather than
  // premium. Filtering swaps the underlying cards in at normal opacity (no animation) instead
  // of a broken/invisible state.
  const gridRef = useScrollReveal<HTMLDivElement>(".property-card", [state.status]);

  const filterList = (list: Property[]) => filterProperties(list, { category: active, query, maxBudget });

  return <PageShell><Seo title="Curated Properties" description="Explore curated land, residential, and commercial property opportunities from AJIYA Urban Rise." /><PageHero eyebrow="Properties" title={<>Curated opportunity,<br /><em>not endless inventory.</em></>} copy="A focused view of property conversations across land, residential, and commercial opportunity in Abuja." /><section className="section-pad bg-limestone"><div className="container"><div className="property-search-panel"><div><span className="eyebrow text-canopy">Search the opportunity</span><h2>Find a conversation that fits.</h2></div><label className="property-search-input"><span className="sr-only">Search by feature or location</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by feature, location, or opportunity" /></label><div className="price-slider"><div className="price-slider-header"><span className="eyebrow">Price range</span><strong>{maxBudget === 100 ? "Any budget" : `Up to ₦${maxBudget}m`}</strong></div><input aria-label="Maximum indicative budget" type="range" min="5" max="100" step="5" value={maxBudget} onChange={(event) => setMaxBudget(Number(event.target.value))} /><div className="price-slider-scale"><span>₦5m</span><span>₦100m+</span></div></div><div className="filter-row"><span className="eyebrow">Browse by type</span><div className="flex flex-wrap gap-2">{["All", "Land", "Residential", "Commercial", "Investment"].map((item) => <button key={item} className={`filter-button ${active === item ? "is-active" : ""}`} onClick={() => setActive(item)}>{item}</button>)}</div></div></div><CmsState state={state} emptyMessage="New listings are being prepared. Get in touch to hear about what's coming next.">{(list) => {
    const filtered = filterList(list);
    return <><div className="property-grid mt-12" ref={gridRef}>{filtered.map((item) => <Link href={`/properties/${item.slug}`} className="property-card" key={item.documentId}><ImageFrame src={resolveMediaUrl(item.image?.url) || undefined} alt={item.image?.alternativeText || item.name} className="property-card-image" /><div className="p-6 md:p-7"><div className="flex items-center justify-between"><span className="eyebrow text-canopy">{item.category}</span><span className="eyebrow text-charcoal/40">From ₦{item.priceGuide}m*</span></div><h2 className="mt-7 font-display text-3xl">{item.name}</h2><p className="mt-3 text-sm leading-6 text-charcoal/65">{item.description}</p><div className="property-feature-list">{item.features.map((feature) => <span key={feature}>{feature}</span>)}</div><div className="mt-6 flex items-center gap-2 text-xs text-charcoal/50"><MapPin size={14} />{item.location}</div><span className="arrow-link">View details <ArrowUpRight size={16} /></span></div></Link>)}</div><p className="property-disclaimer">*Indicative starting bands for discovery only. Confirm current availability and terms with the AJIYA team.</p>{filtered.length === 0 && <div className="property-empty"><span className="eyebrow">No exact match yet</span><p>Try another feature or start a direct conversation with the AJIYA team.</p><Link href="/contact" className="button button--dark mt-5">Talk to the team <ArrowUpRight size={16} /></Link></div>}<LocationsCoverage /></>;
  }}</CmsState></div></section></PageShell>;
}

export default PropertiesPage;
