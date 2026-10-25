import { ArrowUpRight } from "lucide-react";
import { type Insight } from "@/lib/cms-client";
import { Link } from "wouter";

export function InsightsList({ insights }: { insights: Insight[] }) {
  const featured = insights.find((item) => item.featured) ?? insights[0];
  const rest = insights.filter((item) => item.documentId !== featured.documentId);
  return <><div className="insight-feature"><div><span className="eyebrow">Featured perspective · {featured.category}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><Link href={`/insights/${featured.slug}`} className="button button--dark">Read perspective <ArrowUpRight size={16} /></Link></div><div className="insight-feature-index">01</div></div><div className="mt-14 grid gap-0 border-t border-charcoal/15">{rest.map((item, index) => <Link href={`/insights/${item.slug}`} className="article-row" key={item.documentId}><span className="eyebrow">0{index + 2}</span><div><span className="eyebrow text-canopy">{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p></div><ArrowUpRight size={19} /></Link>)}</div></>;
}
