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
router.get("/builder.html", (req, res) => {

  const builderPath = path.resolve(
    process.cwd(),
    "builder.html"
  );

  if (!fs.existsSync(builderPath)) {

    return res.status(404).send(
      "Builder no encontrado"
    );

  }

  res.sendFile(builderPath);

});
router.post("/saveBuilder", (req, res) => {

  try {

    const builderPath = path.resolve(
      process.cwd(),
      "../../attached_assets/builder-data.json"
    );

    fs.writeFileSync(
      builderPath,
      JSON.stringify(req.body, null, 2)
    );

    res.json({
      ok: true,
      message: "Builder guardado"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      error: "No se pudo guardar"
    });

  }

});
router.get("/loadBuilder", (req, res) => {

  try {

    const builderPath = path.resolve(
      process.cwd(),
      "../../attached_assets/builder-data.json"
    );

    // Si no existe archivo
    if (!fs.existsSync(builderPath)) {

      return res.json({
        screens: []
      });

    }

    // Leer archivo
    const data = fs.readFileSync(
      builderPath,
      "utf-8"
    );

    res.json(JSON.parse(data));

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      error: "No se pudo cargar builder"
    });

  }

});
export default router;
