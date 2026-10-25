import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { ArrowLink } from "@/components/page/ArrowLink";
import { BrochureCta } from "@/components/page/BrochureCta";
import { FeaturedProjects } from "@/components/page/FeaturedProjects";
import { AreaMarquee } from "@/components/page/AreaMarquee";
import { ImageFrame } from "@/components/page/ImageFrame";
import { Link } from "wouter";
import { PageShell } from "@/components/SiteChrome";
import { RecentInsights } from "@/components/page/RecentInsights";
import { RiseMark } from "@/components/page/RiseMark";
import { SectionHeading } from "@/components/page/SectionHeading";
import { Seo } from "@/components/page/Seo";
import { ServiceRowList } from "@/components/page/ServiceRowList";
import { assets, philosophy, trustReasons } from "@/data/site";
import { gsap, motionConditions, useGSAP } from "@/lib/motion";
import { useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Home() {
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroMediaRef = useRef<HTMLDivElement>(null);
  const quoteSectionRef = useRef<HTMLDivElement>(null);
  const quoteMarkRef = useRef<HTMLSpanElement>(null);
  const quoteTextRef = useRef<HTMLParagraphElement>(null);
  const quoteLineRef = useRef<HTMLSpanElement>(null);
  const philosophyGridRef = useScrollReveal<HTMLDivElement>(".philosophy-step", []);
  const investmentStepsRef = useScrollReveal<HTMLDivElement>(".investment-step", []);
  const whyGridRef = useScrollReveal<HTMLDivElement>(".why-item", []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(motionConditions, (context) => {
      const { isMobile, reduceMotion } = context.conditions as { isMobile: boolean; reduceMotion: boolean };

      // Hero parallax: the background media drifts down slower than scroll speed as the
      // hero scrolls past, giving it depth. This is a plain scroll-scrubbed transform (no
      // pin), which is safe on mobile too — only reduced motion gets the static fallback.
      if (heroMediaRef.current) {
        if (reduceMotion) {
          gsap.set(heroMediaRef.current, { scale: 1.03, y: 0 });
        } else {
          gsap.set(heroMediaRef.current, { scale: 1.06 });
          gsap.to(heroMediaRef.current, {
            y: "16%",
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }

      // Pinned quote: briefly holds the quote panel in view while the mark, copy, and
      // underline draw in, then releases. Pin is desktop-only — scroll-jacking via
      // position:fixed is the one pattern in this whole motion layer that's genuinely
      // unreliable on mobile Safari (see REDESIGN_SPRINT_PLAN.md), so mobile gets a plain,
      // non-pinned fade-in instead of nothing. Reduced motion skips both — the quote is still
      // fully readable either way, just without the choreography.
      if (quoteSectionRef.current && quoteMarkRef.current && quoteTextRef.current && quoteLineRef.current) {
        if (reduceMotion) {
          // no-op: leave the quote in its natural, fully-visible state
        } else if (isMobile) {
          gsap.from([quoteMarkRef.current, quoteTextRef.current, quoteLineRef.current], {
            autoAlpha: 0,
            y: 20,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: { trigger: quoteSectionRef.current, start: "top 80%" },
          });
        } else {
          gsap.timeline({
            scrollTrigger: {
              trigger: quoteSectionRef.current,
              start: "top top",
              end: "+=70%",
              scrub: 1,
              pin: true,
            },
          })
            .from(quoteMarkRef.current, { autoAlpha: 0, y: 32, duration: 1 })
            .from(quoteTextRef.current, { autoAlpha: 0, y: 24, duration: 1 }, "<0.1")
            .from(quoteLineRef.current, { scaleX: 0, transformOrigin: "left center", duration: 1 }, "<0.1");
        }
      }
    });

    // matchMedia's own revert (triggered by useGSAP's cleanup calling ctx.revert(), which
    // reverts everything created inside this scope, matchMedia included) handles teardown —
    // no separate cleanup needed here.
  }, []);

  return <PageShell context="AJIYA Urban Rise"><Seo title="Creating Opportunities. Building Lasting Value." description="AJIYA Urban Rise is an Abuja-based real-estate development, investment, property sales, management, and construction company." image={assets.heroFallback} />
    <section className="hero-section" ref={heroSectionRef}>
      <div className="hero-media brand-hero-bg" ref={heroMediaRef} />
      <div className="hero-overlay" />
      <div className="container relative z-10 flex min-h-[calc(100svh-76px)] flex-col justify-end pb-14 pt-36 md:pb-20 lg:min-h-[calc(100svh-76px)]">
        <div className="max-w-3xl animate-rise">
          <p className="eyebrow inline-flex items-center gap-2 text-limestone/70"><RiseMark />Property, place, possibility</p>
          <h1 className="hero-title">Creating opportunities.<br /><em>Building lasting value.</em></h1>
          <p className="hero-copy">AJIYA Urban Rise is shaping a more considered future for property and urban growth in Nigeria — one conversation, one place, one lasting opportunity at a time.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/projects" className="button button--cream">Explore our projects <ArrowUpRight size={16} /></Link><Link href="/contact" className="button button--ghost-light">Talk to an expert <ArrowRight size={16} /></Link></div><BrochureCta />
        </div>
        <div className="mt-16 flex items-end justify-between border-t border-limestone/25 pt-5 text-[0.66rem] uppercase tracking-[0.2em] text-limestone/55"><span>Abuja · Nigeria</span><a href="#about" className="inline-flex items-center gap-2 transition-colors hover:text-limestone">Scroll to explore <ArrowDown size={14} /></a><span className="hidden sm:inline">Est. for what’s next</span></div>
      </div>
    </section>

    <section id="about" className="section-pad bg-limestone">
      <div className="container grid gap-14 lg:grid-cols-[0.8fr_1.1fr] lg:gap-24">
        <div className="relative"><div className="vertical-label">01 / ABOUT AJIYA</div><div className="about-image-wrap"><ImageFrame parallax src={assets.signature} alt="A modern AJIYA townhouse with glass balconies and warm stone cladding at sunset" className="about-image" /><div className="about-inset" data-parallax="0.09"><ImageFrame parallax src={assets.urban} alt="Aerial view of an AJIYA estate with tree-lined streets and terraced homes" className="about-inset-frame" /></div><div className="about-stamp">Land<br /><span>to</span><br />legacy</div></div></div>
        <div className="flex flex-col justify-center"><SectionHeading eyebrow="A better beginning" title="Building more than properties." copy="AJIYA exists to make the path from opportunity to value feel clearer. We bring together development, sales, investment, management, and construction to create places that work for the people and futures inside them." /><div className="mt-10 grid gap-4 border-t border-charcoal/15 pt-6 sm:grid-cols-2"><div><p className="eyebrow text-charcoal/45">Our mission</p><p className="mt-3 max-w-sm text-[0.95rem] leading-7 text-charcoal/70">To become a leading real-estate company in Nigeria by providing affordable homes and valuable land investments.</p></div><div><p className="eyebrow text-charcoal/45">Our philosophy</p><p className="mt-3 font-display text-2xl leading-tight text-charcoal">Creating opportunities.<br />Building lasting value.<br />Leaving a legacy.</p></div></div><ArrowLink href="/about" >Discover our story</ArrowLink></div>
      </div>
      <div className="container mt-16 border-t border-charcoal/15 pt-8"><div className="grid gap-0 md:grid-cols-4" ref={philosophyGridRef}>{philosophy.map((item, index) => <div key={item.label} className="philosophy-step"><span className="eyebrow text-charcoal/40">0{index + 1}</span><h3>{item.label}</h3><p>{item.copy}</p>{index < philosophy.length - 1 && <ArrowDown className="philosophy-arrow md:hidden" size={18} />}</div>)}</div></div>
    </section>

    <section className="section-pad section-pad--tight bg-stone">
      <div className="container"><SectionHeading eyebrow="How we help" title="One perspective. Five ways forward." copy="From the first question to the finished place, our work is connected by a belief in clear thinking and lasting value." /><ServiceRowList /></div>
    </section>

    <section className="section-pad bg-charcoal text-limestone">
      <div className="container"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><SectionHeading light eyebrow="Selected developments" title="Places with a point of view." copy="Explore the developments that express AJIYA’s belief in opportunity, community, and the future of Abuja." /><ArrowLink href="/projects" light>View all projects</ArrowLink></div><FeaturedProjects /></div>
    </section>

    <section className="section-pad bg-limestone overflow-hidden"><div className="container grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24"><div className="lg:pt-12"><SectionHeading eyebrow="A view of urban growth" title="The future is not a skyline. It is a place people can belong to." copy="We see real estate as more than an asset class. It is opportunity, security, growth, community, and a foundation for legacy." /><div className="mt-10 grid grid-cols-2 gap-px bg-charcoal/10 border border-charcoal/10">{["Opportunity", "Security", "Growth", "Community"].map((item, i) => <div key={item} className="bg-limestone px-4 py-5 sm:px-6"><span className="eyebrow text-charcoal/40">0{i + 1}</span><p className="mt-3 font-display text-xl">{item}</p></div>)}</div></div><div className="urban-quote" ref={quoteSectionRef}><span className="urban-quote-mark" ref={quoteMarkRef}>“</span><p ref={quoteTextRef}>When the place is right, the next chapter feels possible.</p><span className="urban-quote-line" ref={quoteLineRef} /></div></div></section>

    <section className="section-pad bg-canopy text-limestone"><div className="container grid gap-12 lg:grid-cols-[0.75fr_1fr] lg:gap-24"><div><p className="eyebrow text-limestone/60">Invest with AJIYA</p><h2 className="display-title mt-5">Think beyond today.<br /><em>Build toward value.</em></h2><p className="mt-7 max-w-md text-[0.96rem] leading-7 text-limestone/70">We help investors see the property opportunity inside a location, a development, and the work that makes a future more valuable.</p><ArrowLink href="/invest" light>Explore investment opportunities</ArrowLink></div><div className="investment-panel"><div className="investment-number">01</div><div className="investment-track"><span className="investment-dot active" /><span className="investment-line" /><span className="investment-dot" /><span className="investment-line" /><span className="investment-dot" /><span className="investment-line" /><span className="investment-dot" /></div><div className="investment-steps" ref={investmentStepsRef}><div className="investment-step"><strong>Discover</strong><span>See the opportunity</span></div><div className="investment-step"><strong>Evaluate</strong><span>Understand the context</span></div><div className="investment-step"><strong>Invest</strong><span>Take a considered step</span></div><div className="investment-step"><strong>Build value</strong><span>Stay with the horizon</span></div></div></div></div></section>

    <section className="section-pad section-pad--tight bg-stone"><div className="container"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><SectionHeading eyebrow="Why choose us" title="Grounded enough to listen. Ambitious enough to build." copy="Our promise is not about making the loudest claim. It is about doing the work that makes opportunity feel more certain." /><div className="why-grid" ref={whyGridRef}>{trustReasons.map(({ index, title, copy }) => <div className="why-item" key={title}><span className="why-index">{index}</span><h3>{title}</h3><p>{copy}</p></div>)}</div></div></div></section>

    <section className="section-pad bg-limestone"><div className="container"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><SectionHeading eyebrow="Notes from the field" title="A considered view of what’s next." copy="Perspectives on property, investment, construction, and the places we are helping shape." /><ArrowLink href="/insights">Explore all insights</ArrowLink></div></div><RecentInsights /></section>

    <AreaMarquee tone="dark" /><section className="final-cta"><div className="final-cta-image brand-hero-bg" /><div className="final-cta-overlay" /><div className="container relative z-10 py-20 md:py-28"><p className="eyebrow text-limestone/65">Make the next step yours</p><h2 className="display-title mt-5 max-w-2xl text-limestone">Your next opportunity<br /><em>could start here.</em></h2><p className="mt-6 max-w-md text-[0.98rem] leading-7 text-limestone/65">Tell us what you are exploring. We’ll help you understand where the conversation can begin.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/contact" className="button button--cream">Talk to an expert <ArrowUpRight size={16} /></Link><a href="tel:+2349033734656" className="button button--ghost-light">Call AJIYA <ArrowRight size={16} /></a></div></div></section>
  </PageShell>;
}

export default Home;
