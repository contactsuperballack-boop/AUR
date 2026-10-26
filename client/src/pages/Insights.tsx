import { CmsState } from "@/components/CmsState";
import { InsightsList } from "@/components/page/InsightsList";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { Seo } from "@/components/page/Seo";
import { getInsights } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function InsightsPage() {
  const state = useCmsResource(() => getInsights(), []);
  return <PageShell><Seo title="Insights" description="Perspectives from AJIYA Urban Rise on property, investment, land, construction, and urban growth." /><PageHero eyebrow="Insights" title={<>A considered view of<br /><em>what’s next.</em></>} copy="Perspectives on the places, decisions, and long horizons that shape real-estate opportunity." /><section className="section-pad bg-limestone"><div className="container"><CmsState state={state} emptyMessage="New perspectives are being prepared. Check back soon.">{(insights) => <InsightsList insights={insights} />}</CmsState></div></section></PageShell>;
}

export default InsightsPage;
