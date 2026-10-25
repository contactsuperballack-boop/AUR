import { CmsState } from "@/components/CmsState";
import { PageHero } from "@/components/page/PageHero";
import { PageShell } from "@/components/SiteChrome";
import { ProjectCard } from "@/components/page/ProjectCard";
import { SectionHeading } from "@/components/page/SectionHeading";
import { Seo } from "@/components/page/Seo";
import { assets } from "@/data/site";
import { getProjects } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function ProjectsPage() {
  const state = useCmsResource(() => getProjects(), []);
  return <PageShell><Seo title="Our Projects" description="Explore AJIYA Urban Rise’s featured residential and masterplanned development projects in Abuja." image={assets.urban} /><PageHero eyebrow="Our projects" title={<>Places with a<br /><em>point of view.</em></>} copy="Development stories shaped by a belief that the future of a place starts with the quality of the opportunity inside it." image={assets.urban} /><section className="section-pad bg-charcoal text-limestone"><div className="container"><div className="max-w-xl"><SectionHeading light eyebrow="The portfolio" title="Not just a project list." copy="Each development is an expression of how AJIYA thinks about land, community, and the work of building lasting value." /></div><div className="mt-14 grid gap-8 lg:grid-cols-2"><CmsState state={state} emptyMessage="New developments are being prepared. Get in touch to hear about what's coming next.">{(projectList) => projectList.map((project, index) => <ProjectCard key={project.documentId} project={project} delay={index * 110} />)}</CmsState></div></div></section></PageShell>;
}

export default ProjectsPage;
