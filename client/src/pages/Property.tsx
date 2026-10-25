import { CmsState } from "@/components/CmsState";
import { PageShell } from "@/components/SiteChrome";
import { PropertyDetail } from "@/components/page/PropertyDetail";
import { Seo } from "@/components/page/Seo";
import { getPropertyBySlug, resolveMediaUrl } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function PropertyPage({ slug }: { slug: string }) {
  const state = useCmsResource(() => getPropertyBySlug(slug), [slug]);
  const title = state.status === "success" ? state.data.name : "Property";
  const description = state.status === "success" ? state.data.description : "AJIYA Urban Rise property opportunity.";
  return <PageShell context={title !== "Property" ? title : undefined}><Seo title={title} description={description} image={state.status === "success" ? resolveMediaUrl(state.data.image?.url) : undefined} /><CmsState state={state} notFoundLabel="Property not found" notFoundMessage="We couldn't find this listing. It may have been renamed or is no longer available.">{(property) => <PropertyDetail property={property} />}</CmsState></PageShell>;
}

export default PropertyPage;
