import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile blog regression guards", () => {
  it("keeps article content and sidebars shrinkable inside the reader grid", () => {
    const page = readFileSync("src/app/blog/[slug]/page.tsx", "utf8");
    expect(page).toContain("grid min-w-0");
    expect(page).toContain('<article lang={post.lang} className="min-w-0">');
    expect(page).toContain('<aside className="min-w-0');
  });

  it("makes embedded content, code, and tables fit narrow screens", () => {
    const css = readFileSync("src/styles/globals.css", "utf8");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toMatch(/\.blog-content table \{[\s\S]*?overflow-x: auto/);
    expect(css).toMatch(/@media \(max-width: 639px\)/);
    expect(css).toMatch(/\.blog-content iframe \{\s*width: 100%/);
  });
});
