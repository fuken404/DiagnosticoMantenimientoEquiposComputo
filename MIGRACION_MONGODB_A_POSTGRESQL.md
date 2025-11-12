# 📘 Guía de Migración: MongoDB → PostgreSQL

## ✅ Cambios Realizados

Tu proyecto ha sido migrado de **MongoDB (NoSQL)** a **PostgreSQL (SQL)** usando **Sequelize** como ORM.

### 📦 Dependencias Actualizadas

**Removidas:**
- `mongoose` (ODM para MongoDB)

**Agregadas:**
- `sequelize` (ORM para SQL)
- `pg` (driver de PostgreSQL)
- `pg-hstore` (para JSONB en PostgreSQL)

### 📝 Archivos Modificados

1. **`package.json`** - Dependencias actualizadas
2. **`back/db.js`** - Configuración de conexión a PostgreSQL
3. **`back/models/User.js`** - Modelo Sequelize para usuarios
4. **`back/models/Rule.js`** - Modelo Sequelize para reglas
5. **`back/models/Case.js`** - Modelo Sequelize para casos
6. **`back/main.js`** - Actualizado para usar Sequelize
7. **`back/routes/auth.js`** - Adaptado a Sequelize
8. **`back/seed_rules.js`** - Script de seed con Sequelize

---

## 🚀 Pasos para Empezar

### 1. **Instalar PostgreSQL**

**macOS (con Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. **Crear la Base de Datos**

```bash
# Acceder a PostgreSQL
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE expertos;
\q
```

### 3. **Configurar Variables de Entorno**

Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expertos
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
JWT_SECRET=tu_clave_jwt_secreta_aqui
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

### 4. **Instalar Dependencias**

```bash
npm install
```

### 5. **Iniciar el Servidor**

```bash
npm run dev
```

El servidor se iniciará y sincronizará automáticamente los modelos con la BD.

### 6. **Cargar Reglas (Seed)**

En otra terminal:
```bash
npm run seed:rules
```

---

## 📊 Cambios en los Modelos

### Anterior (Mongoose)
```javascript
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, ... },
  name: { type: String, ... },
  passwordHash: { type: String, ... }
}, { timestamps: true });
```

### Ahora (Sequelize)
```javascript
const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, ... },
  name: { type: DataTypes.STRING, ... },
  passwordHash: { type: DataTypes.STRING, ... }
}, { timestamps: true });
```

### Cambios Clave:
- **IDs:** Ahora son UUIDs en lugar de ObjectIds de MongoDB
- **Queries:** `User.findOne({ email })` → `User.findOne({ where: { email } })`
- **Operaciones:** `deleteMany()` → `destroy({ where: {} })`
- **Inserciones:** `insertMany()` → `bulkCreate()`

---

## 📱 Cambios en las APIs

Las rutas permanecen igual, pero algunos cambios internos:

### Antes
```javascript
const doc = await Case.create({ ...req.body, user: req.user.id });
res.json({ _id: doc._id });
```

### Ahora
```javascript
const doc = await Case.create({ ...req.body, userId: req.user.id });
res.json({ id: doc.id });
```

---

## 🔐 Seguridad

- Las contraseñas continúan encriptadas con **Argon2**
- Los tokens JWT funcionan igual
- La autenticación mantiene los mismos estándares

---

## 🛠️ Troubleshooting

### Error: "connect ECONNREFUSED"
- Asegúrate que PostgreSQL está corriendo: `brew services list`
- Verifica las credenciales en `.env`

### Error: "Unique constraint violation"
- Si migraste datos de MongoDB, comprueba que no hay duplicados
- Usa: `DELETE FROM users WHERE email IS NULL;`

### Error: "Module not found: pg"
- Ejecuta: `npm install`

---

## 📚 Recursos Útiles

- [Sequelize Docs](https://sequelize.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [CLI PostgreSQL](https://www.postgresql.org/docs/current/app-psql.html)

---

## ✨ Ventajas de SQL

✅ **Mejor para datos relacionales** - Tus casos, reglas y usuarios están mejor conectados
✅ **ACID garantizado** - Transacciones seguras
✅ **Escalabilidad** - Mejor rendimiento con grandes volúmenes de datos
✅ **SQL estándar** - Compatible con cualquier herramienta SQL
✅ **Queries complejas** - Más potencia para análisis

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.
