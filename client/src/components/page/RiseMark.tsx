
/**
 * A small custom brand mark (three ascending bars, echoing "Urban Rise") for signature spots
 * only — the hero eyebrow, for now. Deliberately not a replacement for lucide-react, which
 * stays as-is for ordinary UI icons (arrows, pins, checks); this is a one-off accent, not the
 * start of a parallel icon system.
 */
export function RiseMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 18 14" width="14" height="11" fill="none" className={className} aria-hidden="true"><rect x="0" y="9" width="3" height="5" fill="currentColor" /><rect x="7.5" y="5" width="3" height="9" fill="currentColor" /><rect x="15" y="0" width="3" height="14" fill="currentColor" /></svg>;
}
