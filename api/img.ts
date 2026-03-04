export default async function handler(req: any, res: any) {
  try {
    let width = parseInt(req.query.w as string) || 800;
    let height = parseInt(req.query.h as string) || 600;

    const dimensionsParam = req.query.dimensions as string;
    if (dimensionsParam) {
      // Remove file extension if present to get raw dimensions
      const rawDim = dimensionsParam.split('.')[0];
      const dimMatch = rawDim.match(/^(\d+)x(\d+)$/);
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

    const dimText = `${width}x${height}`;
    const fontSize = Math.min(width / 10, height / 5, 100);
    const customFontSize = fontSize * 0.6;

    // Generate SVG
    // We use a simple horizontal and vertical centering with dominant-baseline and text-anchor
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
    font-size="${customFontSize}" 
    fill="${safeColor}"
  >
    ${customText}
  </text>
  ` : ''}
</svg>`.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    res.status(200).send(svg);
  } catch (error: any) {
    console.error("SVG generation failed:", error);
    res.status(500).json({ error: error.message });
  }
}
