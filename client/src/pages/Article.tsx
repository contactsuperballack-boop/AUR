import { ArrowUpRight } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { Link } from "wouter";
import { PageShell } from "@/components/SiteChrome";
import { Seo } from "@/components/page/Seo";
import { VideoEmbed } from "@/components/page/VideoEmbed";
import { getInsightBySlug, resolveMediaUrl } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function ArticlePage({ id }: { id: string }) {
  const state = useCmsResource(() => getInsightBySlug(id), [id]);
  const title = state.status === "success" ? state.data.title : "Insight";
  const excerpt = state.status === "success" ? state.data.excerpt : "AJIYA Urban Rise perspective.";
  return <PageShell><Seo title={title} description={excerpt} type="article" image={state.status === "success" ? resolveMediaUrl(state.data.coverImage?.url) : undefined} article={state.status === "success" ? { publishedTime: state.data.publishDate, author: state.data.author } : undefined} /><CmsState state={state} notFoundLabel="Article not found" notFoundMessage="We couldn't find this article. It may have been unpublished — see our full list of insights.">{(article) => <><section className="article-hero"><div className="container"><span className="eyebrow text-canopy">{article.category}{article.readTime ? ` · ${article.readTime}` : ""}</span><h1>{article.title}</h1><p>{article.excerpt}</p></div></section><article className="section-pad bg-limestone"><div className="container grid gap-12 lg:grid-cols-[0.65fr_1.1fr] lg:gap-24"><div className="vertical-label">AJIYA / INSIGHTS</div><div className="prose-ajiya"><VideoEmbed url={article.videoUrl} title={article.title} />{article.body.split("\n\n").map((paragraph, index) => <p className={index === 0 ? "lead" : undefined} key={index}>{paragraph}</p>)}<Link href="/contact" className="button button--dark mt-6">Talk to AJIYA <ArrowUpRight size={16} /></Link></div></div></article></>}</CmsState></PageShell>;
}

export default ArticlePage;
