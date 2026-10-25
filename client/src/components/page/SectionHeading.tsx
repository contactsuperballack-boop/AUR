
export function SectionHeading({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <div className="flex items-center gap-3"><span className="section-rule" /> <span className="eyebrow">{eyebrow}</span></div>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}
