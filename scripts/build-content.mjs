#!/usr/bin/env node
/**
 * Build-time content snapshot for the static front end.
 *
 * The site no longer calls the CMS from the browser. This script writes the JSON the pages
 * render from (client/src/content/*.json), in one of two modes:
 *
 *   CMS_URL=https://cms.example.com [STRAPI_API_TOKEN=...] node scripts/build-content.mjs
 *       Pulls published content from Strapi v5 at build time. Fails the build if the CMS is
 *       unreachable (so a deploy never silently ships stale or empty content), unless
 *       CONTENT_FALLBACK=seed is set.
 *
 *   node scripts/build-content.mjs        (no CMS_URL)
 *       Builds from cms/scripts/seed-data.json, so a fresh clone builds with no CMS running.
 *
 * Media URLs are written absolute (CMS origin prefixed) or as local /images/... paths.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "client/src/content");
const publicImages = path.join(root, "client/public/images");
const CMS_URL = (process.env.CMS_URL || process.env.VITE_CMS_URL || "").replace(/\/$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN || "";

const exists = (p) => access(p).then(() => true, () => false);

async function localMedia(file, id) {
  if (!file || !(await exists(path.join(publicImages, file)))) return null;
  return { id, url: `/images/${file}`, alternativeText: null };
}

async function localGallery(files = [], baseId) {
  const items = await Promise.all(files.map((file, i) => localMedia(file, baseId + i)));
  return items.filter(Boolean);
}

async function fromSeed() {
  const seed = JSON.parse(await readFile(path.join(root, "cms/scripts/seed-data.json"), "utf8"));
  const withIds = (list, prefix) => list.map((it, i) => ({ id: i + 1, documentId: `${prefix}-${it.slug ?? i + 1}`, ...it }));

  const services = withIds(seed.services, "service").map((s, i) => ({ sortOrder: i + 1, ...s }));

  const projects = [];
  for (const [i, p] of withIds(seed.projects, "project").entries()) {
    const { heroImagePlaceholder, galleryPlaceholders, ...rest } = p;
    projects.push({ ...rest, heroImage: await localMedia(heroImagePlaceholder, 100 + i), gallery: await localGallery(galleryPlaceholders, 500 + i * 10) });
  }

  const properties = [];
  for (const [i, p] of withIds(seed.properties, "property").entries()) {
    const { imagePlaceholder, galleryPlaceholders, projectSlug, ...rest } = p;
    const proj = projects.find((x) => x.slug === projectSlug);
    properties.push({
      ...rest,
      image: await localMedia(imagePlaceholder, 200 + i),
      gallery: await localGallery(galleryPlaceholders, 600 + i * 10),
      project: proj ? { id: proj.id, documentId: proj.documentId, name: proj.name, slug: proj.slug } : null,
    });
  }

  const insights = [];
  for (const [i, n] of withIds(seed.insights, "insight").entries()) {
    const { coverImagePlaceholder, ...rest } = n;
    insights.push({ ...rest, coverImage: await localMedia(coverImagePlaceholder, 300 + i) });
  }

  const team = [];
  for (const [i, m] of withIds(seed.teamMembers.map((t) => ({ ...t, slug: undefined })), "team").entries()) {
    const { photoPlaceholder, ...rest } = m;
    team.push({ ...rest, documentId: `team-${i + 1}`, photo: await localMedia(photoPlaceholder, 400 + i) });
  }
  return { services, projects, properties, insights, team, source: "seed" };
}

function absolutize(node) {
  if (Array.isArray(node)) return node.map(absolutize);
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = k === "url" && typeof v === "string" && v.startsWith("/") ? `${CMS_URL}${v}` : absolutize(v);
    }
    return out;
  }
  return node;
}

async function strapiList(collection, { sort, populate = [] } = {}) {
  const items = [];
  for (let page = 1; ; page++) {
    const q = new URLSearchParams();
    if (sort) q.set("sort", sort);
    populate.forEach((f, i) => q.set(`populate[${i}]`, f));
    q.set("pagination[page]", String(page));
    q.set("pagination[pageSize]", "100");
    const res = await fetch(`${CMS_URL}/api/${collection}?${q}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`${collection}: HTTP ${res.status}`);
    const json = await res.json();
    items.push(...json.data);
    if (page >= json.meta.pagination.pageCount) break;
  }
  return absolutize(items);
}

async function fromCms() {
  const [services, projects, properties, insights, team] = await Promise.all([
    strapiList("services", { sort: "sortOrder:asc" }),
    strapiList("projects", { sort: "sortOrder:asc", populate: ["heroImage", "gallery"] }),
    strapiList("properties", { populate: ["image", "gallery", "project"] }),
    strapiList("insights", { sort: "publishDate:desc", populate: ["coverImage"] }),
    strapiList("team-members", { sort: "sortOrder:asc", populate: ["photo"] }),
  ]);
  return { services, projects, properties, insights, team, source: CMS_URL };
}

let data;
if (CMS_URL) {
  try {
    data = await fromCms();
  } catch (err) {
    if (process.env.CONTENT_FALLBACK === "seed") {
      console.warn(`[content] CMS unreachable (${err.message}); falling back to seed data.`);
      data = await fromSeed();
    } else {
      console.error(`[content] CMS fetch failed: ${err.message}\nSet CONTENT_FALLBACK=seed to build from seed data instead.`);
      process.exit(1);
    }
  }
} else {
  data = await fromSeed();
}

await mkdir(outDir, { recursive: true });
const files = { services: "services", projects: "projects", properties: "properties", insights: "insights", team: "team-members" };
for (const [key, name] of Object.entries(files)) {
  await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(data[key], null, 2) + "\n");
}
await writeFile(path.join(outDir, "meta.json"), JSON.stringify({ source: data.source, generatedAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`[content] wrote ${Object.entries(files).map(([k]) => `${data[k].length} ${k}`).join(", ")} (source: ${data.source})`);
