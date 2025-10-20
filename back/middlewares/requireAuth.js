import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  const token = req.cookies?.token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "No autenticado" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
