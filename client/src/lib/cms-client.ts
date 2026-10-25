import type { Insight, Project, Property, Service, TeamMember } from "./cms-types";
import servicesData from "@/content/services.json";
import projectsData from "@/content/projects.json";
import propertiesData from "@/content/properties.json";
import insightsData from "@/content/insights.json";
import teamData from "@/content/team-members.json";

/**
 * Static content layer. The front end no longer talks to the CMS at runtime: content is
 * snapshotted into client/src/content/*.json by `node scripts/build-content.mjs` (from
 * Strapi when CMS_URL is set, otherwise from cms/scripts/seed-data.json) and bundled at
 * build time. Because every getter is synchronous, pages render real content during
 * prerender (SEO) and on first paint (no loading spinners, no layout shift).
 *
 * Function names and shapes are unchanged from the old axios client, so pages only needed
 * the hook (useCmsResource) to become synchronous.
 */

const services = servicesData as unknown as Service[];
const projects = projectsData as unknown as Project[];
const properties = propertiesData as unknown as Property[];
const insights = insightsData as unknown as Insight[];
const team = teamData as unknown as TeamMember[];

/** Snapshot media URLs are already absolute (CMS/CDN) or local (/images/...). */
export function resolveMediaUrl(url: string | undefined | null): string {
  return url || "";
}

/**
 * "Nothing here" vs "something broke" need different UI per page (see CmsState.tsx).
 */
export class CmsNotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "CmsNotFoundError";
  }
}

function bySlug<T extends { slug: string }>(list: T[], slug: string, resource: string): T {
  const item = list.find((entry) => entry.slug === slug);
  if (!item) throw new CmsNotFoundError(resource);
  return item;
}

const bySortOrder = <T extends { sortOrder: number }>(list: T[]) => [...list].sort((a, b) => a.sortOrder - b.sortOrder);

// --- Services ---------------------------------------------------------------

export function getServices(): Service[] {
  return bySortOrder(services);
}

export function getServiceBySlug(slug: string): Service {
  return bySlug(services, slug, "/services");
}

// --- Projects -----------------------------------------------------------------

export function getProjects(): Project[] {
  return bySortOrder(projects);
}

export function getProjectBySlug(slug: string): Project {
  return bySlug(projects, slug, "/projects");
}

// --- Properties -----------------------------------------------------------------

export function getProperties(filters?: { category?: string }): Property[] {
  if (filters?.category && filters.category !== "All") {
    return properties.filter((item) => item.category === filters.category);
  }
  return [...properties];
}

export function getPropertyBySlug(slug: string): Property {
  return bySlug(properties, slug, "/properties");
}

// --- Insights -----------------------------------------------------------------

export function getInsights(): Insight[] {
  return [...insights].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function getInsightBySlug(slug: string): Insight {
  return bySlug(insights, slug, "/insights");
}

// --- Team members -----------------------------------------------------------------

export function getTeamMembers(): TeamMember[] {
  return bySortOrder(team);
}

// Re-exported so pages can `import { type Project, ... } from "@/lib/cms-client"`
// without a second import from "./cms-types".
export type { Insight, Project, Property, Service, StrapiMedia, TeamMember } from "./cms-types";
