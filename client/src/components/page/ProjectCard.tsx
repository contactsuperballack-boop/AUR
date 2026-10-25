import { ArrowUpRight, MapPin } from "lucide-react";
import { ImageFrame } from "@/components/page/ImageFrame";
import { Link } from "wouter";
import { type Project, resolveMediaUrl } from "@/lib/cms-client";
import { assets } from "@/data/site";
import { projectStatusLabel } from "@/components/page/projectStatusLabel";
import { useReveal } from "@/components/page/useReveal";
import { useSpotlightRef } from "@/hooks/useSpotlight";

export function ProjectCard({ project, featured = false, offset = false, delay = 0 }: { project: Project; featured?: boolean; offset?: boolean; delay?: number }) {
  const [ref, visible] = useReveal();
  const spotlightRef = useSpotlightRef<HTMLAnchorElement>();
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`project-reveal ${visible ? "is-visible" : ""}`}><Link ref={spotlightRef} href={`/projects/${project.slug}`} className={`project-card ${featured ? "project-card--large" : offset ? "project-card--offset" : "project-card--medium"}`}><ImageFrame src={resolveMediaUrl(project.heroImage?.url) || assets.urban} alt={project.heroImage?.alternativeText || project.name} className="project-card-image" /><div className="project-card-overlay" /><span className="project-card-glow" aria-hidden="true" /><span className="project-status-badge">{projectStatusLabel(project.status)}</span><div className="project-card-content"><span className="eyebrow text-limestone/60">{project.number} / {project.type}</span><h3>{project.name}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-limestone/60"><MapPin size={12} />{project.location}</p><p className="mt-3 max-w-md text-sm leading-6 text-limestone/68">{project.description}</p><span className="project-card-link">Explore project <ArrowUpRight size={16} /></span></div></Link></div>;
}
