/**
 * Films shown on project pages (and one on the home page). Kept beside the content snapshot
 * rather than in the CMS so it works in both content modes (Strapi or seed); files live in
 * client/public/videos. Moving a film to another project is a one-line change here.
 *
 * Note: the Golden Valley reel carries its own on-screen text (project name, unit types and
 * pre-launch prices). Re-check those figures before publishing, and re-export the reel when
 * pricing changes.
 */
export interface ProjectVideo {
  src: string;
  poster: string;
  title: string;
  orientation?: "landscape" | "portrait";
}

export const projectVideos: Record<string, ProjectVideo[]> = {
  "urban-rise-estate": [
    { src: "/videos/urban-rise-estate-1.mp4", poster: "/videos/urban-rise-estate-1.webp", title: "Along the street" },
    { src: "/videos/urban-rise-estate-2.mp4", poster: "/videos/urban-rise-estate-2.webp", title: "Inside the homes" },
    { src: "/videos/urban-rise-estate-3.mp4", poster: "/videos/urban-rise-estate-3.webp", title: "The estate at street level" },
  ],
  "golden-valley-estate": [
    { src: "/videos/golden-valley-estate.mp4", poster: "/videos/golden-valley-estate.webp", title: "Golden Valley Estate — launch film", orientation: "portrait" },
  ],
};

/** The film that plays quietly on the home page. */
export const homeFilm = { slug: "urban-rise-estate", video: projectVideos["urban-rise-estate"][0] };
