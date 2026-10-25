import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarCheck, Check, Copy, Mail, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { contact } from "@/data/site";
import { getProjects, getProperties } from "@/lib/cms-client";
import {
  composeBookingMessage,
  formatVisitDate,
  INTEREST_CHOICES,
  mailtoLink,
  nextStep,
  NOT_SURE,
  questionFor,
  TIME_CHOICES,
  validateAnswer,
  whatsappLink,
  isVisit,
  type Answers,
  type StepId,
} from "@/lib/booking";

/**
 * Bottom-right booking assistant (replaces the old WhatsApp link, same pill look).
 *
 * It is a scripted guide, not a free-chat bot: it asks only the questions on the enquiry form,
 * validates each answer with the same rules, then composes the message for the visitor to send
 * on WhatsApp or by email. Nothing is stored or transmitted by the page itself, and nothing is
 * booked until the AJIYA team replies to confirm.
 */
export function BookingAssistant({ context }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<StepId[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const ctx = useMemo(() => ({ regarding: context }), [context]);
  const step = nextStep(answers, ctx);
  const relatedChoices = useMemo(() => {
    const names = [...getProjects().map((p) => p.name), ...getProperties().map((p) => p.name)];
    return [...new Set(names)].slice(0, 8);
  }, []);

  const message = step === null ? composeBookingMessage(answers, ctx) : null;

  // Keep the newest message in view, and move focus to the current control when the step changes.
  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    const target = panelRef.current?.querySelector<HTMLElement>("[data-assistant-focus]");
    target?.focus({ preventScroll: true });
  }, [open, step, history.length]);

  const close = () => {
    setOpen(false);
    fabRef.current?.focus();
  };

  const submit = (value: string) => {
    if (!step) return;
    const problem = validateAnswer(step, value, answers);
    if (problem) {
      setError(problem);
      return;
    }
    setAnswers((current) => ({ ...current, [step]: value.trim() }));
    setHistory((current) => [...current, step]);
    setDraft("");
    setError(null);
  };

  const back = () => {
    const last = history[history.length - 1];
    if (!last) return;
    const previous = answers[last];
    setAnswers((current) => {
      const { [last]: _removed, ...rest } = current;
      return rest;
    });
    setHistory((current) => current.slice(0, -1));
    // Text answers come back for editing; choice answers (chips) start clean.
    setDraft(last === "interest" || last === "related" || last === "time" ? "" : previous ?? "");
    setError(null);
  };

  const reset = () => {
    setAnswers({});
    setHistory([]);
    setDraft("");
    setError(null);
    setCopied(false);
  };

  const copy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Couldn’t copy automatically — select the message above and copy it.");
    }
  };

  const display = (id: StepId, value: string) => {
    if (id === "date") return formatVisitDate(value);
    if (id === "message" && value === "") return "No extra notes";
    return value;
  };

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(draft);
  };

  const chips: readonly string[] | null =
    step === "interest" ? INTEREST_CHOICES : step === "related" ? [...relatedChoices, NOT_SURE] : step === "time" ? TIME_CHOICES : null;

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="whatsapp-fab"
        aria-expanded={open}
        aria-controls="booking-assistant"
        aria-label={open ? "Close the booking assistant" : "Open the booking assistant to book an appointment"}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="whatsapp-fab-pulse" aria-hidden="true" />
        {open ? <X size={19} strokeWidth={1.6} /> : <MessageCircle size={19} strokeWidth={1.6} />}
        <span className="whatsapp-fab-copy"><strong>Book an appointment</strong><small>AJIYA assistant · Replies instantly</small></span>
        <ArrowUpRight size={15} strokeWidth={1.7} />
      </button>

      {open && (
        <div
          id="booking-assistant"
          ref={panelRef}
          className="assistant"
          role="dialog"
          aria-label="AJIYA booking assistant"
          onKeyDown={(event) => { if (event.key === "Escape") close(); }}
        >
          <header className="assistant-head">
            <span className="assistant-mark" aria-hidden="true"><CalendarCheck size={18} strokeWidth={1.6} /></span>
            <div>
              <strong>AJIYA assistant</strong>
              <small>Book a site visit or send an enquiry</small>
            </div>
            <button type="button" className="assistant-close" onClick={close} aria-label="Close the booking assistant"><X size={18} /></button>
          </header>

          <div className="assistant-log" ref={logRef} role="log" aria-live="polite">
            {history.map((id) => (
              <div key={id} className="assistant-turn">
                <p className="assistant-bubble assistant-bubble--bot">{questionFor(id, answers)}</p>
                <p className="assistant-bubble assistant-bubble--user">{display(id, answers[id] ?? "")}</p>
              </div>
            ))}
            <div className="assistant-turn">
              <p className="assistant-bubble assistant-bubble--bot">
                {step ? questionFor(step, answers) : "Thanks — your message is ready. Send it on WhatsApp or by email and the team will confirm a time with you."}
              </p>
              {step === null && message && <pre className="assistant-summary">{message.body}</pre>}
            </div>
          </div>

          <div className="assistant-input">
            {error && <p className="assistant-error" role="alert">{error}</p>}

            {step === null && message ? (
              <div className="assistant-actions">
                <a className="button button--dark" data-assistant-focus href={whatsappLink(message.body)} target="_blank" rel="noreferrer"><Send size={15} /> Send on WhatsApp</a>
                <a className="button button--ghost-dark" href={mailtoLink(message.subject, message.body)}><Mail size={15} /> Send by email</a>
                <button type="button" className="assistant-link" onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy message</>}</button>
              </div>
            ) : chips ? (
              <div className="assistant-chips" role="group" aria-label={step ? questionFor(step, answers) : undefined}>
                {chips.map((choice, index) => (
                  <button key={choice} type="button" className="assistant-chip" {...(index === 0 ? { "data-assistant-focus": "" } : {})} onClick={() => submit(choice)}>{choice}</button>
                ))}
              </div>
            ) : step === "date" ? (
              <form className="assistant-form" onSubmit={onFormSubmit}>
                <label className="sr-only" htmlFor="assistant-date">Preferred visit date</label>
                <input id="assistant-date" data-assistant-focus type="date" min={new Date().toISOString().slice(0, 10)} value={draft} onChange={(event) => setDraft(event.target.value)} required />
                <button type="submit" className="assistant-send" aria-label="Continue"><Send size={16} /></button>
              </form>
            ) : step === "message" ? (
              <form className="assistant-form assistant-form--tall" onSubmit={onFormSubmit}>
                <label className="sr-only" htmlFor="assistant-message">{isVisit(answers) ? "Anything we should know (optional)" : "Your message"}</label>
                <textarea id="assistant-message" data-assistant-focus rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={isVisit(answers) ? "Optional" : "Tell us what you’re looking for"} />
                <div className="assistant-form-actions">
                  {isVisit(answers) && <button type="button" className="assistant-link" onClick={() => submit("")}>Skip</button>}
                  <button type="submit" className="assistant-send" aria-label="Continue"><Send size={16} /></button>
                </div>
              </form>
            ) : step ? (
              <form className="assistant-form" onSubmit={onFormSubmit}>
                <label className="sr-only" htmlFor="assistant-text">{questionFor(step, answers)}</label>
                <input
                  id="assistant-text"
                  data-assistant-focus
                  type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
                  inputMode={step === "phone" ? "tel" : step === "email" ? "email" : undefined}
                  autoComplete={step === "name" ? "name" : step === "phone" ? "tel" : step === "email" ? "email" : "off"}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={step === "name" ? "Your full name" : step === "phone" ? "+234" : "you@example.com"}
                />
                <button type="submit" className="assistant-send" aria-label="Continue"><Send size={16} /></button>
              </form>
            ) : null}

            <div className="assistant-foot">
              {history.length > 0 && <button type="button" className="assistant-link" onClick={back}>Back</button>}
              {history.length > 0 && <button type="button" className="assistant-link" onClick={reset}><RotateCcw size={13} /> Start over</button>}
              <p>I only ask our standard enquiry questions. Nothing is booked until the team confirms. Prefer to talk? <a href={`tel:+${contact.whatsapp}`}>{contact.phoneDisplay}</a></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
