import { ContactForm } from "@/components/page/ContactForm";
import { useState } from "react";

/**
 * Availability enquiry + site-visit request in one place, as tabs — used on project and
 * property detail pages so the conversion point lives where the buying decision happens,
 * pre-tagged with the right project/property for lead attribution.
 */
export function EnquiryPanel({ label, projectSlug, propertySlug }: { label: string; projectSlug?: string; propertySlug?: string }) {
  const [tab, setTab] = useState<"enquiry" | "visit">("enquiry");
  return <div className="enquiry-panel"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose how to get in touch"><button role="tab" aria-selected={tab === "enquiry"} className={`filter-button ${tab === "enquiry" ? "is-active" : ""}`} onClick={() => setTab("enquiry")} type="button">Request availability</button><button role="tab" aria-selected={tab === "visit"} className={`filter-button ${tab === "visit" ? "is-active" : ""}`} onClick={() => setTab("visit")} type="button">Book a site visit</button></div><div className="mt-8" role="tabpanel" key={tab}><ContactForm mode={tab} interestLabel={label} projectSlug={projectSlug} propertySlug={propertySlug} /></div></div>;
}
