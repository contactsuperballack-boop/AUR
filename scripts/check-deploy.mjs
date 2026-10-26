#!/usr/bin/env node
/**
 * Post-build deploy check. Runs at the end of `pnpm build:client` and fails the build (so a bad
 * deploy never goes live) if the static output would ship broken:
 *   - required files missing (index/404/sitemap/robots), pages not prerendered, unresolved %VITE_% placeholders
 *   - any local src/href/poster in any page pointing at a file or page that doesn't exist
 *   - sitemap entries that don't map to a built page, 404 page not noindex
 *   - vercel.json out of step with the build (output directory) or a CSP that would block the API origin
 * Warnings (don't fail): API origin not configured for a production build.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = process.env.DEPLOY_DIST || path.join(root, "dist/public");
const errors = [];
const warnings = [];
const brokenRefs = new Map(); // ref -> pages that use it (reported once per ref, not once per page)

async function walk(dir, base = dir, out = new Set()) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, base, out);
    else out.add(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

const files = await walk(dist);
for (const required of ["index.html", "404.html", "sitemap.xml", "robots.txt"]) {
  if (!files.has(required)) errors.push(`dist is missing ${required}`);
}
if (![...files].some((f) => /^assets\/.+\.js$/.test(f))) errors.push("no JavaScript bundle in dist/assets");
if (![...files].some((f) => /^assets\/.+\.css$/.test(f))) errors.push("no CSS bundle in dist/assets");

const routeExists = (route) => route === "/" || files.has(`${route.replace(/^\//, "").replace(/\/$/, "")}/index.html`) || files.has(`${route.replace(/^\//, "")}.html`);
const fileExists = (p) => files.has(p.replace(/^\//, ""));

// --- pages
const htmlFiles = [...files].filter((f) => f.endsWith(".html"));
for (const file of htmlFiles) {
  const html = await readFile(path.join(dist, file), "utf8");
  const where = `/${file}`;
  if (/%VITE_[A-Z_]+%/.test(html)) errors.push(`${where}: unresolved %VITE_…% placeholder`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${where}: no <title>`);
  if (/<div id="root"><\/div>/.test(html)) errors.push(`${where}: not prerendered (empty #root)`);
  if (file === "404.html" && !/name="robots" content="noindex"/.test(html)) errors.push("/404.html: should be noindex");

  const seen = new Set();
  for (const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) {
    const ref = match[1];
    if (!ref.startsWith("/") || ref.startsWith("//") || seen.has(ref)) continue;
    seen.add(ref);
    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;
    const last = clean.split("/").pop() ?? "";
    const ok = last.includes(".") ? fileExists(clean) : routeExists(clean);
    if (!ok) brokenRefs.set(ref, [...(brokenRefs.get(ref) ?? []), where]);
  }
}

for (const [ref, pages] of brokenRefs) errors.push(`${ref} is not in the build (used by ${pages.length} page${pages.length > 1 ? "s" : ""}, e.g. ${pages[0]})`);

// --- sitemap + robots
if (files.has("sitemap.xml")) {
  const xml = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) errors.push("sitemap.xml lists no URLs");
  for (const loc of locs) {
    const route = new URL(loc).pathname || "/";
    if (!routeExists(route)) errors.push(`sitemap.xml lists ${loc}, which has no built page`);
  }
}
if (files.has("robots.txt") && !/^Sitemap:\s*https?:\/\//im.test(await readFile(path.join(dist, "robots.txt"), "utf8"))) {
  errors.push("robots.txt has no Sitemap line");
}

// --- vercel.json
try {
  const vercel = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
  if (path.normalize(vercel.outputDirectory || "") !== path.normalize("dist/public") && !process.env.DEPLOY_DIST) {
    errors.push(`vercel.json outputDirectory is "${vercel.outputDirectory}" but the build writes dist/public`);
  }
  const csp = (vercel.headers ?? []).flatMap((h) => h.headers ?? []).find((h) => h.key === "Content-Security-Policy")?.value ?? "";
  const connect = (csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("connect-src")) ?? "").split(/\s+/).slice(1);
  const apiUrl = process.env.VITE_API_URL;
  if (apiUrl) {
    const origin = new URL(apiUrl).origin;
    if (!connect.includes(origin)) errors.push(`vercel.json CSP connect-src does not allow ${origin} (VITE_API_URL); forms would be blocked. Add it to connect-src.`);
  } else if (process.env.VERCEL_ENV === "production") {
    warnings.push("VITE_API_URL is not set: the contact form and newsletter will post to this site's own /api and fail. The booking assistant is unaffected.");
  }
} catch (err) {
  errors.push(`vercel.json is missing or invalid: ${err.message}`);
}

for (const w of warnings) console.warn(`[check-deploy] warning: ${w}`);
if (errors.length) {
  console.error(`[check-deploy] ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(`[check-deploy] OK — ${htmlFiles.length} pages, ${files.size} files checked`);
