import { ArrowUpRight } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { Link } from "wouter";
import { mergeRefs } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useServicesList } from "@/components/page/useServicesList";
import { useSpotlightGroup } from "@/hooks/useSpotlight";

export function ServiceRowList() {
  const state = useServicesList();
  const listRef = useScrollReveal<HTMLDivElement>(".service-row", [state.status]);
  const spotlightRef = useSpotlightGroup<HTMLDivElement>(".service-row", [state.status]);
  return <div className="service-list mt-14" ref={mergeRefs(listRef, spotlightRef)}><CmsState state={state} emptyMessage="Our service pages are being updated. Get in touch to learn more.">{(list) => list.map((service) => <Link href={`/services/${service.slug}`} key={service.documentId} className="service-row group"><span className="service-index">{service.index}</span><span className="service-name">{service.title}</span><span className="service-cue">{service.cue}</span><ArrowUpRight className="service-icon" size={20} /></Link>)}</CmsState></div>;
}
