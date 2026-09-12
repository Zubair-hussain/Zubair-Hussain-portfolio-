import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const evidenceDirectory = path.join(process.cwd(), "records", "evidence");
for (const name of ["coverage-summary", "verification-summary"]) {
  const svg = await readFile(path.join(evidenceDirectory, `${name}.svg`));
  await sharp(svg)
    .png()
    .toFile(path.join(evidenceDirectory, `${name}.png`));
}

console.log("Rendered PNG evidence images.");
