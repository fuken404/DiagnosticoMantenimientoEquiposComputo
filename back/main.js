// back/main.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import Rule from "./models/Rule.js";
import Case from "./models/Case.js";
import authRouter from "./routes/auth.js";
import requireAuth from "./middlewares/requireAuth.js";

dotenv.config();

const app = express();

/* ---------- Seguridad / middlewares base ---------- */
app.disable("x-powered-by");        // seguridad extra
app.disable("etag");                 // evita 304 en JSON simple

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(cookieParser());

/* ---------- CORS con credenciales ---------- */
const ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5500,http://127.0.0.1:5500")
  .split(",")
  .map(s => s.trim());

const corsOpts = {
  origin: ORIGINS,
  credentials: true, // ← permite cookies
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOpts));
app.options("*", cors(corsOpts)); // preflight global

/* ---------- Health ---------- */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ---------- Auth (rate-limited) ---------- */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter, authRouter);

/* ---------- Reglas ---------- */
app.get("/api/rules", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  const rules = await Rule.find().sort({ ruleId: 1 });
  res.json(rules);
});

app.post("/api/rules/bulk", requireAuth, async (req, res) => {
  await Rule.deleteMany({});
  const inserted = await Rule.insertMany(req.body);
  res.status(201).json({ inserted: inserted.length });
});

/* ---------- Casos (protegidos) ---------- */
app.post("/api/cases", requireAuth, async (req, res) => {
  const doc = await Case.create({ ...req.body, user: req.user.id });
  res.status(201).json({ _id: doc._id });
});

app.get("/api/cases", requireAuth, async (req, res) => {
  const items = await Case.find({}).sort({ createdAt: -1 }).limit(5);
  res.json(items);
});

app.get("/api/my-cases", requireAuth, async (req, res) => {
  const items = await Case.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
  res.json(items);
});

/* ---------- Arranque ---------- */
const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "expertos" });
  console.log("Mongo conectado");
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API corriendo en http://localhost:${port}`));
};
start().catch(console.error);
