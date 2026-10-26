import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { AreaMarquee } from "@/components/page/AreaMarquee";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { Seo } from "@/components/page/Seo";
import { ServiceDetailList } from "@/components/page/ServiceDetailList";

export function ServicesPage() {
  return <PageShell><Seo title="Our Services" description="Explore AJIYA Urban Rise’s real-estate development, sales, investment, management, and construction services." /><PageHero eyebrow="Our services" title={<>One connected view<br /><em>of real estate.</em></>} copy="Development, sales, investment, management, and construction — brought together to make the next step clearer." /><AreaMarquee tone="light" /><section className="section-pad bg-limestone"><div className="container"><ServiceDetailList /></div></section><section className="section-pad section-pad--tight bg-canopy text-limestone"><div className="container flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="eyebrow text-limestone/60">Need a sounding board?</p><h2 className="display-title mt-4">Bring us the<br /><em>opportunity.</em></h2></div><Link href="/contact" className="button button--cream">Talk to our team <ArrowUpRight size={16} /></Link></div></section></PageShell>;
}

export default ServicesPage;
