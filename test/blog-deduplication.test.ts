import { afterEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "../src/lib/blog";
import {
  getAllPosts,
  getAllPostSummaries,
  getRelatedPosts,
} from "../src/lib/blog";

describe("Blogger source and translation deduplication", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows one index card per Blogger source while retaining translation routes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          feed: {
            entry: [
              {
                title: { $t: "One source article" },
                content: {
                  $t: `<!-- PORTFOLIO-CONTENT:en
                TITLE: Original article
                SLUG: original-article
                ---
                <article><p>Unique English content.</p></article>
                END PORTFOLIO-CONTENT -->
                <!-- PORTFOLIO-CONTENT:de
                TITLE: Übersetzter Artikel
                SLUG: original-article-de
                ---
                <article><p>Eindeutiger deutscher Inhalt.</p></article>
                END PORTFOLIO-CONTENT -->`,
                },
                published: { $t: "2026-09-10T10:00:00.000Z" },
                link: [
                  {
                    rel: "alternate",
                    href: "https://example.blogspot.com/original.html",
                  },
                ],
              },
            ],
          },
        }),
      })),
    );

    const posts = await getAllPosts();
    const summaries = await getAllPostSummaries();

    expect(posts.map((post) => post.slug)).toEqual([
      "original-article",
      "original-article-de",
    ]);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      slug: "original-article",
      lang: "en",
    });
    expect(summaries[0].translations).toEqual([
      { lang: "de", url: "/blog/original-article-de" },
    ]);
  });

  it("does not recommend another translation or duplicate of the current source", () => {
    const base: Omit<BlogPost, "slug" | "title" | "url" | "sourceUrl"> = {
      seoTitle: "",
      excerpt: "",
      seoDescription: "",
      contentHtml: "",
      tags: ["Web"],
      seoKeywords: [],
      readTime: "1 min",
      date: "Sep 10, 2026",
      isoDate: "",
      isoUpdated: "",
      image: null,
      lang: "en",
      translations: [],
      trending: false,
    };
    const current: BlogPost = {
      ...base,
      lang: "de",
      slug: "article-de",
      title: "Deutsch",
      url: "/blog/article-de",
      sourceUrl: "https://blog.example/article",
    };
    const candidates: BlogPost[] = [
      {
        ...base,
        slug: "article",
        title: "English",
        url: "/blog/article",
        sourceUrl: current.sourceUrl,
      },
      {
        ...base,
        slug: "other",
        title: "Other",
        url: "/blog/other",
        sourceUrl: "https://blog.example/other",
      },
      {
        ...base,
        slug: "other-copy",
        title: "Other copy",
        url: "/blog/other-copy",
        sourceUrl: "https://blog.example/other",
      },
    ];

    expect(getRelatedPosts(current, candidates)).toEqual([candidates[1]]);
  });
});
