/**
 * Pure SEO head builder shared by the browser (Seo component effect) and the prerender step.
 * One source of truth means the HTML crawlers/link-preview bots receive is identical to what
 * the browser sets after hydration.
 */

export const SITE_ORIGIN = ((import.meta.env?.VITE_SITE_URL as string | undefined) || "https://ajiyaurbanrise.com").replace(/\/$/, "");
export const SITE_NAME = "AJIYA Urban Rise";
export const DEFAULT_OG_IMAGE = "/images/ajiya-hero-fallback.jpg";

/** Turns "some-slug" into "Some Slug" for the auto-generated breadcrumb labels. */
export function titleCaseSlug(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface SeoInput {
  title: string;
  description: string;
  /** Relative ("/images/x.jpg") or absolute (CDN/CMS) URL. Falls back to the brand hero image. */
  image?: string;
  type?: "website" | "article";
  article?: { publishedTime?: string; author?: string };
  /** Extra JSON-LD blocks (e.g. FAQPage, RealEstateListing). `id` keeps them replaceable. */
  jsonLd?: { id: string; data: object }[];
  /** Current route path, e.g. "/projects/signature-estate". */
  path: string;
}

export interface HeadMeta {
  attr: "name" | "property";
  key: string;
  content: string;
}

export interface HeadData {
  title: string;
  meta: HeadMeta[];
  canonical: string;
  jsonLd: { id: string; data: object }[];
}

export function buildHead({ title, description, image, type = "website", article, jsonLd = [], path }: SeoInput): HeadData {
  const fullTitle = `${title} — ${SITE_NAME}`;
  const cleanPath = path.length > 1 ? path.replace(/\/$/, "") : path;
  const canonical = `${SITE_ORIGIN}${cleanPath === "/" ? "" : cleanPath}`;
  const absoluteImage = !image ? `${SITE_ORIGIN}${DEFAULT_OG_IMAGE}` : image.startsWith("http") ? image : `${SITE_ORIGIN}${image}`;

  const meta: HeadMeta[] = [
    { attr: "name", key: "description", content: description },
    { attr: "property", key: "og:title", content: fullTitle },
    { attr: "property", key: "og:description", content: description },
    { attr: "property", key: "og:type", content: type },
    { attr: "property", key: "og:url", content: canonical },
    { attr: "property", key: "og:image", content: absoluteImage },
    { attr: "name", key: "twitter:title", content: fullTitle },
    { attr: "name", key: "twitter:description", content: description },
    { attr: "name", key: "twitter:image", content: absoluteImage },
  ];

  const segments = cleanPath.split("/").filter(Boolean);
  const blocks: { id: string; data: object }[] = [
    {
      id: "ld-breadcrumb",
      data: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
          ...segments.map((segment, index) => ({
            "@type": "ListItem",
            position: index + 2,
            name: index === segments.length - 1 ? title : titleCaseSlug(segment),
            item: `${SITE_ORIGIN}/${segments.slice(0, index + 1).join("/")}`,
          })),
        ],
      },
    },
  ];

  if (type === "article") {
    blocks.push({
      id: "ld-article",
      data: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image: absoluteImage,
        url: canonical,
        datePublished: article?.publishedTime,
        author: article?.author ? { "@type": "Person", name: article.author } : { "@type": "Organization", name: SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/images/ajiya-logo.webp` } },
      },
    });
  }

  return { title: fullTitle, meta, canonical, jsonLd: [...blocks, ...jsonLd] };
}

/** Browser-side: apply a HeadData to document.head, replacing what the previous page set. */
export function applyHead(head: HeadData): void {
  document.title = head.title;

  for (const { attr, key, content } of head.meta) {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", head.canonical);

  // Remove page-scoped JSON-LD from a previous route that this page doesn't define.
  const keep = new Set(head.jsonLd.map((block) => block.id));
  document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-page]').forEach((el) => {
    if (!keep.has(el.id)) el.remove();
  });
  for (const { id, data } of head.jsonLd) {
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.setAttribute("data-page", "");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}

const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Server-side (prerender): serialize a HeadData to the tags injected into <head>. */
export function headToHtml(head: HeadData): string {
  const lines = [
    `<title>${escapeText(head.title)}</title>`,
    ...head.meta.map((m) => `<meta ${m.attr}="${escapeAttr(m.key)}" content="${escapeAttr(m.content)}" />`),
    `<link rel="canonical" href="${escapeAttr(head.canonical)}" />`,
    // "<" is escaped inside JSON so a stray "</script>" in content can never break out of the tag.
    ...head.jsonLd.map(
      (block) => `<script type="application/ld+json" id="${escapeAttr(block.id)}" data-page>${JSON.stringify(block.data).replace(/</g, "\\u003c")}</script>`
    ),
  ];
  return lines.join("\n    ");
}
