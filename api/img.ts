import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

// Register fonts for Vercel environment
const fontPath = path.join(process.cwd(), 'api', '_fonts', 'Roboto-Bold.ttf');

if (fs.existsSync(fontPath)) {
  try {
    registerFont(fontPath, { family: 'Roboto', weight: 'bold' });
  } catch (e) {
    console.error("Error registering font:", e);
  }
} else {
  console.warn("Font file NOT found at:", fontPath);
  // Try fallback for local development if needed
  const localFontPath = path.resolve('./api/_fonts/Roboto-Bold.ttf');
  if (fs.existsSync(localFontPath)) {
    registerFont(localFontPath, { family: 'Roboto', weight: 'bold' });
  }
}

export default async function handler(req: any, res: any) {
  let width = 800;
  let height = 600;

  // In Vercel, if we use rewrites, :dimensions might be in req.query.dimensions
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

  // Limit maximum dimensions to prevent memory issues
  width = Math.min(Math.max(1, width), 4000);
  height = Math.min(Math.max(1, height), 4000);

  const bg = (req.query.bg as string) || "cccccc";
  const color = (req.query.color as string) || "666666";
  const customText = req.query.text as string;
  const dimText = `${width}x${height}`;

  // Validate hex colors
  const isValidHex = (hex: string) => /^[0-9A-Fa-f]{3,6}$/.test(hex);
  const safeBg = isValidHex(bg) ? `#${bg}` : "#cccccc";
  const safeColor = isValidHex(color) ? `#${color}` : "#666666";

  try {
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = safeBg;
    ctx.fillRect(0, 0, width, height);

    // Draw text
    const fontSize = Math.min(width / 10, height / 5, 100);
    ctx.fillStyle = safeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px Roboto`;

    if (customText) {
      // Draw dimensions
      ctx.fillText(dimText, width / 2, height / 2 - fontSize * 0.6);

      // Draw custom text below
      const customFontSize = fontSize * 0.6;
      ctx.font = `normal ${customFontSize}px Roboto`;
      ctx.fillText(customText, width / 2, height / 2 + fontSize * 0.6);
    } else {
      // Draw only dimensions
      ctx.fillText(dimText, width / 2, height / 2);
    }

    // Add CORS headers so external sites (like WordPress) can load the image
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    // Send PNG buffer
    const buffer = canvas.toBuffer('image/png');
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Error generating image");
  }
}
