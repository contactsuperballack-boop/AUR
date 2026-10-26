import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { SectionHeading } from "@/components/page/SectionHeading";
import type { ProjectVideo } from "@/data/project-media";

/**
 * "In motion" section for a project page: native, accessible controls (no autoplay), poster
 * images so nothing heavy loads until the visitor presses play, and thumbnails when a project
 * has several films.
 */
export function ProjectFilm({ name, videos }: { name: string; videos: ProjectVideo[] }) {
  const [index, setIndex] = useState(0);
  const [userPicked, setUserPicked] = useState(false);
  const current = videos[index];
  const portrait = current.orientation === "portrait";
  return (
    <section className="section-pad section-pad--tight bg-charcoal text-limestone film-section" aria-label={`${name} films`}>
      <div className="container">
        <SectionHeading light eyebrow="In motion" title={`${name}, on film.`} copy="Walk the streets and step inside. Renders and walkthroughs prepared by the AJIYA team." />
        <div className={`film-stage ${portrait ? "film-stage--portrait" : ""}`}>
          <video
            key={current.src}
            className="film-video"
            controls
            playsInline
            preload="metadata"
            poster={current.poster}
            autoPlay={userPicked}
            aria-label={current.title}
          >
            <source src={current.src} type="video/mp4" />
            Your browser can’t play this video.
          </video>
          {videos.length > 1 && (
            <div className="film-thumbs" role="group" aria-label="Choose a film">
              {videos.map((video, i) => (
                <button key={video.src} type="button" className={`film-thumb ${i === index ? "is-active" : ""}`} aria-pressed={i === index} onClick={() => { setIndex(i); setUserPicked(true); }}>
                  <img src={video.poster} alt="" loading="lazy" decoding="async" width={320} height={180} />
                  <span>{String(i + 1).padStart(2, "0")} · {video.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
