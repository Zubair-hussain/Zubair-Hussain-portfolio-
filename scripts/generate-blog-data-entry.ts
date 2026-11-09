import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchBloggerPostsForBuild } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

const freshPosts = await fetchBloggerPostsForBuild();

if (freshPosts.length === 0) {
  throw new Error(
    "Blogger returned no posts. Refusing to replace the static blog dataset.",
  );
}

const outputDirectory = path.join(process.cwd(), "src", "generated");
const outputPath = path.join(outputDirectory, "blog-posts.json");

async function readExistingPosts(): Promise<BlogPost[]> {
  try {
    const raw = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BlogPost[]) : [];
  } catch {
    return [];
  }
}

// Blogger's feed can temporarily omit older entries. Keep the checked-in
// snapshot as an archive so a successful refresh can never turn established
// article URLs into 404s. Fresh versions win when the same translation exists.
const existingPosts = await readExistingPosts();
const postsBySourceAndLanguage = new Map<string, BlogPost>();

for (const post of existingPosts) {
  postsBySourceAndLanguage.set(`${post.sourceUrl}|${post.lang}`, post);
}
for (const post of freshPosts) {
  postsBySourceAndLanguage.set(`${post.sourceUrl}|${post.lang}`, post);
}

const posts = [...postsBySourceAndLanguage.values()]
  .sort((a, b) => Date.parse(b.isoDate) - Date.parse(a.isoDate))
  .map((post, index) => ({
    ...post,
    tags:
      index === 0
        ? [
            "Most Recent",
            "Trending",
            ...post.tags.filter(
              (tag) => tag !== "Most Recent" && tag !== "Trending",
            ).slice(0, 1),
          ]
        : post.tags.filter(
            (tag) => tag !== "Most Recent" && tag !== "Trending",
          ),
    trending: index === 0,
  }));

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");

console.log(
  `Generated ${posts.length} static blog article(s) ` +
    `(${freshPosts.length} fresh, ${posts.length - freshPosts.length} archived) at ${outputPath}`,
);
