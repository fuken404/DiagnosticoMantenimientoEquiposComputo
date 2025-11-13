# 🚀 Deploy en Render en 10 Minutos

## ⚡ Resumen Rápido

Tu app se desplegará **completamente gratis** con:
- **Backend** en Render (Node.js)
- **PostgreSQL** en Render
- **Frontend** en Render (Static Site)
- **HTTPS** automático
- **Auto-deploy** desde GitHub

**Costo final: $0/mes** 💰

---

## 🎯 Paso 1: Preparar GitHub (2 minutos)

### 1.1 Inicializar Git (si aún no lo hiciste)

```bash
cd ~/Desktop/Proyectos/Uni/SisExp/DiagnosticoMantenimientoEquiposComputo

# Ver si ya hay repo Git
git status

# Si no existe, iniciar:
git init
git add .
git commit -m "Initial commit - Sistema Experto"
```

### 1.2 Crear Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `DiagnosticoMantenimientoEquiposComputo`
3. Descripción: `Sistema Experto para diagnóstico de hardware`
4. Selecciona **Public** (importante para Render gratis)
5. Click **"Create repository"**

### 1.3 Subir código a GitHub

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/DiagnosticoMantenimientoEquiposComputo.git
git branch -M main
git push -u origin main

# Verifica en github.com/TU_USUARIO/DiagnosticoMantenimientoEquiposComputo
```

---

## 🎯 Paso 2: Crear Cuenta Render (1 minuto)

1. Ve a [render.com](https://render.com)
2. Click **"Sign up"**
3. Elige **"Continue with GitHub"**
4. Autoriza Render
5. ¡Listo! Ya tienes cuenta

---

## 🎯 Paso 3: Crear PostgreSQL (2 minutos)

1. En Render dashboard:
   - Click **"New"** (botón azul)
   - Selecciona **"PostgreSQL"**

2. Configura:
   - **Name:** `diagnostic-db`
   - **Database:** `expertos`
   - **User:** `diaguser` ⚠️ (NO usar `postgres` - Render lo rechaza)
   - **Plan:** Free
   - **Region:** Selecciona cercano a ti (ej: Ohio, Frankfurt, Singapur)

3. Click **"Create Database"**

4. **Espera 2-3 minutos** a que se cree

5. Una vez listo, **copia y GUARDA estos datos:**

```
Internal Database URL:
postgresql://diaguser:yranPi6hNSxv0F4oEh9Kj7TXByFg3v4u@dpg-d4a079idbo4c73c2c0jg-a/expertos
Datos individuales:
- Host: dpg-d4a079idbo4c73c2c0jg-a
- Port: 5432
- Database: expertos
- User: diaguser
- Password: yranPi6hNSxv0F4oEh9Kj7TXByFg3v4u
```

(Los necesitarás en el siguiente paso)

---

## 🎯 Paso 4: Crear Backend en Render (3 minutos)

1. Click **"New"** → **"Web Service"**

2. **Conectar repo:**
   - Click **"Connect a repository"**
   - Busca y selecciona `DiagnosticoMantenimientoEquiposComputo`
   - Click **"Connect"**

3. **Configurar servicio:**

| Campo | Valor |
|-------|-------|
| **Name** | `diagnostic-api` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |
| **Region** | Mismo que la BD (ej: Ohio) |

4. Click **"Advanced"** → **"Add Environment Variable"**

5. **Agrega estas variables:**

```
NODE_ENV=production
PORT=3000
JWT_SECRET=genera_una_clave_segura_aqui_minimo_32_caracteres
```

6. **Copia las credenciales de PostgreSQL del paso anterior y agrega:**

```
DB_HOST=nombre-aleatorio.c.rendering.com
DB_PORT=5432
DB_NAME=expertos
DB_USER=diaguser
DB_PASSWORD=TU_PASSWORD_QUE_RENDER_GENERO
```

✅ **IMPORTANTE:** Asegúrate de que:
- `DB_USER` es `diaguser` (el que creaste en Paso 3)
- `DB_PASSWORD` es el password que Render generó automáticamente
- `DB_HOST` es el host interno de Render

7. Click **"Create Web Service"**

8. **Espera 3-5 minutos** a que compile

9. Verás algo como: `diagnostic-api.onrender.com` (copia esta URL)

---
  
## 🎯 Paso 5: Crear Frontend en Render (2 minutos)

1. Click **"New"** → **"Static Site"**

2. **Conectar repo:**
   - Selecciona el mismo repo

3. **Configurar:**

| Campo | Valor |
|-------|-------|
| **Name** | `diagnostic-app` |
| **Build Command** | (dejar vacío) |
| **Publish directory** | `.` (punto) |
| **Plan** | Free |

4. Click **"Create Static Site"**

5. **Espera 1-2 minutos**

6. Verás algo como: `diagnostic-app.onrender.com` (copia esta URL)

---

## 🎯 Paso 6: Conectar Todo

Ahora que tienes ambas URLs, debes actualizar **CORS en el backend**:

1. Ve a Render → **diagnostic-api**

2. Busca **"Environment"** en la izquierda

3. **Edita** la variable `CORS_ORIGIN`:

```
CORS_ORIGIN=https://diagnostic-app.onrender.com
```

4. Click **"Save"** → El backend se redeploya automáticamente (5 min)

---

## ✅ Paso 7: Verificar que Funciona

1. Abre en tu navegador: `https://diagnostic-app.onrender.com`

2. Deberías ver tu app

3. Intenta:
   - Registrarte
   - Hacer login
   - Crear un diagnóstico
   - Si eres admin: crear una regla

4. ¡Si todo funciona, está deployado! 🎉

---

## 🆘 Si Algo No Funciona

### "Error: user must not be one of the following values: postgres"

**ESTO ES NORMAL EN RENDER** ⚠️

Render no permite usar `postgres` como usuario. 

**Solución:**
```
En Paso 3, usa: diaguser (o cualquier otro nombre)
NO uses: postgres
```

Si ya lo hiciste:
1. Elimina la BD anterior
2. Crea una nueva con `diaguser` en vez de `postgres`
3. Actualiza las variables en Backend:
   ```
   DB_USER=diaguser
   DB_PASSWORD=(el password que Render generó)
   ```
4. Redeploy el backend

---

### "Veo error de conexión a BD"

```
En Render → diagnostic-api → Logs
Busca: "PostgreSQL conectado"

Si NO aparece:
1. Verifica DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
2. ✅ Especialmente verifica que DB_USER sea "diaguser"
3. Verifica que la BD esté en estado "Available"
4. Haz click en "Manual Deploy" para reintentar
```

### "El frontend no se conecta al backend"

```
1. Abre la consola (F12) en el navegador
2. Busca errores CORS o 404
3. Verifica que CORS_ORIGIN sea correcto
4. Verifica que API_BASE en index.html sea correcto
```

### "Las reglas de diagnóstico no aparecen"

```
Necesitas cargar las reglas iniciales:

Opción 1: Via Render Shell
- diagnostic-api → Shell
- Ejecuta: node back/seed_rules.js

Opción 2: Via curl
curl -X POST https://diagnostic-api.onrender.com/api/seed
```

---

## 📊 URLs Finales

Una vez todo funciona:

```
🌐 Frontend:   https://diagnostic-app.onrender.com
🔌 Backend:    https://diagnostic-api.onrender.com
💾 BD:         En Render PostgreSQL
🔓 Demo:       https://diagnostic-app.onrender.com
```

---

## 🔄 Ahora: Auto-Deploy Desde GitHub

Cada vez que hagas `git push`:

```bash
# 1. Edita tu código
nano index.html

# 2. Commit y push
git add index.html
git commit -m "Fix UI"
git push origin main

# 3. Render automáticamente redeploya ✨
# Ve a Render → diagnostic-app → Deployments
# Verás el nuevo deployment en progreso
```

---

## 🎓 ¿Qué Sigue?

### 1. Agregar Dominio Personalizado (Opcional)

```
En Render:
- diagnostic-app → Settings → Custom Domains
- Agrega tu dominio (ej: diagnostico.tudominio.com)
- Configura DNS records
- Listo, tendrás HTTPS en tu dominio
```

### 2. Promover Usuarios a Admin

```bash
# En tu máquina local:
./promote-admin.sh usuario@email.com

# O manualmente en BD:
# En Render → PostgreSQL → Console
UPDATE users SET role = 'admin' WHERE email = 'usuario@email.com';
```

### 3. Hacer Backups de la BD

```
En Render:
- PostgreSQL → Backups
- Render hace backups automáticos
- Puedes descargarlos si necesitas
```

---

## 📋 Checklist Final

- [ ] Código en GitHub (repo público)
- [ ] PostgreSQL creado en Render
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Render
- [ ] CORS configurado
- [ ] Prueba de registro funciona
- [ ] Prueba de login funciona
- [ ] Prueba de diagnóstico funciona
- [ ] URLs HTTPS en navegador

---

## 💡 Tips

1. **Si Backend tarda mucho en iniciar:**
   - Es normal en plan Free, pueden ser 30-60 segundos
   - Render puede hibernar si sin tráfico 15 minutos

2. **Para evitar hibernación:**
   - Usa un servicio como [uptimerobot.com](https://uptimerobot.com)
   - Configura ping a `https://diagnostic-api.onrender.com/api/health` cada 10 min
   - Es gratis

3. **Si necesitas más poder:**
   - Render Free es limitado
   - Considera Railway ($5/mes) o Vercel para frontend
   - Supabase para BD separada

---

## 📞 Soporte

Si algo sale mal:

1. **Render Support:** [support.render.com](https://support.render.com)
2. **Lee los logs:** Render → Servicio → Logs (muy útil)
3. **Prueba manualmente:** Conecta a la BD desde DBeaver en Render
4. **Revisa el código:** A veces es un typo en API_BASE

---

**¡Tu aplicación está lista para el mundo! 🌍**

Última actualización: 11 de noviembre de 2025
