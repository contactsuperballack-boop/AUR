import { enquiryInterestOptions } from "@shared/enquiry";
import { contact } from "@/data/site";

/**
 * Pure logic for the booking assistant: which preset question comes next, how each answer is
 * validated, and how the answers become a message for WhatsApp or email. Kept free of React so
 * it is unit-testable (see __tests__/booking.test.ts).
 *
 * The questions are exactly the fields of the site's enquiry form (shared/enquiry.ts): interest,
 * related project/property, preferred visit date and time, name, phone, email and message. The
 * assistant never invents other questions and never answers free text.
 */

export const VISIT_OPTION = "Book a site visit";
export const INTEREST_CHOICES: readonly string[] = [VISIT_OPTION, ...enquiryInterestOptions];
export const TIME_CHOICES = ["Morning", "Afternoon"] as const;
export const NOT_SURE = "Not sure yet";

/** Interests where knowing the specific development/property helps the team respond. */
const NEEDS_RELATED = new Set(["Buy Property", "Land", "Investment"]);

export type StepId = "interest" | "related" | "date" | "time" | "name" | "phone" | "email" | "message";
export type Answers = Partial<Record<StepId, string>>;
export interface BookingContext {
  /** Page-level context (e.g. the project being viewed). When set, the "related" question is skipped. */
  regarding?: string;
}

export const isVisit = (answers: Answers) => answers.interest === VISIT_OPTION;

export function applicableSteps(answers: Answers, ctx: BookingContext = {}): StepId[] {
  const steps: StepId[] = ["interest"];
  const visit = isVisit(answers);
  if (!ctx.regarding && answers.interest && (visit || NEEDS_RELATED.has(answers.interest))) steps.push("related");
  if (visit) steps.push("date", "time");
  steps.push("name", "phone", "email", "message");
  return steps;
}

/** The next unanswered step, or null when every applicable question has been answered. */
export function nextStep(answers: Answers, ctx: BookingContext = {}): StepId | null {
  return applicableSteps(answers, ctx).find((step) => answers[step] === undefined) ?? null;
}

export function questionFor(step: StepId, answers: Answers): string {
  switch (step) {
    case "interest": return "Hello, I’m the AJIYA assistant. I can take an enquiry or request a site visit for you. What would you like help with?";
    case "related": return "Which development or property is this about?";
    case "date": return "Which date would suit you for the visit?";
    case "time": return "Would you prefer the morning or the afternoon?";
    case "name": return "What’s your full name?";
    case "phone": return "What’s the best phone number to reach you on?";
    case "email": return "And your email address?";
    case "message": return isVisit(answers) ? "Anything we should know before your visit? You can skip this." : "How can we help? A line or two is plenty.";
  }
}

const localToday = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

/** Mirrors the rules and wording of shared/enquiry.ts so the assistant and the form agree. */
export function validateAnswer(step: StepId, raw: string, answers: Answers, now = new Date()): string | null {
  const value = raw.trim();
  switch (step) {
    case "name":
      return value.length < 2 ? "Enter your full name." : value.length > 120 ? "Please use a shorter name." : null;
    case "phone":
      return value.replace(/\D/g, "").length >= 7 && /^[+()\d][\d\s()+-]{5,28}$/.test(value) ? null : "Enter a valid phone number.";
    case "email":
      return value.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? null : "Enter a valid email address.";
    case "date":
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a valid date.";
      return value < localToday(now) ? "Choose today or a future date." : null;
    case "message":
      if (value.length > 2000) return "Please keep it under 2,000 characters.";
      if (isVisit(answers) && value === "") return null;
      return value.length < 10 ? "Tell us a little more — at least 10 characters." : null;
    default:
      return value ? null : "Please choose an option.";
  }
}

export function formatVisitDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function composeBookingMessage(answers: Answers, ctx: BookingContext = {}): { subject: string; body: string } {
  const visit = isVisit(answers);
  const related = answers.related && answers.related !== NOT_SURE ? answers.related : ctx.regarding;
  const lines = [
    visit ? "Hello AJIYA Urban Rise, I’d like to request a site visit." : "Hello AJIYA Urban Rise, I’d like to make an enquiry.",
    "",
    `Name: ${answers.name ?? ""}`,
    `Phone: ${answers.phone ?? ""}`,
    `Email: ${answers.email ?? ""}`,
    `Interested in: ${visit ? "Site visit" : answers.interest ?? ""}`,
  ];
  if (related) lines.push(`Regarding: ${related}`);
  if (visit && answers.date) lines.push(`Preferred visit: ${formatVisitDate(answers.date)}, ${answers.time ?? "Morning"}`);
  if (answers.message?.trim()) lines.push("", "Message:", answers.message.trim());
  lines.push("", "Sent via the AJIYA website assistant. Please confirm availability.");
  const subject = visit ? `Site visit request${related ? ` — ${related}` : ""}` : `Enquiry — ${answers.interest ?? "General"}${related ? ` (${related})` : ""}`;
  return { subject, body: lines.join("\n") };
}

export const whatsappLink = (body: string) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(body)}`;
export const mailtoLink = (subject: string, body: string) =>
  `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, "\r\n"))}`;
