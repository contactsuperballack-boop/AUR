import { describe, expect, it } from "vitest";
import {
  CmsNotFoundError,
  getInsights,
  getProjectBySlug,
  getProjects,
  getProperties,
  getServices,
  getTeamMembers,
  resolveMediaUrl,
} from "../cms-client";

describe("resolveMediaUrl", () => {
  it("returns an empty string for null or undefined", () => {
    expect(resolveMediaUrl(null)).toBe("");
    expect(resolveMediaUrl(undefined)).toBe("");
  });

  it("passes snapshot URLs through unchanged (absolute CMS/CDN or local /images paths)", () => {
    expect(resolveMediaUrl("/images/ajiya-urban-rise.jpg")).toBe("/images/ajiya-urban-rise.jpg");
    expect(resolveMediaUrl("https://cdn.example.com/x.jpg")).toBe("https://cdn.example.com/x.jpg");
  });
});

describe("static content getters", () => {
  it("returns services, projects and team members in sortOrder", () => {
    for (const list of [getServices(), getProjects(), getTeamMembers()]) {
      expect(list.length).toBeGreaterThan(0);
      const orders = list.map((item) => item.sortOrder);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it("returns insights newest first", () => {
    const dates = getInsights().map((item) => item.publishDate);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("filters properties by category and treats All as unfiltered", () => {
    const all = getProperties();
    expect(getProperties({ category: "All" })).toHaveLength(all.length);
    const land = getProperties({ category: "Land" });
    expect(land.every((item) => item.category === "Land")).toBe(true);
  });

  it("throws CmsNotFoundError for an unknown slug", () => {
    expect(() => getProjectBySlug("does-not-exist")).toThrow(CmsNotFoundError);
  });
});
