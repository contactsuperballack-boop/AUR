import { toEmbedUrl } from "@/components/page/toEmbedUrl";

export function VideoEmbed({ url, title }: { url?: string; title: string }) {
  const src = toEmbedUrl(url);
  if (!src) return null;
  return <div className="video-embed"><iframe src={src} title={title} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>;
}
