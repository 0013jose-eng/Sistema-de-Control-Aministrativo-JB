import { Router, type IRouter } from "express";
import Pusher from "pusher";

const router: IRouter = Router();

const {
  PUSHER_APP_ID,
  PUSHER_KEY,
  PUSHER_SECRET,
  PUSHER_CLUSTER,
} = process.env;

let pusher: Pusher | null = null;
if (PUSHER_APP_ID && PUSHER_KEY && PUSHER_SECRET && PUSHER_CLUSTER) {
  pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
}

router.get("/pusher/config", (_req, res) => {
  res.json({
    key: PUSHER_KEY ?? null,
    cluster: PUSHER_CLUSTER ?? null,
    ready: Boolean(pusher),
  });
});

router.post("/pusher/trigger", async (req, res) => {
  if (!pusher) {
    res.status(503).json({ error: "Pusher no está configurado en el servidor" });
    return;
  }
  const { channel, event, data } = req.body ?? {};
  if (typeof channel !== "string" || typeof event !== "string") {
    res.status(400).json({ error: "Faltan 'channel' o 'event'" });
    return;
  }
  try {
    await pusher.trigger(channel, event, data ?? {});
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Pusher trigger failed");
    res.status(500).json({ error: "Pusher trigger failed" });
  }
});

export default router;
