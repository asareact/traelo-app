/**
 * Replace the Bubblewrap TWA's notification small icon with a MONOCHROME version
 * (white silhouette on transparent). Bubblewrap defaults it to the colored app
 * icon, which Android renders as a solid white square in the status bar (it only
 * uses the alpha channel). Run this, then rebuild + re-sign the APK.
 *
 *   node scripts/gen-twa-notif-icons.mjs
 */
import sharp from "sharp";
import path from "path";

const TWA_RES = "C:/Users/Abel/traelo-twa/app/src/main/res";

// Standard Android notification-icon sizes per density bucket.
const DENS = {
  "drawable-mdpi": 24,
  "drawable-hdpi": 36,
  "drawable-xhdpi": 48,
  "drawable-xxhdpi": 72,
  "drawable-xxxhdpi": 96,
};

// The Traelo mark (box + arrow), all white.
const svg = (n) => `<svg width="${n}" height="${n}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 20 L24 27 L24 44 L8 36 Z" fill="#FFFFFF"/>
  <path d="M40 20 L24 27 L24 44 L40 36 Z" fill="#FFFFFF"/>
  <path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#FFFFFF"/>
  <path d="M40 20 L32 16 L16 23 L24 27 Z" fill="#FFFFFF"/>
  <path d="M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9" fill="#FFFFFF"/>
</svg>`;

for (const [dir, size] of Object.entries(DENS)) {
  const inner = Math.round(size * 0.72); // transparent padding around the mark
  const logo = await sharp(Buffer.from(svg(inner))).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(TWA_RES, dir, "ic_notification_icon.png"));
  console.log("✓", dir, `${size}x${size}`);
}
