# Static front end (Batch 1)

The front end is now a prerendered static site. The API (enquiries, newsletter) and Strapi stay
separate services; the static site only calls the API from forms.

## Build

    pnpm install
    pnpm build:client      # content snapshot -> vite build -> SSR build -> prerender
    # deploy dist/public to any static host (Cloudflare Pages, Netlify, S3+CDN, nginx)

`pnpm build:client` runs, in order:
1. `scripts/build-content.mjs` — writes `client/src/content/*.json` from Strapi (`CMS_URL` set) or
   from `cms/scripts/seed-data.json` (default). CMS down + `CMS_URL` set = build fails, unless
   `CONTENT_FALLBACK=seed`.
2. `vite build` — client bundle + `index.html` template into `dist/public`.
3. `vite build --ssr` — `dist/server/entry-server.js` (not deployed).
4. `scripts/prerender.mjs` — one `index.html` per route (with that page's own title, meta, canonical,
   Open Graph and JSON-LD), `404.html` (noindex), `sitemap.xml`, `robots.txt`.

Content edits in Strapi go live on the next build: trigger a rebuild from a Strapi webhook/CI.

## Environment (build time)
- `VITE_SITE_URL` — production origin; drives canonicals, sitemap, robots, JSON-LD.
- `VITE_API_URL` — API origin for forms. The API's `ALLOWED_ORIGINS` must include the site origin,
  and the host's CSP `connect-src` must allow the API origin.
- `CMS_URL`, `STRAPI_API_TOKEN`, `CONTENT_FALLBACK` — content snapshot (see above).

## Behaviour changes to know about
- `/admin` is no longer routed in the public bundle (`pages/Admin.tsx` is kept, unrouted).
- The splash screen now decides on the client after hydration, so it never appears in prerendered HTML.
- `useCmsResource` is synchronous; "loading" states no longer occur.

## Not yet verified
No dependencies were installed when this was written, so `pnpm check/test/build` have not been run.
First step on your machine: `pnpm install && pnpm check && pnpm test && pnpm build:client`.

## Batch 3a additions
- **Team:** six portrait cards (photos in `client/public/images/team/`, source list in `cms/scripts/seed-data.json`). If you use Strapi, delete the Development / Client advisory / Project delivery entries there and upload the six photos, then rebuild.
- **Booking assistant** (`components/BookingAssistant.tsx`, logic in `lib/booking.ts`, tests in `lib/__tests__/booking.test.ts`): scripted, asks only the enquiry form's questions, composes a message for WhatsApp/email. Targets live in `contact` in `data/site.ts`. It stores and sends nothing itself.
- **Motion** (`hooks/usePageMotion.ts`): data-attribute driven (`data-parallax`, `data-parallax-in`, `data-reveal`, `data-marquee`, `data-hscroll`), reduced-motion safe, pinned horizontal scroll desktop-only.
- Tests for the new logic ran with a minimal runner; `pnpm test` has not been run (no dependencies installed here).
