import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const feedUrl =
  process.env.BLOGGER_FEED_URL ||
  "https://zubair-xovato.blogspot.com/feeds/posts/summary?alt=json&max-results=1";
const cacheDirectory = path.join(process.cwd(), ".blogger-monitor-cache");
const fingerprintPath = path.join(cacheDirectory, "fingerprint.txt");

const response = await fetch(feedUrl, {
  headers: { Accept: "application/json", "User-Agent": "ZubairPortfolio-BuildMonitor/1.0" },
});

if (!response.ok) {
  throw new Error(`Blogger change check failed with HTTP ${response.status}.`);
}

const data = await response.json();
const fingerprintSource = JSON.stringify({
  updated: data.feed?.updated?.$t || "",
  totalResults: data.feed?.["openSearch$totalResults"]?.$t || "0",
  latestId: data.feed?.entry?.[0]?.id?.$t || "",
  latestUpdated: data.feed?.entry?.[0]?.updated?.$t || "",
});
const fingerprint = createHash("sha256").update(fingerprintSource).digest("hex");

let previous = "";
try {
  previous = (await readFile(fingerprintPath, "utf8")).trim();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const baseline = previous.length === 0;
const changed = !baseline && previous !== fingerprint;

await mkdir(cacheDirectory, { recursive: true });
await writeFile(fingerprintPath, `${fingerprint}\n`, "utf8");

if (process.env.GITHUB_OUTPUT) {
  await writeFile(
    process.env.GITHUB_OUTPUT,
    `baseline=${baseline}\nchanged=${changed}\ndigest=${fingerprint}\n`,
    { flag: "a" },
  );
}

console.log(
  baseline
    ? "Created the initial Blogger fingerprint."
    : changed
      ? "Blogger content changed; a rebuild is required."
      : "Blogger content has not changed.",
);
