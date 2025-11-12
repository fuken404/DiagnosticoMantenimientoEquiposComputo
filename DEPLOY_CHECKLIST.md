# ✅ Checklist de Deploy a Render

## 📋 Pre-Deploy (Hacer Localmente)

### Código
- [ ] Código actualizado y testeado localmente
- [ ] `npm run dev` funciona sin errores
- [ ] Aplicación responde en `http://localhost:5500`
- [ ] Puedo registrar usuario
- [ ] Puedo hacer login
- [ ] Puedo hacer un diagnóstico
- [ ] La BD tiene datos (reglas cargadas)

### Git
- [ ] Git inicializado: `git init` ✓
- [ ] Archivo `.gitignore` actualizado
- [ ] Código commiteado: `git add .` + `git commit -m "..."` ✓
- [ ] Repositorio creado en GitHub
- [ ] Código subido: `git push origin main` ✓
- [ ] Repositorio es **PUBLIC** (importante para gratis)

### Configuración
- [ ] `package.json` tiene script `"start": "node back/main.js"`
- [ ] `.env.example` actualizado con todas las variables
- [ ] `index.html` tiene detección de environment para API_BASE
- [ ] No hay secretos en el código (JWT_SECRET, passwords, etc.)

---

## 🎬 Deploy (En Render)

### Paso 1: Cuenta Render
- [ ] Cuenta creada en [render.com](https://render.com)
- [ ] Autenticado con GitHub
- [ ] Dashboard visible

### Paso 2: PostgreSQL
- [ ] Base de datos PostgreSQL creada
- [ ] Nombre: `expertos`
- [ ] Usuario: `postgres`
- [ ] Status: **Available** (verde)
- [ ] URLs copiadas:
  - Internal URL: `postgresql://postgres:PASS@HOST:5432/expertos`

### Paso 3: Backend
- [ ] Repositorio conectado en Render
- [ ] Nombre: `diagnostic-api`
- [ ] Build Command: `npm install` ✓
- [ ] Start Command: `npm start` ✓
- [ ] Environment:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `3000`
  - [ ] `JWT_SECRET` = (clave larga aleatoria)
  - [ ] `DB_HOST` = (del PostgreSQL)
  - [ ] `DB_PORT` = `5432`
  - [ ] `DB_NAME` = `expertos`
  - [ ] `DB_USER` = `postgres`
  - [ ] `DB_PASSWORD` = (tu password)
- [ ] Deploy completado (sin errores)
- [ ] URL del backend copiada: `https://diagnostic-api.onrender.com`
- [ ] Health check funciona: `https://diagnostic-api.onrender.com/api/health`

### Paso 4: Frontend
- [ ] Repositorio conectado
- [ ] Nombre: `diagnostic-app`
- [ ] Build Command: (vacío)
- [ ] Publish directory: `.`
- [ ] Deploy completado
- [ ] URL del frontend copiada: `https://diagnostic-app.onrender.com`
- [ ] App carga: `https://diagnostic-app.onrender.com`

### Paso 5: CORS
- [ ] Backend → Environment
- [ ] `CORS_ORIGIN` = `https://diagnostic-app.onrender.com`
- [ ] Backend redesplegado
- [ ] Esperar 5 minutos

---

## ✅ Post-Deploy (Verificar)

### Aplicación Funciona
- [ ] Puedo acceder: `https://diagnostic-app.onrender.com`
- [ ] Se carga el HTML
- [ ] Se cargan los CSS/JS
- [ ] No hay errores en consola (F12)

### Autenticación
- [ ] Puedo registrar nuevo usuario
- [ ] Email y contraseña requeridos
- [ ] Contraseña hasheada (Argon2)
- [ ] Puedo hacer login
- [ ] JWT se crea y guarda en cookies
- [ ] Puedo ver mi nombre en el panel de usuario

### Funcionalidad
- [ ] Las reglas de diagnóstico cargan
- [ ] Puedo seleccionar síntomas
- [ ] Puedo hacer un diagnóstico
- [ ] Veo resultados correctamente
- [ ] Puedo guardar caso

### Admin (si aplica)
- [ ] He creado usuario admin
- [ ] Puedo ver panel de administrador
- [ ] Puedo crear nueva regla
- [ ] La regla aparece en diagnósticos

### Base de Datos
- [ ] Puedo conectar con DBeaver a Render
- [ ] Veo las tablas: `users`, `rules`, `cases`
- [ ] Hay datos en las tablas
- [ ] Los usuarios registrados aparecen en BD

### HTTPS
- [ ] Frontend URL tiene HTTPS 🔒
- [ ] Backend URL tiene HTTPS 🔒
- [ ] Sin advertencias de seguridad
- [ ] Certificados válidos

---

## 🆘 Troubleshooting

### Si Backend No Conecta a BD

```bash
# 1. Ver logs
En Render → diagnostic-api → Logs
Busca: "PostgreSQL conectado"

# 2. Verificar variables
diagnostic-api → Environment
Revisa DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

# 3. Reintentar deploy
diagnostic-api → Manual Deploy

# 4. Si sigue fallando
Reinicia PostgreSQL en Render
```

### Si Frontend No Ve Backend

```bash
# 1. Abrir consola (F12)
Ver errores CORS o fetch

# 2. Verificar CORS
diagnostic-api → Environment → CORS_ORIGIN
Debe ser: https://diagnostic-app.onrender.com

# 3. Redeploy backend
Después de cambiar CORS

# 4. Verificar API_BASE en index.html
Debe detectar automáticamente en producción
```

### Si Las Reglas No Aparecen

```bash
# Opción 1: Via Shell en Render
diagnostic-api → Shell
node back/seed_rules.js

# Opción 2: Via Curl
curl -X POST https://diagnostic-api.onrender.com/api/seed

# Opción 3: Verificar en DBeaver
Conecta a PostgreSQL
SELECT COUNT(*) FROM rules;
Debe mostrar 18 (o el número de reglas)
```

### Si El Backend Se Queda Sin Memoria

```
Es normal en plan Free de Render

Solución:
1. Reduce tamaño de queries
2. Agrega connection pooling en back/db.js
3. Limpia logs viejos
4. Considera plan pagado si crece
```

---

## 📊 Estadísticas Post-Deploy

Captura estos números para tu reporte:

- **Tiempo de Deploy:** ___ minutos
- **Errores encontrados:** ___ 
- **Errores solucionados:** ___
- **Performance:** ___ ms (primera carga)
- **Usuarios registrados:** ___
- **Casos diagnósticos:** ___

---

## 🎯 Siguientes Pasos

### Corto Plazo (1 semana)
- [ ] Monitoreo en Uptimerobot (evita hibernación)
- [ ] Backups automáticos configurados
- [ ] Logs centralizados activos
- [ ] Usuarios testeando activamente

### Mediano Plazo (1 mes)
- [ ] Dominio personalizado si lo necesitas
- [ ] Analytics para ver uso
- [ ] Optimizaciones de rendimiento
- [ ] Feedback de usuarios

### Largo Plazo
- [ ] Plan de escalamiento
- [ ] Migración a plan pagado si crece
- [ ] Más funcionalidades
- [ ] Mejoras de UX basadas en datos

---

## 📞 Soporte

Si necesitas ayuda:

1. **Render Dashboard:** Siempre está disponible
2. **Logs:** Render → Servicio → Logs (información muy útil)
3. **PostgreSQL Console:** Render → Database → Console
4. **Manual Deploy:** Si algo falla, intenta nuevamente

---

## ✨ ¡Felicidades!

Tu aplicación está en producción y disponible en:

```
🌐 https://diagnostic-app.onrender.com
🔧 https://diagnostic-api.onrender.com
💾 PostgreSQL en Render
```

**Ahora:**
- Los usuarios pueden acceder desde cualquier lugar
- Los datos están seguros en la BD
- El sitio tiene HTTPS
- Todo es gratis

---

**Última actualización:** 11 de noviembre de 2025
