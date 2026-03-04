import express from "express";
import { createServer as createViteServer } from "vite";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";

// Register fonts
const fontPath = path.join(process.cwd(), 'fonts', 'Roboto-Bold.ttf');
if (fs.existsSync(fontPath)) {
  try {
    GlobalFonts.registerFromPath(fontPath, 'Roboto');
  } catch (e) {
    console.warn("Could not register font:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get(["/api/img", "/api/img/:dimensions"], (req, res) => {
    try {
      let width = 800;
      let height = 600;

      if (req.params.dimensions) {
        const dimMatch = req.params.dimensions.match(/^(\d+)x(\d+)(?:\.[a-zA-Z]+)?$/);
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

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = safeBg;
      ctx.fillRect(0, 0, width, height);

      const fontSize = Math.min(width / 10, height / 5, 100);
      ctx.fillStyle = safeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `bold ${fontSize}px Roboto`;

      if (customText) {
        ctx.fillText(dimText, width / 2, height / 2 - fontSize * 0.6);
        const customFontSize = fontSize * 0.6;
        ctx.font = `normal ${customFontSize}px Roboto`;
        ctx.fillText(customText, width / 2, height / 2 + fontSize * 0.6);
      } else {
        ctx.fillText(dimText, width / 2, height / 2);
      }

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000");

      res.send(canvas.toBuffer('image/png'));
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).send("Error generating image");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
