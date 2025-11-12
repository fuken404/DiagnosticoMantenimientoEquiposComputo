# 🚀 Guía de Deployment Gratuito

## 📊 Comparativa de Opciones Gratuitas

| Opción | Frontend | Backend | BD | Ventajas | Desventajas |
|--------|----------|---------|----|---------|----|
| **Render** 🏆 | ✅ Sí | ✅ Sí | ✅ PostgreSQL | Más fácil, BD incluida, buena documentación | Puede dormir con inactividad |
| **Vercel** | ✅ Sí | ⚠️ Serverless | ❌ No | Deploy automático, muy rápido | Backend limitado, BD separada |
| **Railway** | ✅ Sí | ✅ Sí | ✅ PostgreSQL | Muy potente, auto-deploy | Puede cobrar rápido |
| **GitHub Pages** | ✅ Sí | ❌ No | ❌ No | Muy simple | Solo frontend estático |

---

## 🎯 RECOMENDACIÓN: Render.com (La Más Fácil)

### ✨ Por qué Render?
- ✅ Backend + BD gratuito con límites muy buenos
- ✅ Deploy automático desde GitHub
- ✅ PostgreSQL incluido
- ✅ SSL/HTTPS automático
- ✅ Muy fácil de configurar
- ✅ Excelente documentación en español

---

## 📋 PASO A PASO: Render.com

### **Paso 1: Preparar tu Repositorio**

Primero, asegúrate de que tu código esté en GitHub:

```bash
# 1. Iniciar Git si no lo hiciste
cd ~/Desktop/Proyectos/Uni/SisExp/DiagnosticoMantenimientoEquiposComputo
git init
git add .
git commit -m "Initial commit - Sistema Experto"

# 2. Agregar repositorio remoto (reemplaza con tu repo)
git remote add origin https://github.com/TU_USUARIO/DiagnosticoMantenimientoEquiposComputo.git
git branch -M main
git push -u origin main
```

---

### **Paso 2: Crear Archivos de Configuración**

#### A) Crear `.env.production`

```bash
# En la raíz del proyecto
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=una_clave_super_secreta_larga_minimo_32_caracteres_aqui
JWT_EXPIRES=7d
DB_DIALECT=postgres
CORS_ORIGIN=https://tu-app.onrender.com
EOF
```

#### B) Crear `.gitignore` (si no existe)

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.env.production
*.log
.DS_Store
postgresql/
EOF
git add .gitignore
git commit -m "Add gitignore"
git push
```

#### C) Actualizar `package.json` con script de start

```bash
# Edita package.json y agrega:
```

Abre tu `package.json` y reemplaza los scripts:

```json
{
  "scripts": {
    "start": "node back/main.js",
    "dev": "node back/main.js",
    "dev:frontend": "node server-frontend.js",
    "dev:all": "npm run dev & npm run dev:frontend",
    "seed:rules": "node back/seed_rules.js",
    "migrate:data": "node back/migrate-data.js"
  }
}
```

Commit:
```bash
git add package.json
git commit -m "Add start script for production"
git push
```

---

### **Paso 3: Crear Cuenta en Render.com**

1. Ve a [render.com](https://render.com)
2. Click "Sign up" → Selecciona "GitHub"
3. Autoriza Render para acceder a tus repos
4. ¡Listo! Ya tienes cuenta

---

### **Paso 4: Crear PostgreSQL en Render**

1. En el dashboard de Render:
   - Click en **"New"** → **"PostgreSQL"**
   
2. Configura:
   - **Name:** `diagnostic-db` (o tu preferencia)
   - **Database:** `expertos`
   - **User:** `postgres`
   - **Plan:** Free
   
3. Click **"Create Database"**

4. **Espera 2-3 minutos** a que se cree

5. Una vez creada, copia el **Internal Database URL**:
   - Se verá como: `postgresql://postgres:password123@localhost:5432/expertos`

---

### **Paso 5: Crear Backend en Render**

1. Click **"New"** → **"Web Service"**

2. **Conectar repositorio:**
   - Click "Connect a repository"
   - Selecciona tu repo `DiagnosticoMantenimientoEquiposComputo`

3. **Configurar:**
   - **Name:** `diagnostic-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node back/main.js`
   - **Plan:** Free
   - **Region:** Selecciona cercano a ti (ej: Miami, Dallas, Amsterdam)

4. **Environment Variables:**
   - Click **"Advanced"** → **"Add Environment Variable"**
   
   Agrega estas variables:
   
   ```
   NODE_ENV = production
   PORT = 3000
   JWT_SECRET = una_clave_super_secreta_larga_minimo_32_caracteres_aqui
   CORS_ORIGIN = https://tu-app.onrender.com
   ```

   Para la BD, copia la URL interna y agrega:
   ```
   DATABASE_URL = postgresql://postgres:tupassword@tuhost:5432/expertos
   ```
   
   O configura por partes:
   ```
   DB_HOST = tu-host.render.internal
   DB_PORT = 5432
   DB_NAME = expertos
   DB_USER = postgres
   DB_PASSWORD = tu-password
   ```

5. Click **"Create Web Service"**

6. **Espera 3-5 minutos** a que compile y despliegue

7. Una vez despliego, verás la URL: `https://diagnostic-api.onrender.com`

---

### **Paso 6: Seed de Datos (Cargar Reglas)**

Una vez que el backend esté corriendo:

```bash
# Opción 1: Via Render console
# En Render dashboard → diagnostic-api → Shell
node back/seed_rules.js

# Opción 2: Via curl (si expones un endpoint)
curl -X POST https://diagnostic-api.onrender.com/api/seed
```

---

### **Paso 7: Crear Frontend en Render**

1. Click **"New"** → **"Static Site"**

2. **Conectar repositorio:**
   - Selecciona el mismo repo

3. **Configurar:**
   - **Name:** `diagnostic-app`
   - **Build Command:** (dejar vacío, no es necesario)
   - **Publish directory:** `.` (raíz del proyecto)
   - **Plan:** Free

4. Click **"Create Static Site"**

5. Verás la URL: `https://diagnostic-app.onrender.com`

---

### **Paso 8: Actualizar CORS en Backend**

Ahora que sabes las URLs, actualiza el backend:

1. En Render → `diagnostic-api` → **Environment**
   
2. Edita `CORS_ORIGIN`:
   ```
   CORS_ORIGIN = https://diagnostic-app.onrender.com
   ```

3. Click **"Save"** → El backend se redeploya automáticamente

---

### **Paso 9: Conectar Frontend al Backend**

El frontend necesita saber dónde está el backend. Abre `index.html`:

```html
<!-- Busca esta línea (aproximadamente línea 500) -->
const API_BASE_URL = 'http://localhost:4000';

<!-- Reemplaza con: -->
const API_BASE_URL = 'https://diagnostic-api.onrender.com';
```

Haz commit y push:
```bash
git add index.html
git commit -m "Update API URL for production"
git push
```

El frontend se redeploya automáticamente.

---

### **Paso 10: Verificar que Todo Funciona**

1. Ve a `https://diagnostic-app.onrender.com`
2. Deberías ver la aplicación
3. Intenta registrarte
4. Si funciona, ¡listo! 🎉

---

## 🆘 Troubleshooting

### "El backend no se conecta a la BD"

```bash
# En Render → diagnostic-api → Logs
# Verifica:
# 1. DATABASE_URL es correcto
# 2. La BD está en estado "Available"
# 3. Firewall permite conexiones

# Fix:
# Ve a PostgreSQL en Render
# Verifica "Allow public connections" esté ON
```

### "El frontend no se carga"

```bash
# 1. Verifica CORS_ORIGIN en backend
# 2. Verifica API_BASE_URL en index.html
# 3. Abre consola en navegador (F12) y busca errores
```

### "La BD se desconecta"

```bash
# Render free tiene algunos límites
# Solution: Agregar connection pooling

# En back/db.js, actualiza:
pool: {
  max: 5,        // ← reduce de 20
  min: 1,        // ← reduce de 5
  acquire: 30000,
  idle: 5000     // ← reduce de 10000
}
```

---

## 📱 URLs Finales

Una vez deployado, tendrás:

```
Frontend:  https://diagnostic-app.onrender.com
Backend:   https://diagnostic-api.onrender.com/api
BD:        PostgreSQL en Render.internal

Acceso directo: https://diagnostic-app.onrender.com
```

---

## 💰 Costos (Totalmente Gratis)

- ✅ PostgreSQL: Gratis (hasta 100 MB)
- ✅ Backend: Gratis (puede dormir con inactividad)
- ✅ Frontend: Gratis (siempre activo)
- ✅ HTTPS: Gratis
- ✅ Dominio: Gratis (.onrender.com)

**Total: $0/mes** 🎉

---

## 🔄 Trabajo Futuro (Auto-Deploy)

Cada vez que hagas `git push`, se redeploya automáticamente:

```bash
# Editar código
nano index.html

# Commit y push
git add index.html
git commit -m "Fix UI bug"
git push origin main

# Render automáticamente redeploya ✨
```

---

## 📊 Alternativa: Vercel (Si Quieres Serverless)

### Ventajas
- ✅ Deploy muy rápido
- ✅ Optimizado para React
- ✅ Analytics incluido

### Desventajas
- ❌ Backend limitado (solo Serverless Functions)
- ❌ BD se paga separada

### Pasos Rápidos
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Selecciona opciones por defecto
```

Para la BD, usa **[Supabase](https://supabase.com)** (PostgreSQL gratis)

---

## 🚂 Alternativa: Railway (Si Quieres Más Control)

### Ventajas
- ✅ Muy flexible
- ✅ Deploy muy rápido
- ✅ Excelente UX

### Desventajas
- ⚠️ Free tier con créditos ($5/mes, expira)

### Pasos
```bash
# 1. Crear cuenta en railway.app
# 2. "New Project"
# 3. "Deploy from GitHub"
# 4. Agregar PostgreSQL
# 5. Configurar variables
# 6. Deploy automático
```

---

## ✅ Checklist Render

- [ ] Código en GitHub (repo público)
- [ ] `.env.production` creado
- [ ] Cuenta Render hecha
- [ ] PostgreSQL creado en Render
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Render
- [ ] CORS configurado correctamente
- [ ] API_BASE_URL en index.html actualizado
- [ ] Prueba de registro/login funciona
- [ ] BD tiene datos (seed rules)
- [ ] Admin puede crear reglas
- [ ] Todas las URLs son HTTPS

---

## 🎯 Próximos Pasos

Después del deployment:

1. **Monitoreo:**
   - Render tiene logs en tiempo real
   - Configura alertas si es necesario

2. **Dominio personalizado:**
   - Si quieres tu propio dominio (ej: diagnostico.misitio.com)
   - En Render → Settings → Custom Domain

3. **Backups:**
   - Render hace backups automáticos
   - Descarga backup via Render CLI

4. **Escalamiento:**
   - Si crece mucho, pasa a plan pagado
   - O migra a AWS/Azure

---

## 📞 Links Útiles

- [Render Docs](https://render.com/docs)
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

**Última actualización:** 11 de noviembre de 2025  
**Autor:** Sistema Experto  
**Status:** ✅ Listo para Deploy
