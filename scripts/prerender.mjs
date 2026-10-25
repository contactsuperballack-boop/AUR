#!/usr/bin/env node
/**
 * Prerender every public route to static HTML, then emit sitemap.xml and robots.txt.
 *
 * Run after the two Vite builds (see `pnpm build:client`):
 *   vite build                       -> dist/public (client bundle + index.html template)
 *   vite build --ssr entry-server    -> dist/server/entry-server.js (render(url) -> { html, head })
 *
 * For each route this writes dist/public/<route>/index.html with: the server-rendered page
 * inside #root, and that page's own <title>, meta description, canonical, Open Graph/Twitter
 * tags and JSON-LD in <head>, so crawlers and link-preview bots need no JavaScript.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = process.env.PRERENDER_DIST || path.join(root, "dist/public");
const serverEntry = process.env.PRERENDER_SERVER_ENTRY || path.join(root, "dist/server/entry-server.js");
const contentDir = process.env.PRERENDER_CONTENT || path.join(root, "client/src/content");
const DEFAULT_OG_IMAGE = "/images/ajiya-hero-fallback.jpg";

const readJson = async (name) => JSON.parse(await readFile(path.join(contentDir, name), "utf8"));

const STATIC_ROUTES = ["/", "/about", "/services", "/projects", "/properties", "/invest", "/insights", "/contact", "/faq", "/privacy", "/terms"];

/** Tags in the index.html template that each page replaces with its own. */
const PER_PAGE_TAGS = [
  /<title>[\s\S]*?<\/title>\s*/i,
  /<meta\s+name="description"[^>]*>\s*/i,
  /<link\s+rel="canonical"[^>]*>\s*/i,
  /<meta\s+property="og:(?:title|description|type|url|image)"[^>]*>\s*/gi,
  /<meta\s+name="twitter:(?:title|description|image)"[^>]*>\s*/gi,
];
const OG_IMAGE_DIMENSIONS = /<meta\s+property="og:image:(?:width|height)"[^>]*>\s*/gi;

export function buildPage(template, { html, headHtml, usesDefaultImage, noindex }) {
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('index.html template must contain an empty <div id="root"></div>');
  }
  let page = template;
  for (const tag of PER_PAGE_TAGS) page = page.replace(tag, "");
  // The template's og:image width/height describe the default image only.
  if (!usesDefaultImage) page = page.replace(OG_IMAGE_DIMENSIONS, "");
  const extra = noindex ? `\n    <meta name="robots" content="noindex" />` : "";
  page = page.replace("</head>", `    ${headHtml}${extra}\n  </head>`);
  return page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

export function buildSitemap(entries) {
  const urls = entries
    .map(({ loc, lastmod }) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const [services, projects, properties, insights] = await Promise.all(
    ["services.json", "projects.json", "properties.json", "insights.json"].map(readJson)
  );
  const today = new Date().toISOString().slice(0, 10);

  const routes = [
    ...STATIC_ROUTES.map((route) => ({ route, lastmod: today })),
    ...services.map((s) => ({ route: `/services/${s.slug}`, lastmod: today })),
    ...projects.map((p) => ({ route: `/projects/${p.slug}`, lastmod: today })),
    ...properties.map((p) => ({ route: `/properties/${p.slug}`, lastmod: today })),
    ...insights.map((i) => ({ route: `/insights/${i.slug}`, lastmod: i.publishDate || today })),
  ];

  const template = await readFile(path.join(distDir, "index.html"), "utf8");
  const { render, headToHtml, SITE_ORIGIN } = await import(pathToFileURL(serverEntry).href);

  const problems = [];
  for (const { route } of routes) {
    const { html, head } = await render(route);
    if (!head) problems.push(`${route}: page rendered no <Seo> head`);
    if (!/<h1[\s>]/.test(html)) problems.push(`${route}: no <h1> in rendered HTML`);
    const headHtml = head ? headToHtml(head) : "";
    const usesDefaultImage = !!head?.meta?.some((m) => m.key === "og:image" && m.content.endsWith(DEFAULT_OG_IMAGE));
    const page = buildPage(template, { html, headHtml, usesDefaultImage, noindex: false });
    const outFile = route === "/" ? path.join(distDir, "index.html") : path.join(distDir, route, "index.html");
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, page);
  }

  // 404.html: hosts (Netlify, Cloudflare Pages, nginx error_page) serve this for unknown URLs.
  const notFound = await render("/404");
  const notFoundHead = `<title>Page not found — AJIYA Urban Rise</title>`;
  await writeFile(
    path.join(distDir, "404.html"),
    buildPage(template, { html: notFound.html, headHtml: notFoundHead, usesDefaultImage: false, noindex: true })
  );

  await writeFile(path.join(distDir, "sitemap.xml"), buildSitemap(routes.map(({ route, lastmod }) => ({ loc: `${SITE_ORIGIN}${route === "/" ? "" : route}`, lastmod }))));
  await writeFile(path.join(distDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);

  if (problems.length) {
    console.error(`[prerender] ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
    process.exit(1);
  }
  console.log(`[prerender] wrote ${routes.length} pages + 404.html, sitemap.xml, robots.txt (origin: ${SITE_ORIGIN})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
