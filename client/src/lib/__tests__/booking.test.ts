import { describe, expect, it } from "vitest";
import {
  applicableSteps,
  composeBookingMessage,
  mailtoLink,
  nextStep,
  validateAnswer,
  VISIT_OPTION,
  whatsappLink,
} from "../booking";

describe("booking assistant flow", () => {
  it("asks only the enquiry questions, starting with interest", () => {
    expect(nextStep({})).toBe("interest");
  });

  it("adds the project, date and time questions for a site visit", () => {
    expect(applicableSteps({ interest: VISIT_OPTION })).toEqual(["interest", "related", "date", "time", "name", "phone", "email", "message"]);
  });

  it("skips the project question when the page already supplies context", () => {
    expect(applicableSteps({ interest: VISIT_OPTION }, { regarding: "Signature Estate" })).not.toContain("related");
  });

  it("does not ask for a date on a plain enquiry", () => {
    expect(applicableSteps({ interest: "Construction" })).toEqual(["interest", "name", "phone", "email", "message"]);
  });

  it("finishes (null) once every applicable step is answered", () => {
    const answers = { interest: "Construction", name: "Ada", phone: "+2348012345678", email: "a@b.co", message: "Need a quote please" };
    expect(nextStep(answers)).toBeNull();
  });

  it("treats a skipped optional visit message as answered", () => {
    const answers = { interest: VISIT_OPTION, related: "Not sure yet", date: "2030-01-01", time: "Morning", name: "Ada", phone: "+2348012345678", email: "a@b.co", message: "" };
    expect(nextStep(answers)).toBeNull();
  });
});

describe("validateAnswer", () => {
  const now = new Date(2026, 9, 25);
  it("applies the same rules as the enquiry form", () => {
    expect(validateAnswer("name", "A", {})).toBe("Enter your full name.");
    expect(validateAnswer("phone", "123", {})).toBe("Enter a valid phone number.");
    expect(validateAnswer("phone", "+234 903 373 4656", {})).toBeNull();
    expect(validateAnswer("email", "not-an-email", {})).toBe("Enter a valid email address.");
    expect(validateAnswer("email", "ada@example.com", {})).toBeNull();
  });
  it("requires a message of 10+ characters except an optional visit note", () => {
    expect(validateAnswer("message", "short", { interest: "Land" })).toMatch(/at least 10/);
    expect(validateAnswer("message", "", { interest: VISIT_OPTION })).toBeNull();
  });
  it("rejects past visit dates and accepts today", () => {
    expect(validateAnswer("date", "2026-10-24", {}, now)).toBe("Choose today or a future date.");
    expect(validateAnswer("date", "2026-10-25", {}, now)).toBeNull();
  });
});

describe("composeBookingMessage", () => {
  const visit = { interest: VISIT_OPTION, related: "Signature Estate", date: "2030-03-05", time: "Afternoon", name: "Ada Obi", phone: "+2348012345678", email: "ada@example.com", message: "" };
  it("composes a site-visit request with the preferred slot", () => {
    const { subject, body } = composeBookingMessage(visit);
    expect(subject).toBe("Site visit request — Signature Estate");
    expect(body).toContain("Name: Ada Obi");
    expect(body).toContain("Preferred visit:");
    expect(body).toContain("Afternoon");
    expect(body).not.toContain("Message:");
  });
  it("builds working WhatsApp and mailto links", () => {
    const { subject, body } = composeBookingMessage(visit);
    expect(whatsappLink(body)).toMatch(/^https:\/\/wa\.me\/2349033734656\?text=/);
    expect(decodeURIComponent(whatsappLink(body).split("text=")[1])).toBe(body);
    expect(mailtoLink(subject, body)).toMatch(/^mailto:hello@ajiyaurbanrise\.com\?subject=/);
  });
});
