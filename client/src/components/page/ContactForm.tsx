import { ArrowUpRight, Check } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { enquiryInterestOptions } from "@shared/enquiry";
import { submitEnquiry } from "@/lib/api-client";

export function ContactForm({
  interestLabel,
  projectSlug,
  propertySlug,
  serviceSlug,
  mode = "enquiry",
}: {
  interestLabel?: string;
  projectSlug?: string;
  propertySlug?: string;
  serviceSlug?: string;
  /** "visit" turns this into a site-visit request: adds preferred date/time, optional message. */
  mode?: "enquiry" | "visit";
}) {
  const isVisit = mode === "visit";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: enquiryInterestOptions[0] as string,
    message: "",
    preferredVisitDate: "",
    preferredVisitTime: "Morning",
    companyWebsite: "", // honeypot — real visitors never see or fill this
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);
    setFieldErrors({});

    const { preferredVisitDate, preferredVisitTime, ...rest } = form;
    const result = await submitEnquiry({
      ...rest,
      ...(isVisit
        ? {
            requestType: "site_visit" as const,
            preferredVisitDate,
            preferredVisitTime: preferredVisitTime as "Morning" | "Afternoon",
            interest: interestLabel ?? "Site visit",
            // The message is optional in visit mode, but the shared schema requires one —
            // so a short default is filled in rather than making the visitor write a note.
            message: form.message.trim().length >= 10 ? form.message : `Site visit request for ${interestLabel ?? "AJIYA Urban Rise"}.`,
          }
        : {}),
      sourcePage: window.location.pathname,
      relatedProjectSlug: projectSlug,
      relatedPropertySlug: propertySlug,
    });

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error.message);
      setFieldErrors(result.error.fieldErrors ?? {});
    }
  };

  if (status === "success") {
    return (
      <div className="form-success">
        <div className="success-icon"><Check size={20} /></div>
        <p className="eyebrow text-canopy">{isVisit ? "Visit request received" : "Enquiry received"}</p>
        <h2>Thank you, {form.name || "for reaching out"}.</h2>
        {isVisit
          ? <p>We have your request for <strong>{form.preferredVisitDate}</strong> ({form.preferredVisitTime.toLowerCase()}). This is a request, not a confirmed booking — our team will contact you to confirm the time.</p>
          : <p>We have your note and will follow up using the contact details you shared. Your enquiry context is: <strong>{form.interest}</strong>.</p>}
        <Link href="/" className="button button--dark">Return home <ArrowUpRight size={16} /></Link>
      </div>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      {(interestLabel || serviceSlug) && (
        <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-canopy">
          Regarding: {interestLabel ?? serviceSlug}
        </p>
      )}
      <div className="form-grid">
        <label>Full name<input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" />{fieldErrors.name && <span className="form-error">{fieldErrors.name[0]}</span>}</label>
        <label>Email address<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" />{fieldErrors.email && <span className="form-error">{fieldErrors.email[0]}</span>}</label>
        <label>Phone number<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+234" />{fieldErrors.phone && <span className="form-error">{fieldErrors.phone[0]}</span>}</label>
        {isVisit
          ? <><label>Preferred date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferredVisitDate} onChange={(event) => update("preferredVisitDate", event.target.value)} />{fieldErrors.preferredVisitDate && <span className="form-error">{fieldErrors.preferredVisitDate[0]}</span>}</label>
            <label>Preferred time<select value={form.preferredVisitTime} onChange={(event) => update("preferredVisitTime", event.target.value)}><option>Morning</option><option>Afternoon</option></select></label></>
          : <label>What are you interested in?<select value={form.interest} onChange={(event) => update("interest", event.target.value)}>{enquiryInterestOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}
      </div>
      <label className="mt-5 block">{isVisit ? "Anything we should know? (optional)" : "How can we help?"}<textarea required={!isVisit} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="Tell us a little about what you are exploring." rows={5} />{fieldErrors.message && <span className="form-error">{fieldErrors.message[0]}</span>}</label>
      {/* Honeypot — visually hidden off-screen and removed from tab order. Real visitors
          never see or reach it; a screen-reader user could technically encounter it via
          element-by-element browsing, but aria-hiding a focusable field is itself an ARIA
          violation (aria-hidden must not contain focusable descendants), so this relies on
          off-screen positioning + tabIndex alone, which is the standard valid pattern. */}
      <label className="sr-only" style={{ position: "absolute", left: "-9999px" }}>
        Company website<input tabIndex={-1} autoComplete="off" value={form.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} />
      </label>
      {status === "error" && errorMessage && <p className="form-error mt-4" role="alert">{errorMessage}</p>}
      <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs leading-5 text-charcoal/45">We only use your details to respond to this enquiry.</p>
        <button className="button button--dark" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : isVisit ? "Request site visit" : "Send enquiry"} <ArrowUpRight size={16} />
        </button>
      </div>
    </form>
  );
}
