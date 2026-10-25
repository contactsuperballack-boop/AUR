import { ArrowUpRight } from "lucide-react";
import { CmsState } from "@/components/CmsState";
import { Link } from "wouter";
import { getInsights } from "@/lib/cms-client";
import { gsap, motionConditions, useGSAP } from "@/lib/motion";
import { useCmsResource } from "@/hooks/useCmsResource";
import { useRef } from "react";

export function RecentInsights() {
  const state = useCmsResource(() => getInsights(), []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll: pins the section and translates the card track by exactly the
  // amount it overflows the viewport, computed from the real rendered DOM rather than a
  // guessed card count — so this keeps working whether the CMS has 3 insights or 30.
  // Deferred until the CMS data has actually rendered (deps: [state.status]) since the track
  // has zero width before then. Skipped on mobile/reduced-motion — see the matching CSS
  // fallback (native swipe + scroll-snap) in index.css.
  useGSAP(() => {
    if (state.status !== "success") return;
    const mm = gsap.matchMedia();
    mm.add(motionConditions, (context) => {
      const { isMobile, reduceMotion } = context.conditions as { isMobile: boolean; reduceMotion: boolean };
      const section = sectionRef.current;
      const track = trackRef.current;
      if (isMobile || reduceMotion || !section || !track) return;

      const distance = track.scrollWidth - section.offsetWidth;
      if (distance <= 0) return; // track already fits — nothing to scroll, no pin needed

      gsap.to(track, {
        // Function-based values (not the closure-captured `distance` constant above, which is
        // only used for the initial "is there even anything to scroll" guard) — combined with
        // invalidateOnRefresh, these re-measure the real DOM on every ScrollTrigger.refresh()
        // (window resize, orientation change), so a browser resize doesn't leave the tween
        // animating to a stale, pre-resize distance.
        x: () => -(track.scrollWidth - section.offsetWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${track.scrollWidth - section.offsetWidth}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }, [state.status]);

  return (
    <div className="insight-scroll-section mt-14" ref={sectionRef}>
      <div className="insight-grid" ref={trackRef}>
        <CmsState state={state} emptyMessage="New perspectives are being prepared. Check back soon.">
          {(list) => [
            ...list.slice(0, 3).map((item) => (
              <Link href={`/insights/${item.slug}`} className="insight-card" key={item.documentId}>
                <div className="insight-card-top"><span className="eyebrow">{item.category}</span><ArrowUpRight size={18} /></div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <div className="insight-meta"><span>{new Date(item.publishDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span><span>{item.readTime}</span></div>
              </Link>
            )),
            <Link href="/insights" className="insight-card insight-card--cta" key="view-all">
              <span className="eyebrow text-limestone/60">Keep reading</span>
              <h3 className="font-display text-2xl">Explore every insight</h3>
              <span className="arrow-link arrow-link--light">View all insights <ArrowUpRight size={16} /></span>
            </Link>,
          ]}
        </CmsState>
      </div>
    </div>
  );
}
