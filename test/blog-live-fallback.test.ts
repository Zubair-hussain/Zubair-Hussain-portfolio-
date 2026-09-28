import { afterEach, describe, expect, it, vi } from "vitest";
import { getBlogPageData, getPostBySlug } from "../src/lib/blog";

describe("Blogger live route fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("serves a new slug before the generated snapshot is rebuilt", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        feed: {
          entry: [
            {
              title: { $t: "A newly published article" },
              content: {
                $t: `<!-- PORTFOLIO-CONTENT:en
                TITLE: A newly published portfolio article
                SLUG: just-published-live-fallback
                SEO_DESCRIPTION: This post is available before the next deployment.
                ---
                <article><p>Fresh Blogger content.</p></article>
                END PORTFOLIO-CONTENT -->`,
              },
              published: { $t: "2026-09-28T20:20:31.995Z" },
              link: [
                {
                  rel: "alternate",
                  href: "https://example.blogspot.com/2026/09/just-published-live-fallback.html",
                },
              ],
            },
          ],
        },
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const metadataPost = await getPostBySlug("just-published-live-fallback");
    const pageData = await getBlogPageData("just-published-live-fallback");

    expect(metadataPost).toMatchObject({
      slug: "just-published-live-fallback",
      title: "A newly published portfolio article",
    });
    expect(pageData.post?.contentHtml).toContain("Fresh Blogger content.");
    expect(pageData.summaries[0].slug).toBe("just-published-live-fallback");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
