import { Router, type IRouter, type Request } from "express";
import path from "node:path";
import fs from "node:fs";

const router: IRouter = Router();

const HTML_PATH = path.resolve(
  process.cwd(),
  "../../attached_assets/SYSTEM_JABM_actualizado_1777578201554.html",
);

function publicBase(req: Request): string {
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    const first = replitDomains.split(",")[0]?.trim();
    if (first) return "https://" + first;
  }
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.get("host");
  return proto + "://" + host;
}

router.get("/system", (req, res) => {
  if (!fs.existsSync(HTML_PATH)) {
    res.status(404).send("System HTML not found at " + HTML_PATH);
    return;
  }
  let html = fs.readFileSync(HTML_PATH, "utf-8");
  const base = publicBase(req);
  const inject =
    '<script>window.__JABM_API_BASE__=' +
    JSON.stringify(base) +
    ';console.log("[JABM] API base =", window.__JABM_API_BASE__);</script>';
  html = html.replace("</head>", inject + "</head>");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(html);
});

export default router;
