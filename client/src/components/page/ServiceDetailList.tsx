import { ArrowUpRight } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { Link } from "wouter";
import { useServicesList } from "@/components/page/useServicesList";

export function ServiceDetailList() {
  const state = useServicesList();
  return <div className="service-detail-list"><CmsState state={state} emptyMessage="Our services are being updated. Get in touch to learn more.">{(list) => list.map((service) => <Link href={`/services/${service.slug}`} className="service-detail-row" key={service.documentId}><span className="service-index">{service.index}</span><div><h2>{service.title}</h2><p>{service.shortDescription}</p></div><span className="service-detail-arrow"><ArrowUpRight size={20} /></span></Link>)}</CmsState></div>;
}
