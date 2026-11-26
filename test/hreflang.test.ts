import { describe, expect, it } from "vitest";
import posts from "@/generated/blog-posts.json";
import { canonicalArticlePath, hreflangFor, reconcileTranslations } from "@/lib/hreflang";
import type { BlogPost } from "@/lib/blog";

const SITE = "https://zubairhussain.xyz";
const all = reconcileTranslations(posts as BlogPost[]);
const bySlug = new Map(all.map((p) => [p.slug, p]));

describe("hreflang annotations", () => {
  it("rewrites legacy /blog/ and own-site absolute URLs to /blogs/", () => {
    expect(canonicalArticlePath("/blog/x")).toBe("/blogs/x");
    expect(canonicalArticlePath("https://www.zubairhussain.xyz/blog/x/")).toBe("/blogs/x");
  });

  it("is self-referencing, reciprocal, canonical-only and has x-default", () => {
    let annotated = 0;
    for (const post of all) {
      const map = hreflangFor(post, SITE);
      if (!Object.keys(map).length) continue;
      annotated++;
      expect(map[post.lang]).toBe(`${SITE}/blogs/${post.slug}`);
      expect(map["x-default"]).toBeDefined();
      for (const [lang, url] of Object.entries(map)) {
        expect(url).toMatch(/^https:\/\/zubairhussain\.xyz\/blogs\/[a-z0-9-]+$/);
        if (lang === "x-default") continue;
        const target = bySlug.get(url.split("/").pop()!);
        expect(target, url).toBeDefined();
        expect(target!.lang).toBe(lang);
        expect(hreflangFor(target!, SITE)[post.lang]).toBe(map[post.lang]);
      }
    }
    expect(annotated).toBeGreaterThan(80);
  });
});
