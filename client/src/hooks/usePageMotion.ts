import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP, motionConditions } from "@/lib/motion";

/**
 * Page-level scroll motion for every page that renders inside <PageShell>.
 *
 * Elements opt in declaratively, so pages only need an attribute (no per-page hook):
 *   data-parallax="0.12"      the element drifts vertically by ±12% of its height as it crosses the viewport
 *   data-parallax-in          an <img> inside an overflow-hidden frame drifts and slightly scales (frame stays put)
 *   data-reveal[="left|right|scale"]  fades/slides in once when it enters
 *   data-marquee="-1|1"       a track of repeated items slides horizontally as the page scrolls (direction -1 = left)
 *   data-hscroll              desktop: the section pins while its [data-hscroll-track] scrolls sideways;
 *                             mobile/reduced motion: it becomes a native swipe/snap row (see index.css)
 * Plus automatic effects: scroll-progress bar, page-hero image parallax and text drift, final-CTA parallax,
 * and a reveal for common blocks (section headings, article/service rows, FAQ items, contact lines…).
 *
 * Rules every effect follows (same as lib/motion.ts): transforms/opacity only (no layout shift),
 * prefers-reduced-motion gets the plain static page, and pinned/scrubbed horizontal motion is
 * desktop-only because scroll-jacking is unreliable on mobile Safari. Content is fully visible in
 * the prerendered HTML; these effects only start once the page hydrates.
 */
const AUTO_REVEAL = [
  ".section-heading",
  ".article-row",
  ".service-detail-row",
  ".feature-tile",
  ".faq-item",
  ".contact-line",
  ".insight-feature",
  ".about-mosaic",
  ".unit-price-table",
  ".property-search-panel",
].join(",");

export function usePageMotion(scope: RefObject<HTMLElement | null>, progress: RefObject<HTMLElement | null>, deps: unknown[]) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(motionConditions, (context) => {
        const { isMobile, reduceMotion } = context.conditions as { isMobile: boolean; reduceMotion: boolean };
        if (reduceMotion) return; // static page: nothing is hidden, nothing moves
        const strength = isMobile ? 0.55 : 1;
        const all = <T extends HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, root);

        // 1. Scroll progress hairline (bronze, top of the viewport).
        if (progress.current) {
          gsap.fromTo(progress.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
        }

        // 2. Hero: background drifts slower than the page; copy eases up and fades as you leave.
        all(".page-hero").forEach((hero) => {
          const image = hero.querySelector<HTMLElement>(".page-hero-image");
          const copy = hero.querySelector<HTMLElement>(".container > div");
          if (image) {
            gsap.set(image, { scale: 1.12 });
            gsap.to(image, { yPercent: 14 * strength, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
          }
          if (copy) {
            gsap.to(copy, { y: -48 * strength, autoAlpha: 0.15, ease: "none", scrollTrigger: { trigger: hero, start: "35% top", end: "bottom top", scrub: true } });
          }
        });
        all(".final-cta").forEach((section) => {
          const image = section.querySelector<HTMLElement>(".final-cta-image");
          if (!image) return;
          gsap.set(image, { scale: 1.12, yPercent: -8 * strength });
          gsap.to(image, { yPercent: 8 * strength, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } });
        });

        // 3. Declarative parallax.
        all("[data-parallax]").forEach((el) => {
          const speed = (parseFloat(el.dataset.parallax || "0.1") || 0.1) * strength;
          gsap.fromTo(el, { yPercent: -speed * 100 }, { yPercent: speed * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        all("img[data-parallax-in]").forEach((img) => {
          const frame = img.parentElement ?? img;
          gsap.set(img, { scale: 1.14 });
          gsap.fromTo(img, { yPercent: -5 * strength }, { yPercent: 5 * strength, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
        });

        // 4. Reveals (explicit + the common blocks). Skip anything inside a pinned horizontal track
        //    and anything another hook already reveals.
        const revealTargets = [...new Set([...all("[data-reveal]"), ...all(AUTO_REVEAL)])].filter(
          (el) => !el.closest("[data-hscroll], .insight-scroll-section")
        );
        if (revealTargets.length) {
          const from = (el: HTMLElement) => {
            const kind = el.dataset.reveal;
            return kind === "left" ? { x: -36, y: 0 } : kind === "right" ? { x: 36, y: 0 } : kind === "scale" ? { y: 18, scale: 0.97 } : { y: 36 };
          };
          revealTargets.forEach((el) => gsap.set(el, { autoAlpha: 0, ...from(el) }));
          ScrollTrigger.batch(revealTargets, {
            start: "top 90%",
            once: true,
            onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.95, ease: "power3.out", stagger: 0.1, overwrite: true }),
          });
        }

        // 5. Horizontal drift: marquee rows slide sideways, opposite directions, as the page scrolls.
        all("[data-marquee]").forEach((row) => {
          const track = row.querySelector<HTMLElement>(".marquee-track");
          if (!track) return;
          const direction = Number(row.dataset.marquee) < 0 ? -1 : 1;
          gsap.fromTo(track, { xPercent: direction < 0 ? 0 : -33.333 }, { xPercent: direction < 0 ? -33.333 : 0, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.8 } });
        });

        // 6. Pinned horizontal scroll (desktop only; mobile keeps the native swipe row).
        if (!isMobile) {
          all("[data-hscroll]").forEach((wrap) => {
            const track = wrap.querySelector<HTMLElement>("[data-hscroll-track]");
            if (!track) return;
            const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
            if (distance() < 40) return; // everything already fits: leave it static
            gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: { trigger: wrap, start: "center center", end: () => `+=${distance()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
            });
          });
        }

        // Late-loading images/fonts change heights; re-measure once everything has settled.
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh, { once: true });
        document.fonts?.ready.then(refresh).catch(() => undefined);
        return () => window.removeEventListener("load", refresh);
      });
    },
    { scope, dependencies: deps, revertOnUpdate: true }
  );
}
