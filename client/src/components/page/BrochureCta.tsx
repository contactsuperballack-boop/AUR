import { ArrowUpRight } from "lucide-react";
import { assets } from "@/data/site";

export function BrochureCta({ compact = false }: { compact?: boolean }) {
  return <a href={assets.brochure} download="ajiya-urban-rise-brochure.pdf" className={`brochure-cta ${compact ? "brochure-cta--compact" : ""}`}><span className="brochure-cta-mark">↓</span><span><small>Download the brochure</small><strong>AJIYA Urban Rise / Phase 1</strong></span><ArrowUpRight size={16} /></a>;
}
