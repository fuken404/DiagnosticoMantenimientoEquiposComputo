// back/main.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { Op } from "sequelize";

import sequelize from "./db.js";
import Rule from "./models/Rule.js";
import Case from "./models/Case.js";
import authRouter from "./routes/auth.js";
import requireAuth from "./middlewares/requireAuth.js";
import requireAdmin from "./middlewares/requireAdmin.js";

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

console.log("🔐 CORS_ORIGIN configurado:", ORIGINS);

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
  const rules = await Rule.findAll({ order: [["ruleId", "ASC"]] });
  res.json(rules);
});

app.post("/api/rules/bulk", requireAuth, async (req, res) => {
  await Rule.destroy({ where: {} });
  const inserted = await Rule.bulkCreate(req.body);
  res.status(201).json({ inserted: inserted.length });
});

/* ---------- Administración: Crear/Editar Reglas (solo ADMIN) ---------- */
app.post("/api/admin/rules", requireAdmin, async (req, res) => {
  const { ruleId, conditions, weight, fault, advice } = req.body;
  
  if (!ruleId || !fault) {
    return res.status(400).json({ error: "ruleId y fault son requeridos" });
  }

  try {
    const rule = await Rule.create({
      ruleId,
      conditions: conditions || [],
      weight: weight || 0.7,
      fault,
      advice: advice || [],
    });
    res.status(201).json({ ok: true, rule });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "Esta regla ya existe" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/rules/:id", requireAdmin, async (req, res) => {
  const { conditions, weight, fault, advice } = req.body;
  
  const rule = await Rule.findByPk(req.params.id);
  if (!rule) return res.status(404).json({ error: "Regla no encontrada" });

  await rule.update({
    conditions: conditions !== undefined ? conditions : rule.conditions,
    weight: weight !== undefined ? weight : rule.weight,
    fault: fault || rule.fault,
    advice: advice !== undefined ? advice : rule.advice,
  });

  res.json({ ok: true, rule });
});

app.delete("/api/admin/rules/:id", requireAdmin, async (req, res) => {
  const rule = await Rule.findByPk(req.params.id);
  if (!rule) return res.status(404).json({ error: "Regla no encontrada" });

  await rule.destroy();
  res.json({ ok: true });
});

app.get("/api/admin/rules", requireAdmin, async (_req, res) => {
  const rules = await Rule.findAll({ order: [["ruleId", "ASC"]] });
  res.json(rules);
});

/* ---------- Casos (protegidos) ---------- */
app.post("/api/cases", requireAuth, async (req, res) => {
  const doc = await Case.create({ ...req.body, userId: req.user.id });
  res.status(201).json({ id: doc.id });
});

app.get("/api/cases", requireAuth, async (req, res) => {
  const items = await Case.findAll({
    order: [["createdAt", "DESC"]],
    limit: 5,
  });
  res.json(items);
});

app.get("/api/my-cases", requireAuth, async (req, res) => {
  const items = await Case.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
    limit: 100,
  });
  res.json(items);
});

/* ---------- Arranque ---------- */
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL conectado");
    
    await sequelize.sync({ alter: process.env.NODE_ENV !== "production" });
    console.log("Modelos sincronizados");
    
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`API corriendo en http://localhost:${port}`));
  } catch (error) {
    console.error("Error al iniciar:", error);
    process.exit(1);
  }
};

start();
