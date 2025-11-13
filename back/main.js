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
import { extractRulesFromJSON } from "./seedLogic.js";

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

/* ---------- Seed Rules (carga la base de conocimientos) ---------- */
app.get("/api/seed", async (_req, res) => {
  try {
    console.log("🌱 Iniciando seed de reglas desde GET...");
    
    // Extraer reglas del JSON
    const rules = await extractRulesFromJSON();
    console.log(`📋 Se extrajeron ${rules.length} reglas del JSON`);
    
    // Limpiar reglas existentes
    await Rule.destroy({ where: {} });
    console.log("🗑️  Reglas previas eliminadas");
    
    // Insertar nuevas reglas
    await Rule.bulkCreate(rules);
    console.log(`✅ ${rules.length} reglas insertadas en la BD`);
    
    res.json({ ok: true, inserted: rules.length, message: `Se cargaron ${rules.length} reglas correctamente` });
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/seed", async (_req, res) => {
  try {
    console.log("🌱 Iniciando seed de reglas desde POST...");
    
    // Extraer reglas del JSON
    const rules = await extractRulesFromJSON();
    console.log(`📋 Se extrajeron ${rules.length} reglas del JSON`);
    
    // Limpiar reglas existentes
    await Rule.destroy({ where: {} });
    console.log("🗑️  Reglas previas eliminadas");
    
    // Insertar nuevas reglas
    await Rule.bulkCreate(rules);
    console.log(`✅ ${rules.length} reglas insertadas en la BD`);
    
    res.json({ ok: true, inserted: rules.length, message: `Se cargaron ${rules.length} reglas correctamente` });
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- Auth (rate-limited) ---------- */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter, authRouter);

/* ---------- Reglas ---------- */
app.get("/api/rules", async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const rules = await Rule.findAll({ order: [["ruleId", "ASC"]] });
    console.log(`📡 GET /api/rules → ${rules.length} reglas enviadas`);
    res.json(rules);
  } catch (err) {
    console.error("❌ Error en GET /api/rules:", err);
    res.status(500).json({ error: err.message });
  }
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
    console.log("✅ PostgreSQL conectado");
    
    await sequelize.sync({ alter: process.env.NODE_ENV !== "production" });
    console.log("✅ Modelos sincronizados");
    
    // Auto-seed: Si no hay reglas, cargarlas automáticamente
    const ruleCount = await Rule.count();
    console.log(`📊 Reglas en BD: ${ruleCount}`);
    
    if (ruleCount === 0) {
      console.log("🌱 BD vacía. Cargando reglas automáticamente...");
      try {
        const rules = await extractRulesFromJSON();
        console.log(`📋 Extraídas ${rules.length} reglas del JSON`);
        
        await Rule.bulkCreate(rules);
        
        const newCount = await Rule.count();
        console.log(`✅ ${newCount} reglas cargadas en la BD (verificación)`);
      } catch (err) {
        console.error("❌ Error al cargar reglas automáticamente:", err.message);
        console.error("Stack:", err.stack);
      }
    } else {
      console.log(`✅ BD ya tiene ${ruleCount} reglas. No se hace auto-seed.`);
    }
    
    // Verificación final
    const finalCount = await Rule.count();
    console.log(`📊 Estado final: ${finalCount} reglas en la BD`);
    
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`🚀 API corriendo en http://localhost:${port}`));
  } catch (error) {
    console.error("❌ Error fatal al iniciar:", error);
    process.exit(1);
  }
};

start();
