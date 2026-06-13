/**
 * Generate PWA/TWA icons from the Traelo logo mark (box + arrow), so the app is
 * installable on Android/iOS and PWABuilder/Bubblewrap can build a launcher icon.
 * Cream (#f0ebe0) background to match the cards. One-off; re-run if the logo changes.
 *
 *   node scripts/gen-icons.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const CREAM = { r: 240, g: 235, b: 224, alpha: 1 }; // #f0ebe0

function logoSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 20 L24 27 L24 44 L8 36 Z" fill="#A8431F"/>
  <path d="M40 20 L24 27 L24 44 L40 36 Z" fill="#C4522A"/>
  <path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#D5673D"/>
  <path d="M40 20 L32 16 L16 23 L24 27 Z" fill="#C4522A"/>
  <path d="M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9" fill="#00B5A0" stroke="#00B5A0" stroke-width="0.5" stroke-linejoin="round"/>
</svg>`;
}

/** A cream square of `size` with the logo composited at `ratio` of the side. */
async function makeIcon(size, ratio, outPath) {
  const logoSize = Math.round(size * ratio);
  const logo = await sharp(Buffer.from(logoSvg(logoSize))).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: CREAM },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outPath);
  console.log("✓", path.relative(root, outPath));
}

mkdirSync(path.join(root, "public", "icons"), { recursive: true });

// "any" icons — logo at 66% of the side.
await makeIcon(192, 0.66, path.join(root, "public", "icons", "icon-192.png"));
await makeIcon(512, 0.66, path.join(root, "public", "icons", "icon-512.png"));
// maskable — logo smaller (56%) so it survives Android's circular/rounded masks.
await makeIcon(512, 0.56, path.join(root, "public", "icons", "icon-maskable-512.png"));
// apple-touch-icon — Next serves src/app/apple-icon.png as the iOS home-screen icon.
await makeIcon(180, 0.62, path.join(root, "src", "app", "apple-icon.png"));
