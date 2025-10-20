import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

// Helpers
function setAuthCookie(res, token) {
  // En prod: Secure y SameSite=None (requiere HTTPS)
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email y password son requeridos" });

  // políticas simples de password
  if (password.length < 8) return res.status(400).json({ error: "Password mínimo 8 caracteres" });

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id }); // sal y parámetros seguros
  try {
    const user = await User.create({ email, name, passwordHash });
    const token = sign({ sub: user._id, email: user.email, name: user.name });
    setAuthCookie(res, token);
    res.status(201).json({ ok: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Email ya registrado" });
    throw e;
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = sign({ sub: user._id, email: user.email, name: user.name });
  setAuthCookie(res, token);
  res.json({ ok: true, user: { id: user._id, email: user.email, name: user.name } });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const auth = req.cookies?.token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!auth) return res.status(401).json({ error: "no auth" });
  try {
    const payload = jwt.verify(auth, process.env.JWT_SECRET);
    res.json({ ok: true, user: { id: payload.sub, email: payload.email, name: payload.name } });
  } catch {
    res.status(401).json({ error: "token inválido" });
  }
});

export default router;
