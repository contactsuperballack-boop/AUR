# Deploying the static front end on Vercel

The site is a prerendered static build (`dist/public`). The API (enquiries, newsletter) and Strapi are **not**
deployed by this project on Vercel; the site only calls the API from the contact form and newsletter.

## 1. Import the project
- Vercel → Add New → Project → import the repo. Leave **Root Directory** as the repo root.
- Settings are read from `vercel.json` (framework: Other, install `pnpm install --frozen-lockfile`,
  build `pnpm build:client`, output `dist/public`). Node comes from `package.json` engines (>=22.12).
- Do not override these in the dashboard.

## 2. Environment variables (Project → Settings → Environment Variables)
| Name | Production | Notes |
|---|---|---|
| `VITE_SITE_URL` | `https://yourdomain.com` | Optional on Vercel: if unset, canonicals/sitemap use the production domain (or the preview URL) automatically. Set it once the custom domain is live. |
| `VITE_API_URL` | `https://api.yourdomain.com` | Needed for the contact form and newsletter. The same origin must be in the CSP `connect-src` in `vercel.json` (the build fails if it isn't) and in the API's `ALLOWED_ORIGINS`. |
| `CMS_URL`, `STRAPI_API_TOKEN` | optional | Only if content should come from Strapi at build time. Unset = built-in seed content. A Strapi webhook → Vercel Deploy Hook rebuilds the site on publish. |
| `CONTENT_FALLBACK` | `seed` (optional) | Build from seed content instead of failing when Strapi is unreachable. |

## 3. Domain
Add the domain under Settings → Domains, redirect `www` → apex (or the reverse), then set `VITE_SITE_URL`.
Preview deployments are automatically `noindex` by Vercel.

## 4. What the build checks (fails the deploy instead of shipping a broken site)
`scripts/check-deploy.mjs` runs last and fails on: missing index/404/sitemap/robots, pages that were not prerendered,
unresolved `%VITE_…%` placeholders, any `src`/`href`/`poster` pointing at a file or page that doesn't exist, sitemap
URLs without a page, a non-`noindex` 404, `vercel.json` out of step with the build, and a CSP that blocks `VITE_API_URL`.

## 5. After the first deploy
1. Open `/`, `/projects/urban-rise-estate` (films), `/properties`, `/contact`, and a made-up URL (should show the 404 page).
2. Browser console: no CSP violations; submit the contact form and newsletter once.
3. `/sitemap.xml` and `/robots.txt` use your real domain. Submit the sitemap in Google Search Console.
4. Share a project URL in WhatsApp/LinkedIn to confirm the per-page preview.

## Notes
- `.github/workflows/deploy.yml` builds a Docker image for a different hosting plan; disable it if Vercel is the only target.
- Fonts still load from Google Fonts (allowed in the CSP). Self-hosting them is part of the security batch.
- HSTS is `max-age=63072000` (matches Vercel's default); add `preload` only when you are ready to commit to it.
