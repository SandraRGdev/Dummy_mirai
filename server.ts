import express from "express";
import { createServer as createViteServer } from "vite";

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
        const rawDim = req.params.dimensions.split('.')[0];
        const dimMatch = rawDim.match(/^(\d+)x(\d+)$/);
        if (dimMatch) {
          width = parseInt(dimMatch[1], 10);
          height = parseInt(dimMatch[2], 10);
        }
      } else {
        width = parseInt(req.query.w as string) || 800;
        height = parseInt(req.query.h as string) || 600;
      }

      const bg = (req.query.bg as string) || "cccccc";
      const color = (req.query.color as string) || "666666";
      const customText = req.query.text as string;
      const dimText = `${width}x${height}`;

      const isValidHex = (hex: string) => /^[0-9A-Fa-f]{3,6}$/.test(hex);
      const safeBg = isValidHex(bg) ? `#${bg}` : "#cccccc";
      const safeColor = isValidHex(color) ? `#${color}` : "#666666";
      const fontSize = Math.min(width / 10, height / 5, 100);

      const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${safeBg}" />
  <text 
    x="50%" 
    y="${customText ? '45%' : '50%'}" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="sans-serif" 
    font-weight="bold" 
    font-size="${fontSize}" 
    fill="${safeColor}"
  >
    ${dimText}
  </text>
  ${customText ? `
  <text 
    x="50%" 
    y="${customText ? '60%' : '50%'}" 
    dy="${fontSize * 0.4}"
    dominant-baseline="middle" 
    text-anchor="middle" 
    font-family="sans-serif" 
    font-weight="normal" 
    font-size="${fontSize * 0.6}" 
    fill="${safeColor}"
  >
    ${customText}
  </text>
  ` : ''}
</svg>`.trim();

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.status(200).send(svg);
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
