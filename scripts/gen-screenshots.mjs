/**
 * Process the app screenshots for the PWA manifest (richer Android install UI).
 * Reads the source phone captures, re-encodes them (strips metadata, respects
 * EXIF orientation) into public/screenshots/, and prints their exact dimensions
 * so the manifest `sizes` match (Chrome rejects mismatched sizes).
 *
 *   node scripts/gen-screenshots.mjs
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOWNLOADS = "C:/Users/Abel/Downloads";
const sources = [
  "WhatsApp Image 2026-06-13 at 2.17.01 PM.jpeg",
  "WhatsApp Image 2026-06-13 at 2.17.02 PM.jpeg",
];

mkdirSync(path.join(root, "public", "screenshots"), { recursive: true });

let i = 1;
for (const name of sources) {
  const inPath = path.join(DOWNLOADS, name);
  if (!existsSync(inPath)) {
    console.error("FALTA:", inPath);
    process.exit(1);
  }
  const out = path.join(root, "public", "screenshots", `screenshot-${i}.jpg`);
  await sharp(inPath).rotate().jpeg({ quality: 82 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(`screenshot-${i}.jpg ${m.width}x${m.height}`);
  i++;
}
