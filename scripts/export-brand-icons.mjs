import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Resize the approved artwork without redrawing or changing its colours.
const source = await loadImage(fileURLToPath(new URL("../assets/brand/icon-candidates/f-full-orbits.png", import.meta.url)));
const directory = new URL("../public/brand/", import.meta.url);
await mkdir(directory, { recursive: true });
for (const size of [16, 32, 48, 128, 180, 192]) {
  const canvas = createCanvas(size, size);
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  // Cleanly clip the surrounding white canvas corners for transparent exports.
  context.beginPath();
  context.roundRect(0, 0, size, size, size * 0.2);
  context.clip();
  context.drawImage(source, 0, 0, size, size);
  const bytes = canvas.toBuffer("image/png");
  await writeFile(new URL(`living-water-${size}.png`, directory), bytes);
  if (size === 128) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-labelledby="title desc"><title id="title">Élő Víz</title><desc id="desc">Vízcsepp három arany csillaggal és körbefutó ívekkel, a hármas angyali üzenet jelképe.</desc><image width="128" height="128" href="data:image/png;base64,${bytes.toString("base64")}"/></svg>\n`;
    await writeFile(new URL("../public/favicon.svg", import.meta.url), svg);
  }
  console.log(`Exported ${size}px icon (${bytes.length} bytes).`);
}
