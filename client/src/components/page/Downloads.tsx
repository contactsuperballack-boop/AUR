import { ArrowUpRight, Download } from "lucide-react";
import { SectionHeading } from "@/components/page/SectionHeading";
import { downloads } from "@/data/site";

const documents = [downloads.brochure, downloads.catalogue] as const;

/** Two compact download pills (brochure + catalogue) for hero and section footers. */
export function DownloadsCta({ compact = false }: { compact?: boolean }) {
  return (
    <div className="downloads-cta">
      {documents.map((doc) => (
        <a key={doc.href} href={doc.href} download={doc.filename} className={`brochure-cta ${compact ? "brochure-cta--compact" : ""}`}>
          <span className="brochure-cta-mark">↓</span>
          <span><small>Download the {doc.kind}</small><strong>{doc.title}</strong></span>
          <ArrowUpRight size={16} />
        </a>
      ))}
    </div>
  );
}

/** Full section with cover thumbnails, for pages where people are weighing options. */
export function DownloadsSection() {
  return (
    <section className="section-pad section-pad--tight bg-limestone" aria-labelledby="downloads-title">
      <div className="container">
        <SectionHeading eyebrow="Downloads" title="Take the details with you." copy="Both documents are free to download. Pricing is indicative; confirm availability and terms with the team." />
        <div className="downloads-grid">
          {documents.map((doc) => (
            <a key={doc.href} className="download-card" href={doc.href} download={doc.filename}>
              <span className="download-cover"><img src={doc.cover} alt="" width={doc.coverWidth} height={doc.coverHeight} loading="lazy" decoding="async" /></span>
              <span className="download-body">
                <span className="eyebrow">{doc.kind}</span>
                <strong>{doc.title}</strong>
                <span className="download-blurb">{doc.blurb}</span>
                <span className="download-meta">{doc.pages} pages · PDF · {doc.size}</span>
                <span className="download-action"><Download size={15} /> Download <ArrowUpRight size={14} /></span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
