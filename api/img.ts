import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

export default async function handler(req: any, res: any) {
  const debugInfo: any = {
    cwd: process.cwd(),
    dirname: __dirname,
    env: process.env.NODE_ENV,
    attemptedPaths: []
  };

  try {
    // 1. Try to find and register font
    const fontName = 'Roboto-Bold.ttf';
    const possibleDirs = [
      path.join(process.cwd(), 'fonts'),
      path.join(process.cwd(), 'api', 'fonts'),
      path.join(__dirname, '..', 'fonts'),
      path.join(__dirname, 'fonts'),
      '/var/task/fonts',
      '/var/task/api/fonts'
    ];

    let foundPath = "";
    for (const dir of possibleDirs) {
      const p = path.join(dir, fontName);
      debugInfo.attemptedPaths.push(p);
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      try {
        registerFont(foundPath, { family: 'RobotoCustom', weight: 'bold' });
        debugInfo.fontStatus = "Registered: " + foundPath;
      } catch (e: any) {
        debugInfo.fontStatus = "Register failed: " + e.message;
      }
    } else {
      debugInfo.fontStatus = "Font not found";
    }

    // 2. Parse params
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

    // 3. Create Canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = safeBg;
    ctx.fillRect(0, 0, width, height);

    const fontSize = Math.min(width / 10, height / 5, 100);
    ctx.fillStyle = safeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Choose font family based on status
    const fontFamily = foundPath ? 'RobotoCustom' : 'sans-serif';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    const dimText = `${width}x${height}`;
    if (customText) {
      ctx.fillText(dimText, width / 2, height / 2 - fontSize * 0.6);
      ctx.font = `normal ${fontSize * 0.6}px ${fontFamily}`;
      ctx.fillText(customText, width / 2, height / 2 + fontSize * 0.6);
    } else {
      ctx.fillText(dimText, width / 2, height / 2);
    }

    // 4. Debug overlay if requested
    if (req.query.debug === 'true') {
      ctx.font = '12px monospace';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const lines = [
        `Font: ${debugInfo.fontStatus}`,
        `CWD: ${debugInfo.cwd}`,
        `Dir: ${debugInfo.dirname}`,
        `Path: ${foundPath || 'NONE'}`
      ];
      lines.forEach((line, i) => ctx.fillText(line, 10, 10 + i * 15));
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(canvas.toBuffer('image/png'));

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    // If it crashes, return JSON with debug info to help me see why
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      debug: debugInfo
    });
  }
}
