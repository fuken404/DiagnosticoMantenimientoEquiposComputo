# 🚀 Guía de Inicio Rápido

## ⚡ En 5 Minutos

### Paso 1: Verificar PostgreSQL

```bash
# Verificar si PostgreSQL está corriendo
pg_ctl -D ~/postgresql status

# Si no está corriendo:
pg_ctl -D ~/postgresql -l ~/postgresql.log start
```

### Paso 2: Iniciar Servidores

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev:frontend
```

### Paso 3: Acceder a la Aplicación

- 🌐 Frontend: http://localhost:5500
- 🔌 API: http://localhost:4000/api/health

### Paso 4: Registrarse

1. Abre http://localhost:5500
2. Haz clic en "Crear cuenta"
3. Rellena los datos
4. ¡Listo! Ya puedes diagnosticar equipos

### Paso 5: Conectar a DBeaver (Opcional)

1. Abre DBeaver
2. **Database** → **New Database Connection**
3. Selecciona **PostgreSQL**
4. Rellena:
   - Host: `localhost`
   - Port: `5432`
   - Database: `expertos`
   - Username: `postgres`
   - Password: `password`
5. Click en **Test Connection** → ✅

---

## 📊 Verificar Datos en Terminal

```bash
# Ver usuarios
psql -U postgres -d expertos -c "SELECT email, role FROM users;"

# Ver reglas
psql -U postgres -d expertos -c "SELECT rule_id, fault FROM rules LIMIT 5;"

# Ver casos
psql -U postgres -d expertos -c "SELECT c.id, u.email, c.timestamp FROM cases c JOIN users u ON c.user_id = u.id LIMIT 5;"
```

---

## 🔐 Promover Usuario a Admin

```bash
# Cambiar rol de usuario
psql -U postgres -d expertos -c "UPDATE users SET role = 'admin' WHERE email = 'tu-email@example.com';"

# Verificar
psql -U postgres -d expertos -c "SELECT email, role FROM users WHERE email = 'tu-email@example.com';"
```

---

## 📁 Estructura de Carpetas

```
├── back/
│   ├── main.js              ← Servidor principal
│   ├── db.js                ← Conexión PostgreSQL
│   ├── models/              ← User, Rule, Case
│   ├── routes/auth.js       ← Autenticación
│   └── middlewares/         ← requireAuth, requireAdmin
├── front/
│   └── styles.css
├── index.html               ← Aplicación web
├── server-frontend.js       ← Servidor estático
├── package.json
├── .env                     ← Variables de entorno
└── README.md
```

---

## 🔧 Solucionar Problemas

### PostgreSQL no inicia

```bash
# Ver logs
cat ~/postgresql.log

# Reiniciar desde cero
pg_ctl -D ~/postgresql stop
rm -rf ~/postgresql
initdb ~/postgresql -U postgres
pg_ctl -D ~/postgresql -l ~/postgresql.log start
createdb -U postgres expertos
```

### Puertos ocupados

```bash
# Ver qué está usando puerto 5432
lsof -i :5432

# Ver qué está usando puerto 4000
lsof -i :4000

# Ver qué está usando puerto 5500
lsof -i :5500
```

### Problemas de conexión en frontend

1. ¿Está el backend corriendo? → `npm run dev`
2. ¿Está el frontend corriendo? → `npm run dev:frontend`
3. ¿Está PostgreSQL corriendo? → `pg_ctl -D ~/postgresql status`

---

## 📚 Documentación Completa

- 📖 [README.md](./README.md) - Descripción general
- 🔐 [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - Sistema de autenticación
- 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guía de pruebas
- 💾 [DBEAVER_SETUP.md](./DBEAVER_SETUP.md) - Configurar DBeaver
- 📊 [MIGRACION_MONGODB_A_POSTGRESQL.md](./MIGRACION_MONGODB_A_POSTGRESQL.md) - Detalles técnicos

---

## 🎯 Funcionalidades

### ✅ Usuario Regular
- Registrarse e iniciar sesión
- Diagnosticar equipos
- Exportar casos en JSON
- Ver historial de diagnósticos

### ✅ Administrador
- Todo lo del usuario
- **Crear nuevas reglas diagnósticas**
- Editar/eliminar reglas

---

## 🐛 Debugging Rápido

```bash
# Ver logs del servidor
npm run dev

# Ver logs de PostgreSQL
tail -f ~/postgresql.log

# Conectar a BD desde terminal
psql -U postgres -d expertos

# Ver procesos Node.js
ps aux | grep node

# Matar todos los procesos Node.js
killall node
```

---

## 📝 Variables de Entorno (.env)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expertos
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=una_clave_larga_aleatoria_super_secreta
JWT_EXPIRES=7d

# Servidor
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
TZ=America/Bogota
```

---

## 🚀 Deploy (Futuro)

Para producción:
1. Cambiar `NODE_ENV=production`
2. Usar bases de datos en servidor remoto
3. Configurar variables de entorno seguras
4. Habilitar SSL/HTTPS
5. Configurar CORS para producción

---

**¿Necesitas ayuda?** Ver documentos individuales o contactar soporte.

**Última actualización:** 11 de noviembre de 2025
