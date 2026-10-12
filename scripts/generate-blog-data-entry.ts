import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchBloggerPostsForBuild } from "@/lib/blog";

const posts = await fetchBloggerPostsForBuild();

if (posts.length === 0) {
  throw new Error(
    "Blogger returned no posts. Refusing to replace the static blog dataset.",
  );
}

const outputDirectory = path.join(process.cwd(), "src", "generated");
const outputPath = path.join(outputDirectory, "blog-posts.json");

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");

console.log(`Generated ${posts.length} static blog article(s) at ${outputPath}`);
