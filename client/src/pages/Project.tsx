import { CmsState } from "@/components/CmsState";
import { PageShell } from "@/components/SiteChrome";
import { ProjectDetail } from "@/components/page/ProjectDetail";
import { Seo } from "@/components/page/Seo";
import { getProjectBySlug, resolveMediaUrl } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function ProjectPage({ id }: { id: string }) {
  const state = useCmsResource(() => getProjectBySlug(id), [id]);
  const title = state.status === "success" ? state.data.name : "Project";
  const description = state.status === "success" ? state.data.description : "AJIYA Urban Rise development.";
  return <PageShell context={title !== "Project" ? title : undefined}><Seo title={title} description={description} image={state.status === "success" ? resolveMediaUrl(state.data.heroImage?.url) : undefined} /><CmsState state={state} notFoundLabel="Project not found" notFoundMessage="We couldn't find this project. It may have been renamed or is no longer listed.">{(project) => <ProjectDetail project={project} />}</CmsState></PageShell>;
}

export default ProjectPage;
