/**
 * Build the documentation animation from the hero avatar frame sequence.
 *
 * The site animates 197 JPEG frames in public/frames by scroll position. This
 * script samples those frames and writes one looping GIF for the README and
 * the architecture documentation, so the docs show the real animation instead
 * of a still image.
 *
 *   node scripts/generate-avatar-gif.mjs [step] [width] [output]
 *   npm run docs:animation
 */
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const FRAME_DIR = 'public/frames';
const step = Number(process.argv[2] || 8);
const width = Number(process.argv[3] || 320);
const output = process.argv[4] || 'docs/assets/hero-avatar-sequence.gif';

const all = (await readdir(FRAME_DIR)).filter((file) => file.endsWith('.jpg')).sort();
if (all.length === 0) {
  throw new Error(`No frames found in ${FRAME_DIR}`);
}

// Sample every nth frame so the GIF stays small enough for a README.
const picked = all.filter((_, index) => index % step === 0);

const frames = [];
for (const file of picked) {
  frames.push(await sharp(path.join(FRAME_DIR, file)).resize({ width }).png().toBuffer());
}

await mkdir(path.dirname(output), { recursive: true });
await sharp(frames, { join: { animated: true } })
  .gif({ loop: 0, delay: 90, colours: 128, effort: 10 })
  .toFile(output);

const meta = await sharp(output, { animated: true }).metadata();
console.log(
  `Animation written: ${output} (${meta.pages} of ${all.length} frames, ${meta.width}x${meta.pageHeight})`
);
