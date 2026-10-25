import { BrochureCta } from "@/components/page/BrochureCta";
import { CmsState } from "@/components/CmsState";
import { SectionHeading } from "@/components/page/SectionHeading";
import { getTeamMembers, resolveMediaUrl } from "@/lib/cms-client";
import { initials } from "@/lib/format";
import { useCmsResource } from "@/hooks/useCmsResource";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function TeamSection() {
  const state = useCmsResource(() => getTeamMembers(), []);
  const gridRef = useScrollReveal<HTMLDivElement>(".team-card", [state.status]);
  return <section className="section-pad bg-stone"><div className="container"><div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end"><SectionHeading eyebrow="The people behind the work" title="Meet the team shaping what’s next." copy="A connected group of people bringing leadership, legal counsel, communications, technology, and operations into the same conversation." /><BrochureCta compact /></div><div className="team-grid mt-14" ref={gridRef}><CmsState state={state} emptyMessage="Team profiles are being finalized. Reach out and we'll connect you with the right person directly.">{(members) => members.map((member, index) => (
          <article className={`team-card ${index === 0 ? "team-card--lead" : ""}`} key={member.documentId}>
            <div className="team-photo">
              {member.photo?.url
                ? <img src={resolveMediaUrl(member.photo.url)} alt={member.photo.alternativeText || `${member.name}, ${member.role}`} width={640} height={800} loading="lazy" decoding="async" data-parallax-in />
                : <span className="team-initials" aria-hidden="true">{initials(member.name)}</span>}
              <span className="team-index">0{index + 1}</span>
            </div>
            <div className="team-body">
              <p className="eyebrow">{index === 0 ? "Leadership" : member.role}</p>
              <h3>{member.name}</h3>
              {index === 0 && <p className="team-role">{member.role}</p>}
              <p className="team-copy">{member.note}</p>
              {!member.verified && <span className="team-note">Profile details to be confirmed</span>}
            </div>
          </article>
        ))}</CmsState></div></div></section>;
}
