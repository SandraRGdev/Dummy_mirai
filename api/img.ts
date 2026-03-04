export default async function handler(req: any, res: any) {
  res.status(200).json({
    message: "Ultra-simple test",
    query: req.query,
    cwd: process.cwd()
  });
}
