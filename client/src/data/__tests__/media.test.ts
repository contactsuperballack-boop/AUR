import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { projectVideos } from "../project-media";
import { downloads } from "../site";

const pub = (rel: string) => fileURLToPath(new URL(`../../../public${rel}`, import.meta.url));
const content = (name: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`../../content/${name}.json`, import.meta.url)), "utf8"));

describe("project films", () => {
  it("point at files that exist", () => {
    for (const videos of Object.values(projectVideos)) {
      for (const video of videos) {
        expect(existsSync(pub(video.src))).toBe(true);
        expect(existsSync(pub(video.poster))).toBe(true);
      }
    }
  });
});

describe("content images", () => {
  const lists = [
    ["projects", (item: any) => item.heroImage?.url],
    ["properties", (item: any) => item.image?.url],
    ["insights", (item: any) => item.coverImage?.url],
  ] as const;

  it("every project, property and insight has an image that exists on disk", () => {
    for (const [name, pick] of lists) {
      for (const item of content(name)) {
        const url = pick(item);
        expect(url, `${name}/${item.slug} has no image`).toBeTruthy();
        if (url.startsWith("/")) expect(existsSync(pub(url)), `${url} missing`).toBe(true);
      }
    }
  });

  it("no image is shared between projects, between properties, or between insights", () => {
    for (const [name, pick] of lists) {
      const urls = content(name).map(pick);
      expect(new Set(urls).size, `${name} repeat an image`).toBe(urls.length);
    }
  });

  it("projects and properties do not reuse each other's pictures", () => {
    const urls = [...content("projects").map((i: any) => i.heroImage?.url), ...content("properties").map((i: any) => i.image?.url)];
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("downloads", () => {
  it("brochure and catalogue PDFs and their covers exist", () => {
    for (const doc of Object.values(downloads)) {
      expect(existsSync(pub(doc.href)), `${doc.href} missing`).toBe(true);
      expect(existsSync(pub(doc.cover)), `${doc.cover} missing`).toBe(true);
    }
  });
  it("the old website brochure has been removed", () => {
    expect(existsSync(pub("/ajiya-urban-rise-brochure.pdf"))).toBe(false);
  });
});
