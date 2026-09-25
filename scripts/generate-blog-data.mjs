import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "portfolio-blog-"));
const bundlePath = path.join(temporaryDirectory, "generate-blog-data.mjs");

try {
  await build({
    entryPoints: [path.join(projectRoot, "scripts", "generate-blog-data-entry.ts")],
    outfile: bundlePath,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    alias: { "@": path.join(projectRoot, "src") },
    logLevel: "warning",
  });

  await import(`${pathToFileURL(bundlePath).href}?generated=${Date.now()}`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
