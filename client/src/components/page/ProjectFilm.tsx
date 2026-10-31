import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { SectionHeading } from "@/components/page/SectionHeading";
import type { ProjectVideo } from "@/data/project-media";

/**
 * Film section for a project page: the walkthroughs sit in a horizontal, swipeable rail
 * (scroll-snap, arrow buttons, keyboard-scrollable). Native controls, no autoplay; posters mean
 * nothing heavy loads until someone presses play, and starting one film pauses the others.
 */
export function ProjectFilm({ name, videos, heading }: { name: string; videos: ProjectVideo[]; heading?: { eyebrow: string; title: string; copy: string } }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const portrait = videos.length === 1 && videos[0].orientation === "portrait";
  const copy = heading ?? { eyebrow: "In motion", title: `${name}, on film.`, copy: "Walk the streets and step inside. Renders and walkthroughs prepared by the AJIYA team." };

  const slideWidth = () => {
    const rail = railRef.current;
    const first = rail?.querySelector<HTMLElement>(".film-slide");
    return first ? first.offsetWidth + 16 : 0;
  };
  const go = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * slideWidth(), behavior: reduce ? "auto" : "smooth" });
  };
  const onScroll = () => {
    const rail = railRef.current;
    const width = slideWidth();
    if (rail && width) setActive(Math.min(videos.length - 1, Math.max(0, Math.round(rail.scrollLeft / width))));
  };
  const pauseOthers = (event: React.SyntheticEvent<HTMLDivElement>) => {
    railRef.current?.querySelectorAll("video").forEach((video) => { if (video !== event.target) video.pause(); });
  };
  const many = videos.length > 1;

  return (
    <section className="section-pad section-pad--tight bg-charcoal text-limestone film-section" aria-label={`${name} films`}>
      <div className="container">
        <SectionHeading light eyebrow={copy.eyebrow} title={copy.title} copy={copy.copy} />
      </div>
      <div className="film-rail-wrap">
        <div
          ref={railRef}
          className={`film-rail ${portrait ? "film-rail--portrait" : ""}`}
          role="region"
          aria-label={`${name} films — scroll sideways`}
          tabIndex={0}
          onScroll={onScroll}
          onPlayCapture={pauseOthers}
        >
          {videos.map((video, index) => (
            <figure key={video.src} className={`film-slide ${video.orientation === "portrait" ? "film-slide--portrait" : ""}`}>
              <video className="film-video" controls playsInline preload="metadata" poster={video.poster} aria-label={video.title}>
                <source src={video.src} type="video/mp4" />
                Your browser can’t play this video.
              </video>
              <figcaption>{String(index + 1).padStart(2, "0")} · {video.title}</figcaption>
            </figure>
          ))}
        </div>
        {many && (
          <div className="container film-controls">
            <button type="button" className="film-arrow" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous film"><ArrowLeft size={18} /></button>
            <span aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}</span>
            <button type="button" className="film-arrow" onClick={() => go(1)} disabled={active === videos.length - 1} aria-label="Next film"><ArrowRight size={18} /></button>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Silent looping film for the home page. Plays only while on screen, never for visitors who
 * prefer reduced motion or have Save-Data on, and always has a visible pause/play control.
 */
export function AmbientFilm({ video }: { video: ProjectVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) el.play().then(() => setPlaying(true)).catch(() => undefined);
        else { el.pause(); setPlaying(false); }
      },
      { threshold: 0.45 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) { userPaused.current = false; el.play().then(() => setPlaying(true)).catch(() => undefined); }
    else { userPaused.current = true; el.pause(); setPlaying(false); }
  };

  return (
    <div className="ambient-film">
      <video ref={ref} muted loop playsInline preload="none" poster={video.poster} aria-label={video.title}>
        <source src={video.src} type="video/mp4" />
      </video>
      <button type="button" className="ambient-film-toggle" onClick={toggle} aria-label={playing ? "Pause the film" : "Play the film"}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}
