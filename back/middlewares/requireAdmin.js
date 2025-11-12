import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  const auth = req.cookies?.token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  
  if (!auth) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(auth, process.env.JWT_SECRET);
    
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: "Solo administradores pueden acceder" });
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
}
