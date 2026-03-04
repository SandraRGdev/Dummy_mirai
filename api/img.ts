import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

// Register fonts for @napi-rs/canvas
const fontPath = path.join(process.cwd(), 'fonts', 'Roboto-Bold.ttf');
if (fs.existsSync(fontPath)) {
  try {
    GlobalFonts.registerFromPath(fontPath, 'Roboto');
  } catch (e) {
    console.error("Font registration failed:", e);
  }
}

export default async function handler(req: any, res: any) {
  try {
    let width = parseInt(req.query.w as string) || 800;
    let height = parseInt(req.query.h as string) || 600;

    const dimensionsParam = req.query.dimensions as string;
    if (dimensionsParam) {
      const dimMatch = dimensionsParam.match(/^(\d+)x(\d+)(?:\.[a-zA-Z]+)?$/);
      if (dimMatch) {
        width = parseInt(dimMatch[1], 10);
        height = parseInt(dimMatch[2], 10);
      }
    }

    width = Math.min(Math.max(1, width), 4000);
    height = Math.min(Math.max(1, height), 4000);

    const bg = (req.query.bg as string) || "cccccc";
    const color = (req.query.color as string) || "666666";
    const customText = req.query.text as string;

    const isValidHex = (hex: string) => /^[0-9A-Fa-f]{3,6}$/.test(hex);
    const safeBg = isValidHex(bg) ? `#${bg}` : "#cccccc";
    const safeColor = isValidHex(color) ? `#${color}` : "#666666";

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = safeBg;
    ctx.fillRect(0, 0, width, height);

    const fontSize = Math.min(width / 10, height / 5, 100);
    ctx.fillStyle = safeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // @napi-rs/canvas uses the font name registered
    ctx.font = `bold ${fontSize}px Roboto`;

    const dimText = `${width}x${height}`;
    if (customText) {
      ctx.fillText(dimText, width / 2, height / 2 - fontSize * 0.6);
      ctx.font = `normal ${fontSize * 0.6}px Roboto`;
      ctx.fillText(customText, width / 2, height / 2 + fontSize * 0.6);
    } else {
      ctx.fillText(dimText, width / 2, height / 2);
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    res.status(200).send(canvas.toBuffer('image/png'));
  } catch (error: any) {
    console.error("Image generation failed:", error);
    res.status(500).json({ error: error.message });
  }
}
