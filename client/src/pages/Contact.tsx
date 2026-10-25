import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/page/ContactForm";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { useSearch } from "wouter";
import { SectionHeading } from "@/components/page/SectionHeading";
import { Seo } from "@/components/page/Seo";
import { assets, officeHours } from "@/data/site";

export function ContactPage() {
  const params = new URLSearchParams(useSearch());
  const interestLabel = params.get("interest") ?? undefined;
  const projectSlug = params.get("project") ?? undefined;
  const propertySlug = params.get("property") ?? undefined;
  const serviceSlug = params.get("service") ?? undefined;
  return <PageShell context={interestLabel}><Seo title="Contact AJIYA" description="Start a conversation with AJIYA Urban Rise about property, investment, projects, construction, or management." image={assets.heroFallback} /><PageHero eyebrow="Contact" title={<>Let’s make the next<br /><em>step clearer.</em></>} copy="Tell us what you are exploring. Our team is ready to listen, share context, and help you understand where the conversation can begin." image={assets.hero} /><section className="section-pad bg-limestone"><div className="container grid gap-14 lg:grid-cols-[0.7fr_1.2fr] lg:gap-24"><div><SectionHeading eyebrow="Start a conversation" title="The right question is a good place to begin." copy="Choose the route that suits you, or send a note and we’ll come back with the right person." /><div className="mt-10 flex flex-col gap-6 border-t border-charcoal/15 pt-6"><a className="contact-line" href="tel:+2349033734656"><span>Call</span><strong>+234 903 373 4656</strong><ArrowUpRight size={17} /></a><a className="contact-line" href="mailto:hello@ajiyaurbanrise.com"><span>Email</span><strong>hello@ajiyaurbanrise.com</strong><ArrowUpRight size={17} /></a><a className="contact-line" href="https://wa.me/2349033734656?text=Hello%20AJIYA%2C%20I%20would%20like%20to%20learn%20more." target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>Start a conversation</strong><ArrowUpRight size={17} /></a></div><div className="mt-12 border-t border-charcoal/15 pt-6"><p className="eyebrow">Visit our office</p><p className="mt-4 text-sm leading-6 text-charcoal/65">Suite 1021, Third Floor<br />Los Angeles Mall<br />Ahmadu Bello Way<br />Mabushi, Abuja, Nigeria</p><div className="mt-5 flex flex-col gap-1 text-sm text-charcoal/65">{officeHours.map((row) => <div key={row.days} className="flex justify-between gap-6"><span>{row.days}</span><strong className="font-medium text-charcoal/80">{row.hours}</strong></div>)}</div></div></div><ContactForm interestLabel={interestLabel} projectSlug={projectSlug} propertySlug={propertySlug} serviceSlug={serviceSlug} /></div></section></PageShell>;
}

export default ContactPage;
