import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/SiteChrome";
import { Seo } from "@/components/page/Seo";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  return <PageShell><Seo title={kind === "privacy" ? "Privacy Policy" : "Terms and Conditions"} description="AJIYA Urban Rise website information." /><section className="article-hero article-hero--short"><div className="container"><span className="eyebrow text-canopy">AJIYA Urban Rise</span><h1>{kind === "privacy" ? "Privacy policy" : "Terms and conditions"}</h1><p>Information about using the AJIYA Urban Rise website.</p></div></section><article className="section-pad bg-limestone"><div className="container max-w-3xl"><div className="prose-ajiya"><p className="lead">This page is a placeholder for the formal {kind === "privacy" ? "privacy policy" : "terms and conditions"} that will govern the website when the final legal copy is approved.</p><h2>In the meantime</h2><p>Please contact AJIYA Urban Rise directly with any questions about this website, the information presented here, or how an enquiry is handled.</p><Link href="/contact" className="button button--dark mt-6">Contact AJIYA <ArrowUpRight size={16} /></Link></div></div></article></PageShell>;
}

export default LegalPage;
