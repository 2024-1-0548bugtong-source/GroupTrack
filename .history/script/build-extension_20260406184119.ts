/**
 * Post-build script for GroupTrack Chrome Extension
 * - Copies manifest.json into dist-extension/
 * - Generates simple placeholder icons if not present
 */


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.resolve(root, "dist-extension");
const extDir = path.resolve(root, "extension");

// Ensure dist-extension/icons folder exists
const iconsDir = path.join(dist, "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}


// Copy manifest.json
fs.copyFileSync(
  path.join(extDir, "manifest.json"),
  path.join(dist, "manifest.json")
);
console.log("✓ Copied manifest.json");

// Copy background.js from dist-extension (built by Vite) if exists
const builtBg = path.join(dist, "background.js");
if (fs.existsSync(builtBg)) {
  console.log("✓ background.js present");
} else {
  console.warn("⚠ background.js missing in dist-extension. Build may have failed.");
}

// Keep Vite extension output untouched: index.html/assets are already emitted
// by `vite build --config vite.config.extension.ts`.
const extIndex = path.join(dist, "index.html");
if (fs.existsSync(extIndex)) {
  console.log("✓ index.html present");
} else {
  console.warn("⚠ index.html missing in dist-extension. Build may have failed.");
}

// Generate minimal SVG-based placeholder icons if they don't exist
function createPlaceholderIcon(size: number, filePath: string) {
  if (fs.existsSync(filePath)) {
    console.log(`✓ Icon exists: ${path.basename(filePath)}`);
    return;
  }

  // Create a tiny 1x1 PNG (smallest valid PNG) as placeholder
  // Users should replace these with real icons
  const canvas = Buffer.alloc(0);

  // Minimal valid PNG for placeholder (magenta-colored pixel)
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  ]);

  // Write a note file instead — user should provide real icons
  const notePath = filePath.replace(".png", ".txt");
  fs.writeFileSync(
    notePath,
    `Replace this with a ${size}x${size} PNG icon named icon-${size}.png`
  );
  console.log(`⚠ Created placeholder note for icon-${size}.png — replace with real icon`);
}

// Check for icons and create notes if missing
[16, 48, 128].forEach((size) => {
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  const srcIcon = path.join(extDir, "icons", `icon-${size}.png`);
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, iconPath);
    console.log(`✓ Copied icon-${size}.png`);
  } else {
    createPlaceholderIcon(size, iconPath);
  }
});

console.log("\n✅ Extension build complete! Load dist-extension/ in chrome://extensions");
