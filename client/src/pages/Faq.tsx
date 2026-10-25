import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { Seo } from "@/components/page/Seo";
import { faqs } from "@/data/site";

export function FaqPage() {
  return <PageShell><Seo jsonLd={[{ id: "ld-faq", data: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) } }]} title="Frequently Asked Questions" description="Answers to common questions about buying, selling, and working with AJIYA Urban Rise." /><PageHero eyebrow="FAQ" title={<>Questions, answered<br /><em>plainly.</em></>} copy="If what you're looking for isn't here, our team is one conversation away." /><section className="section-pad bg-limestone"><div className="container max-w-3xl"><div className="faq-list">{faqs.map((item) => <details className="faq-item" key={item.question}><summary>{item.question}<ArrowUpRight className="faq-icon" size={18} /></summary><p>{item.answer}</p></details>)}</div><div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-charcoal/15 pt-8"><div><p className="eyebrow">Still have a question?</p><p className="mt-2 text-sm text-charcoal/65">Reach us Mon–Fri, 09:00–17:00, or Sat 09:00–15:00.</p></div><Link href="/contact" className="button button--dark">Talk to the team <ArrowUpRight size={16} /></Link></div></div></section></PageShell>;
}

export default FaqPage;
