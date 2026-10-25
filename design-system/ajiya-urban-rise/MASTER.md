# AJIYA Urban Rise — Design System Master

> **LOGIC:** For a specific page, check `pages/<page-name>.md` first. If it exists, it overrides this file.
> Generated with the ui-ux-pro-max skill, then **verified and corrected for fit** (see "Deviations").

**Category:** Real Estate / Property developer (Abuja) · **Front end:** static (prerendered React/Vite) · **Stack:** react + tailwind v4
**Dials:** Variance 4 (balanced) · Motion 3 (subtle) · Density 2 (spacious)

## Direction
Quiet luxury, editorial. Minimalism/Swiss-influenced layout, generous whitespace, large photography, restrained bronze accents. Glass blur only on the sticky nav and overlays.

## Page pattern (from skill, accepted)
Hero-Centric: full-bleed hero (headline + real project visual) → single value-prop strip → proof/benefit → one primary CTA, plus sticky-nav CTA. Static hero + no pulsing CTA under `prefers-reduced-motion`.

## Color — BRAND TOKENS WIN (source of truth: `client/src/index.css`)
| Role | Token | Value |
|---|---|---|
| Background | `--limestone` | oklch(0.965 0.012 88) |
| Alt surface | `--stone` | oklch(0.9 0.016 88) |
| Text / dark sections | `--charcoal` | oklch(0.22 0.015 155) |
| Primary / deep green | `--canopy` | oklch(0.33 0.075 160) |
| Accent / luxury | `--bronze` | oklch(0.62 0.075 67) |
Rule: bronze for accents, rules, and hover states only. Verify every text/background pair ≥ 4.5:1 (bronze on limestone for body text will likely fail — use canopy/charcoal for text).

## Typography
- Keep: **DM Serif Display** (display) + **Manrope** (body) — already editorial.
- Proposed (needs approval): **Cinzel** for wordmark/eyebrow labels only (skill's real-estate pairing is Cinzel + Josefin Sans).
- Self-host all fonts (no Google Fonts requests) to tighten CSP and speed.
- Body ≥ 16px, line-height ~1.5–1.7, display headings use balanced wrapping.

## Spacing (spacious)
xs 4 · sm 8 · md 24 · lg 32 · xl 48 · 2xl 64 · 3xl 96 px. Section padding 96px+ desktop, 64px mobile.

## Shape & depth
Small radii (2–6px), hairline borders (`--line`), very soft shadows. No heavy drop shadows, no gradients-for-decoration.

## Components
- **Button primary:** canopy bg, limestone text, 2–4px radius, 12×24 padding, 200ms ease; hover = bronze underline/arrow shift (no bounce). Min 44×44 touch.
- **Button secondary:** transparent, 1px canopy border.
- **Cards:** limestone/white, hairline border, image-led; hover lift ≤ 2px.
- **Inputs:** visible labels (never placeholder-only), 16px text, errors beside the field, 3px canopy focus ring.
- **Nav:** sticky, subtle backdrop blur (≤12px) with solid fallback; visible focus states.

## Motion (subtle)
Scroll reveal: opacity + y 12px, 350ms, power1.out, `top 90%`. Skip entirely under reduced motion. Content must be visible without JS (SEO/no-JS fallback) — never hide crawl-critical text by default.

## Deviations from the skill's raw output (and why)
- Rejected "Liquid Glass" (Apple-app chrome) and full Glassmorphism as the site style — poor fit for a luxury developer site.
- Rejected the skill's teal/blue palette (#0F766E/#0369A1) and black/gold alt — conflicts with the existing AJIYA brand (canopy green + bronze).
- Rejected Cinzel/Josefin as full replacement pending approval; current type pairing already fits.

## Pre-delivery checklist
- [ ] SVG icons only (lucide), no emoji · [ ] cursor-pointer + hover 150–300ms · [ ] contrast ≥ 4.5:1 · [ ] visible focus
- [ ] prefers-reduced-motion honored · [ ] responsive at 375 / 768 / 1024 / 1440 · [ ] images WebP/AVIF, dimensions set (CLS < 0.1)

## Applied in Batch 2 (client/src/index.css, "Luxury refinement layer")
- Body 16px / 1.6; balanced headings; fluid section rhythm (80-144px); labels raised from ~9px to 11-12px.
- Text contrast floor: 42 generated overrides lifted every muted-text rule to >= 66% mix
  (charcoal on stone 4.9:1, limestone on canopy 5.5:1). Bronze is hairlines/accents only (3.3:1 on limestone).
- Frosted header (blur 12px) is the only glass; calmer, slower motion; soft hairline cards.
- Skip link + `<main id="main">`; light focus ring on dark surfaces; 16px / 52px form fields.
- Grain overlay disabled on touch devices (scroll performance). Splash screen removed from first paint.
- NOT done (needs assets/network): real project photography, self-hosted fonts, Cinzel decision (kept DM Serif + Manrope).
