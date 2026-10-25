import { CmsState } from "@/components/CmsState";
import { ProjectCard } from "@/components/page/ProjectCard";
import { getProjects } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function FeaturedProjects() {
  const state = useCmsResource(() => getProjects(), []);
  return (
    <div className="project-grid mt-14">
      <CmsState state={state} emptyMessage="Our current developments are being updated. Get in touch to hear about what's coming next.">
        {(projectList) => projectList.slice(0, 2).map((project, index) => (
          <ProjectCard key={project.documentId} project={project} featured={index === 0} offset={index === 1} delay={index * 110} />
        ))}
      </CmsState>
    </div>
  );
}
