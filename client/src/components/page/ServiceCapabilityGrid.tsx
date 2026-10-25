import { ArrowUpRight } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { Link } from "wouter";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useServicesList } from "@/components/page/useServicesList";

export function ServiceCapabilityGrid() {
  const state = useServicesList();
  const gridRef = useScrollReveal<HTMLDivElement>("a", [state.status]);
  return <div className="mt-12 grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-5" ref={gridRef}><CmsState state={state} emptyMessage="Our services are being updated.">{(list) => list.map((service) => <Link href={`/services/${service.slug}`} className="bg-stone p-6 transition-colors hover:bg-limestone" key={service.documentId}><span className="eyebrow text-charcoal/40">{service.index}</span><h3 className="mt-14 font-display text-xl leading-tight">{service.title}</h3><ArrowUpRight className="mt-8 text-canopy" size={18} /></Link>)}</CmsState></div>;
}
