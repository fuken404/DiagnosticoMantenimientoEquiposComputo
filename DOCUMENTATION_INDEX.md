# 📚 Índice de Documentación

## 🚀 Inicio Rápido

Si es tu primera vez aquí, sigue este orden:

1. **[QUICK_START.md](./QUICK_START.md)** ← ⭐ **COMIENZA AQUÍ** (5 minutos)
2. **[README.md](./README.md)** ← Descripción del proyecto
3. **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** ← Sistema de autenticación y roles

---

## 📖 Documentación por Tema

### 🔧 Inicio y Configuración

| Archivo | Descripción | Nivel |
|---------|-------------|-------|
| **[QUICK_START.md](./QUICK_START.md)** | **⭐ Comienza aquí** - Pasos en 5 minutos | Todos |
| [README.md](./README.md) | Descripción del proyecto y tecnologías | Todos |
| [.env.example](./.env.example) | Variables de entorno necesarias | Developers |

### 🔐 Autenticación y Seguridad

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) | Sistema de roles (user/admin) y autenticación | Todos |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Guía completa de pruebas paso a paso | Testers/Developers |

### � Base de Datos

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| [DBEAVER_SETUP.md](./DBEAVER_SETUP.md) | Conectar a DBeaver para ver la BD | Todos |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Esquema ER y especificaciones | DBA/Backend |
| [MIGRACION_MONGODB_A_POSTGRESQL.md](./MIGRACION_MONGODB_A_POSTGRESQL.md) | Migración desde MongoDB | Developers/DevOps |
| [SQL_QUERIES.md](./SQL_QUERIES.md) | Consultas SQL comunes | DBA/Developers |

### 🚀 Deploy y Producción

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| **[RENDER_QUICKSTART.md](./RENDER_QUICKSTART.md)** | ⭐ **Deploy gratis en 10 min** | Todos |
| [DEPLOY_GRATUITO.md](./DEPLOY_GRATUITO.md) | Comparativa Render vs Vercel vs Railway | Developers |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Guía avanzada de deployment | DevOps/Seniors |

---

## � Flujos de Trabajo

### Para Primeros Pasos

```
1. QUICK_START.md (5 min)
   ↓
2. Verificar PostgreSQL
   ↓
3. npm run dev + npm run dev:frontend
   ↓
4. http://localhost:5500
   ↓
5. Registrarse y usar la app
```

### Para Entender Autenticación

```
1. AUTH_SYSTEM.md
   ↓
2. Crear usuario normal
   ↓
3. Promover a admin: ./promote-admin.sh email@example.com
   ↓
4. Ver panel de administrador
   ↓
5. Crear nueva regla diagnóstica
```

### Para Verificar Datos en BD

```
1. DBEAVER_SETUP.md
   ↓
2. Conectar DBeaver
   ↓
3. Navegar a: expertos → public → tablas
   ↓
4. Ver usuarios, reglas, casos
```

### Para Probar Todo

```
1. TESTING_GUIDE.md
   ↓
2. Ejecutar checklist de funcionalidades
   ↓
3. Verificar seguridad
   ↓
4. Consultar BD directamente
```

---

## � Búsqueda Rápida

## 🔍 Búsqueda Rápida

### ❓ "¿Por dónde empiezo?"
👉 **[QUICK_START.md](./QUICK_START.md)** - 5 minutos

### ❓ "¿Cómo despliego en Render gratis?"
👉 **[RENDER_QUICKSTART.md](./RENDER_QUICKSTART.md)** ⭐ 10 MINUTOS

### ❓ "¿Quiero otros servicios (Vercel, Railway)?"
👉 **[DEPLOY_GRATUITO.md](./DEPLOY_GRATUITO.md)** - Todas las opciones

### ❓ "¿Cómo conecto a DBeaver?"
👉 **[DBEAVER_SETUP.md](./DBEAVER_SETUP.md)** - Pasos claros

### ❓ "¿Cómo creo un usuario admin?"
👉 **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Sección "Crear Usuarios"

### ❓ "¿Cómo pruebo que todo funciona?"
👉 **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Checklist completo

### ❓ "¿Cómo creo nuevas reglas como admin?"
👉 **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Sección "Panel de Administrador"

### ❓ "¿Cuáles son los endpoints API?"
👉 **[README.md](./README.md)** - Sección "Endpoints"

### ❓ "¿Cómo migro datos de MongoDB?"
👉 **[MIGRACION_MONGODB_A_POSTGRESQL.md](./MIGRACION_MONGODB_A_POSTGRESQL.md)** 

### ❓ "PostgreSQL no funciona"
👉 **[QUICK_START.md](./QUICK_START.md)** - Sección "Solucionar Problemas"

---

## 📂 Estructura de Archivos

```
.
├── 📄 QUICK_START.md                  ⭐ COMIENZA AQUÍ
├── 📄 README.md                       ← Descripción general
├── 📄 AUTH_SYSTEM.md                  ← Autenticación + Roles
├── 📄 TESTING_GUIDE.md                ← Pruebas
├── 📄 DBEAVER_SETUP.md                ← Conectar BD
├── 📄 DOCUMENTATION_INDEX.md          ← Este archivo
│
├── 📄 MIGRATION_SUMMARY.md            ← Resumen cambios v2.0
├── 📄 MIGRACION_MONGODB_A_POSTGRESQL.md
├── 📄 DATABASE_SCHEMA.md
├── 📄 SQL_QUERIES.md
├── 📄 DEPLOYMENT_GUIDE.md
├── 📄 .env.example
├── 📄 setup.sh
│
├── 📁 back/
│   ├── main.js                   ← API + endpoints admin
│   ├── db.js                     ← Config Sequelize
│   ├── models/
│   │   ├── User.js              ← Actualizado con 'role'
│   │   ├── Rule.js
│   │   └── Case.js
│   ├── routes/
│   │   └── auth.js              ← Actualizado con rol
│   ├── middlewares/
│   │   ├── requireAuth.js
│   │   └── requireAdmin.js      ← NUEVO
│   └── seed_rules.js
│
├── 📁 front/
│   └── styles.css               ← Actualizado
│
├── index.html                    ← Actualizado con auth + admin
├── server-frontend.js            ← NUEVO
└── Arbol de Decision.json
```

---

## 🎓 Niveles de Usuario

### 👶 Principiante (Mi primera vez)
1. Leer [QUICK_START.md](./QUICK_START.md) (5 min)
2. Ejecutar los comandos
3. Registrarse en la app
4. ¡Hecho! Ahora tienes el sistema funcionando

### 🧑‍💻 Desarrollador
1. Leer [README.md](./README.md)
2. Revisar [AUTH_SYSTEM.md](./AUTH_SYSTEM.md)
3. Estudiar [back/](./back/) estructura
4. Hacer cambios en el código
5. Probar con [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### 🔧 DevOps / DBA
1. Leer [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Estudiar [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. Configurar BD en servidor
4. Desplegar la app

### 👨‍💼 Administrador de Sistema
1. Usar [QUICK_START.md](./QUICK_START.md) para instalar
2. Usar [DBEAVER_SETUP.md](./DBEAVER_SETUP.md) para monitorear
3. Usar `./promote-admin.sh` para gestionar admins
4. Revisar `AUTH_SYSTEM.md` para entender roles

---

## 📊 Stack Tecnológico

### Backend
- ✅ Node.js 18+
- ✅ Express 4.x
- ✅ Sequelize 6.x (ORM)
- ✅ PostgreSQL 12+
- ✅ JWT + Argon2

### Frontend
- ✅ HTML5 + CSS3
- ✅ Vanilla JavaScript (ES6+)
- ✅ Fetch API
- ✅ LocalStorage

### Herramientas
- ✅ DBeaver (BD)
- ✅ PostgreSQL CLI
- ✅ npm scripts

---

## � Seguridad

- ✅ Contraseñas con Argon2
- ✅ JWT con expiración
- ✅ CORS configurado
- ✅ Cookies HTTPOnly
- ✅ Rate limiting en auth
- ✅ Middleware de autorización por rol
- ✅ Helmet (headers de seguridad)

---

## � Checklist de Configuración

- [ ] Node.js v18+ instalado
- [ ] PostgreSQL 12+ instalado
- [ ] `npm install` completado
- [ ] `.env` configurado
- [ ] PostgreSQL corriendo
- [ ] BD `expertos` creada
- [ ] `npm run dev` funcionando
- [ ] `npm run dev:frontend` funcionando
- [ ] App accesible en http://localhost:5500
- [ ] Puedo registrarme
- [ ] DBeaver conectado (opcional)

---

## � Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| **2.1** | Nov 11, 2025 | Sistema de roles + Panel admin (ACTUAL) |
| 2.0 | Nov 11, 2025 | PostgreSQL + Sequelize |
| 1.0 | Oct 2025 | MongoDB + Mongoose |

---

## 🤝 Contribuir

Para modificar documentación:
1. Edita el archivo `.md`
2. Mantén la estructura
3. Incluye ejemplos de código
4. Actualiza este INDEX si creas nuevas guías
5. Haz commit con mensaje claro

---

## 📞 Ayuda Rápida

**Problema:** PostgreSQL no inicia
```bash
pg_ctl -D ~/postgresql -l ~/postgresql.log start
```

**Problema:** Puertos ocupados
```bash
lsof -i :5432  # BD
lsof -i :4000  # Backend
lsof -i :5500  # Frontend
```

**Problema:** BD no existe
```bash
createdb -U postgres expertos
```

**Solución rápida:** Ver [QUICK_START.md](./QUICK_START.md) Sección "Solucionar Problemas"

---

**⭐ Comienza con [QUICK_START.md](./QUICK_START.md)**

Última actualización: 11 de noviembre de 2025
