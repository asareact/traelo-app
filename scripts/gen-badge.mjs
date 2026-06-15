/**
 * Generate the monochrome notification "badge" (the small status-bar icon).
 * Android only uses the ALPHA channel of this icon, so it must be a white
 * silhouette on transparent — a full-color icon renders as a solid white square.
 *
 *   node scripts/gen-badge.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SIZE = 96;
const INNER = 84; // fill most of the icon so it's not a tiny dot in the status bar

// The Traelo mark (box + arrow), all white.
const svg = `<svg width="${INNER}" height="${INNER}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 20 L24 27 L24 44 L8 36 Z" fill="#FFFFFF"/>
  <path d="M40 20 L24 27 L24 44 L40 36 Z" fill="#FFFFFF"/>
  <path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#FFFFFF"/>
  <path d="M40 20 L32 16 L16 23 L24 27 Z" fill="#FFFFFF"/>
  <path d="M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9" fill="#FFFFFF"/>
</svg>`;

const logo = await sharp(Buffer.from(svg)).png().toBuffer();
await sharp({
  create: {
    width: SIZE,
    height: SIZE,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: logo, gravity: "center" }])
  .png()
  .toFile(path.join(root, "public", "icons", "badge-mono.png"));

console.log("✓ public/icons/badge-mono.png");
