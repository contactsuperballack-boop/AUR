import { ArrowUpRight } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { Link } from "wouter";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { SectionHeading } from "@/components/page/SectionHeading";
import { Seo } from "@/components/page/Seo";
import { assets } from "@/data/site";
import { getServiceBySlug } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function ServiceDetailPage({ slug }: { slug: string }) {
  const state = useCmsResource(() => getServiceBySlug(slug), [slug]);
  const title = state.status === "success" ? state.data.title : "Service";
  const introText = state.status === "success" ? state.data.intro : "AJIYA Urban Rise service.";
  const heroImage = slug === "sales" || slug === "investment" ? assets.opportunity : assets.signature;
  return <PageShell context={title !== "Service" ? title : undefined}><Seo title={title} description={introText} image={heroImage} /><CmsState state={state} notFoundLabel="Service not found" notFoundMessage="We couldn't find this service. It may have been renamed — see our full services list.">{(service) => <><PageHero eyebrow="Our services" title={service.title} copy={service.intro} image={heroImage} /><section className="section-pad bg-limestone"><div className="container grid gap-14 lg:grid-cols-[0.7fr_1.2fr] lg:gap-24"><div className="vertical-label">03 / THE APPROACH</div><div><SectionHeading eyebrow="How we think about it" title={service.intro} copy={service.body} /><div className="mt-12 grid gap-3 sm:grid-cols-3">{service.points.map((point, index) => <div className="feature-tile" key={point}><span className="eyebrow text-charcoal/40">0{index + 1}</span><p>{point}</p></div>)}</div></div></div></section><section className="section-pad bg-charcoal text-limestone"><div className="container flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><p className="eyebrow text-limestone/50">Ready to talk it through?</p><h2 className="display-title mt-4">Start with a<br /><em>conversation.</em></h2></div><Link href={`/contact?interest=${encodeURIComponent(service.title)}&service=${slug}`} className="button button--cream">Talk to our team <ArrowUpRight size={16} /></Link></div></section></>}</CmsState></PageShell>;
}

export default ServiceDetailPage;
