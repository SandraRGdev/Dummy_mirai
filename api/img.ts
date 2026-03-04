import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

// Register fonts for Vercel environment
// In Vercel, the files included via includeFiles are placed relative to the root or function.
// We try multiple paths to be sure.
const pathsToTry = [
  path.join(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
  path.join(__dirname, '..', 'fonts', 'Roboto-Bold.ttf'),
  path.join(__dirname, 'fonts', 'Roboto-Bold.ttf'),
  path.resolve('./fonts/Roboto-Bold.ttf')
];

let selectedFontPath = "";
for (const p of pathsToTry) {
  if (fs.existsSync(p)) {
    selectedFontPath = p;
    break;
  }
}

let fontError = "";
if (selectedFontPath) {
  try {
    registerFont(selectedFontPath, { family: 'Roboto', weight: 'bold' });
  } catch (e: any) {
    fontError = `Register error: ${e.message}`;
    console.error("Error registering font:", e);
  }
} else {
  fontError = "Font file NOT found";
  console.warn("Font file NOT found in any of:", pathsToTry);
}

export default async function handler(req: any, res: any) {
  let width = 800;
  let height = 600;

  const dimensionsParam = req.query.dimensions as string;

  if (dimensionsParam) {
    const dimMatch = dimensionsParam.match(/^(\d+)x(\d+)(?:\.[a-zA-Z]+)?$/);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
    }
  } else {
    width = parseInt(req.query.w as string) || 800;
    height = parseInt(req.query.h as string) || 600;
  }

  width = Math.min(Math.max(1, width), 4000);
  height = Math.min(Math.max(1, height), 4000);

  const bg = (req.query.bg as string) || "cccccc";
  const color = (req.query.color as string) || "666666";
  const customText = req.query.text as string;
  const dimText = `${width}x${height}`;

  const isValidHex = (hex: string) => /^[0-9A-Fa-f]{3,6}$/.test(hex);
  const safeBg = isValidHex(bg) ? `#${bg}` : "#cccccc";
  const safeColor = isValidHex(color) ? `#${color}` : "#666666";

  try {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = safeBg;
    ctx.fillRect(0, 0, width, height);

    const fontSize = Math.min(width / 10, height / 5, 100);
    ctx.fillStyle = safeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Explicitly use sans-serif as fallback if Roboto fails
    ctx.font = `bold ${fontSize}px Roboto, sans-serif`;

    if (customText) {
      ctx.fillText(dimText, width / 2, height / 2 - fontSize * 0.6);
      const customFontSize = fontSize * 0.6;
      ctx.font = `normal ${customFontSize}px Roboto, sans-serif`;
      ctx.fillText(customText, width / 2, height / 2 + fontSize * 0.6);
    } else {
      ctx.fillText(dimText, width / 2, height / 2);
    }

    // DEBUG: If font error exists, draw it at the top left
    if (fontError || (req.query.debug === 'true')) {
      ctx.font = '12px Courier New';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Error: ${fontError || 'None'}`, 10, 10);
      ctx.fillText(`Path: ${selectedFontPath || 'None'}`, 10, 25);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    const buffer = canvas.toBuffer('image/png');
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Error generating image");
  }
}
