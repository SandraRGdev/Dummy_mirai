import express from "express";
import { createServer as createViteServer } from "vite";
import { createCanvas } from "canvas";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Image generation route
  app.get(["/api/img", "/api/img/:dimensions"], (req, res) => {
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
      
      if (customText) {
        // Draw dimensions
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(dimText, width / 2, height / 2 - fontSize * 0.6);
        
        // Draw custom text below
        const customFontSize = fontSize * 0.6;
        ctx.font = `normal ${customFontSize}px sans-serif`;
        ctx.fillText(customText, width / 2, height / 2 + fontSize * 0.6);
      } else {
        // Draw only dimensions
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(dimText, width / 2, height / 2);
      }

      // Add CORS headers so external sites (like WordPress) can load the image
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
      
      // Send PNG stream
      const stream = canvas.createPNGStream();
      stream.pipe(res);
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).send("Error generating image");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
