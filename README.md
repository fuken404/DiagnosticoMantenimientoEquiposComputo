# 🔧 Sistema Experto - Diagnóstico de Mantenimiento de Equipos de Cómputo

Desarrollo de un sistema experto para el diagnóstico y mantenimiento de hardware en distintos equipos de cómputo.

**✨ Versión 2.1:** Migrado de MongoDB a PostgreSQL + Sistema de Autenticación y Roles

---

## 🛠️ Tecnologías

### Backend
- **Node.js + Express** - Servidor HTTP
- **Sequelize 6** - ORM para PostgreSQL
- **PostgreSQL 12+** - Base de datos relacional
- **JWT + Argon2** - Autenticación segura con roles
- **Helmet + CORS** - Seguridad

### Frontend
- **HTML5 + CSS3** - Interfaz moderna
- **Vanilla JavaScript** - Lógica del cliente
- **Fetch API + LocalStorage** - Persistencia y comunicación REST
- **Modal dialogs** - Interfaz de autenticación

---

## 🚀 Inicio Rápido

### 1. Requisitos
- Node.js v18+
- PostgreSQL 12+
- npm

### 2. Instalación

```bash
# Clonar repositorio
git clone <repo>
cd DiagnosticoMantenimientoEquiposComputo

# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env

# Editar .env con credenciales de PostgreSQL
nano .env
```

### 3. Configurar Base de Datos

```bash
# Crear BD en PostgreSQL
psql -U postgres -c "CREATE DATABASE expertos;"

# Iniciar servidor (las tablas se crean automáticamente)
npm run dev

# En otra terminal: Iniciar frontend
npm run dev:frontend
```

### 4. Cargar Datos

```bash
# En otra terminal
npm run seed:rules
```

### 5. Acceder a la Aplicación

- 🌐 **Frontend:** http://localhost:5500
- 🔌 **Backend API:** http://localhost:4000

---

## � Autenticación y Roles

### 👤 Usuario Regular
- Acceso al motor de diagnóstico
- Crear y exportar casos
- Ver historial de diagnósticos

### 👨‍💼 Administrador
- Todo lo del usuario regular
- **Panel de administración para crear nuevas reglas**
- Gestionar condiciones de diagnóstico
- Ver y editar reglas existentes

**Ver [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) para documentación completa del sistema de autenticación.**

---

## �📁 Estructura

```
├── back/                      # Backend Node.js
│   ├── main.js               # Servidor + endpoints admin
│   ├── db.js                 # Configuración Sequelize
│   ├── models/               
│   │   ├── User.js           # Con nuevo campo 'role'
│   │   ├── Rule.js           # Reglas diagnósticas
│   │   └── Case.js           # Casos diagnosticados
│   ├── routes/
│   │   └── auth.js           # Autenticación actualizada
│   ├── middlewares/
│   │   ├── requireAuth.js    # Validar JWT
│   │   └── requireAdmin.js   # Validar rol admin (NUEVO)
│   └── seed_rules.js         # Cargar reglas iniciales
├── front/                    # Frontend
│   └── styles.css           # Estilos actualizados
├── index.html               # Interfaz con auth y admin panel
├── AUTH_SYSTEM.md           # Documentación de roles (NUEVO)
└── README.md                # Esta guía
```

---

## 📝 Variables de Entorno

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expertos
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta_larga
JWT_EXPIRES=7d

# Servidor
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
TZ=America/Bogota
```

---

## 🔄 Migración desde MongoDB

Si tienes datos en MongoDB:

```bash
npm run migrate:data
```

Ver [MIGRACION_MONGODB_A_POSTGRESQL.md](./MIGRACION_MONGODB_A_POSTGRESQL.md) para detalles.

---

## ✅ Cambios Principales (v2.1)

| Aspecto | v1.0 | v2.0 | v2.1 |
|--------|------|------|------|
| BD | MongoDB | **PostgreSQL** | PostgreSQL |
| ORM | Mongoose | **Sequelize** | Sequelize |
| Auth | ❌ | ✅ JWT | ✅ **Con Roles** |
| Roles | ❌ | ❌ | ✅ **user/admin** |
| Panel Admin | ❌ | ❌ | ✅ **Crear reglas** |

---

## 🔐 Seguridad

✅ Contraseñas con Argon2 (salt automático)
✅ JWT con expiración configurable
✅ CORS restringido por origen
✅ Cookies HTTPOnly + SameSite
✅ Rate limiting en endpoints de auth
✅ Middleware de autorización por rol

---

## 💡 Comandos Útiles

```bash
# Desarrollo (todos los servidores)
npm run dev:all

# Por separado
npm run dev              # Backend
npm run dev:frontend     # Frontend (nuevo)

# Cargar reglas diagnósticas
npm run seed:rules

# Migrar datos desde MongoDB
npm run migrate:data

# Instalar dependencias
npm install
```

---

## 🌐 Endpoints

### Autenticación
```
POST   /api/auth/register      - Registrar usuario nuevo
POST   /api/auth/login         - Iniciar sesión  
GET    /api/auth/me            - Obtener datos usuario
POST   /api/auth/logout        - Cerrar sesión
```

### Diagnóstico
```
GET    /api/rules              - Todas las reglas
POST   /api/cases              - Guardar caso (auth requerida)
GET    /api/cases              - Últimos casos (auth requerida)
GET    /api/my-cases           - Mis casos (auth requerida)
```

### Administración (solo admin)
```
GET    /api/admin/rules        - Listar todas con detalles
POST   /api/admin/rules        - Crear regla nueva
PUT    /api/admin/rules/:id    - Editar regla
DELETE /api/admin/rules/:id    - Eliminar regla
```

---

## 🐛 Problemas Comunes

**Error: ECONNREFUSED (PostgreSQL)**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Iniciar PostgreSQL desde Services
```

**Error: database does not exist**
```bash
psql -U postgres -c "CREATE DATABASE expertos;"
```

**Error: role 'postgres' does not exist**
```bash
# Reiniciar PostgreSQL
brew services restart postgresql  # macOS
pg_ctl restart -D ~/postgresql    # Local cluster
```

**No puedo acceder a http://localhost:5500**
```bash
# Verifica que el servidor frontend esté corriendo
npm run dev:frontend
```

---

## 📚 Recursos

- [Documentación de Autenticación](./AUTH_SYSTEM.md)
- [Migración MongoDB → PostgreSQL](./MIGRACION_MONGODB_A_POSTGRESQL.md)
- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)

---

## 📄 Historial de Versiones

- **v2.1** - Sistema de roles (admin/user) + Panel de administración ← **ACTUAL**
- **v2.0** - Migración a PostgreSQL + Sequelize
- **v1.0** - MongoDB + Mongoose

**Última actualización:** 11 de noviembre de 2025
