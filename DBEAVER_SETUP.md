# 🗄️ Conectar PostgreSQL a DBeaver

## 📋 Parámetros de Conexión

Usa estos parámetros para conectarte desde DBeaver:

| Parámetro | Valor |
|-----------|-------|
| **Server Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `expertos` |
| **Username** | `postgres` |
| **Password** | `password` |
| **SSL Mode** | `Disable` |

---

## 🚀 Pasos para Conectar en DBeaver

### 1️⃣ Crear Nueva Conexión

1. Abre **DBeaver**
2. Ve a **Database** → **New Database Connection**
3. O usa el atajo: **Cmd+Shift+N** (macOS)

### 2️⃣ Seleccionar PostgreSQL

1. Busca y selecciona **PostgreSQL**
2. Haz clic en **Next**

### 3️⃣ Rellenar los Parámetros

En la ventana de configuración, completa:

```
Server Host:     localhost
Port:            5432
Database:        expertos
Username:        postgres
Password:        password
```

**Opciones adicionales:**
- ✅ Dejar "Save password locally" marcado
- ✅ "SSL Mode" → "Disable" (por defecto)
- ✅ "Show all databases" → opcional

### 4️⃣ Probar Conexión

1. Haz clic en el botón **"Test Connection"** 
2. DBeaver descargará los drivers de PostgreSQL automáticamente
3. Deberías ver: ✅ **Connection successful**

### 5️⃣ Guardar Conexión

1. Haz clic en **Finish**
2. La conexión aparecerá en el panel izquierdo bajo **"Database"**

---

## 🔍 Navegación en DBeaver

Una vez conectado, deberías ver:

```
PostgreSQL - localhost:5432
├── expertos (BD)
│   ├── public (Schema)
│   │   ├── users (Tabla)
│   │   ├── rules (Tabla)
│   │   ├── cases (Tabla)
│   │   ├── enum_users_role (Tipo ENUM)
│   │   └── [Índices, Secuencias...]
│   └── [Otros schemas...]
```

---

## 🧪 Consultas Útiles en DBeaver

### Ver todos los usuarios

```sql
SELECT id, email, name, role, created_at FROM users;
```

### Ver todas las reglas

```sql
SELECT rule_id, fault, weight, conditions, advice FROM rules ORDER BY rule_id;
```

### Ver casos de diagnóstico

```sql
SELECT 
    c.id, 
    u.email, 
    c.timestamp, 
    c.selected, 
    c.results 
FROM cases c
JOIN users u ON c.user_id = u.id
ORDER BY c.timestamp DESC;
```

### Contar registros

```sql
SELECT 
    'users' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'rules', COUNT(*) FROM rules
UNION ALL
SELECT 'cases', COUNT(*) FROM cases;
```

### Promover usuario a admin

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu-email@example.com';
SELECT * FROM users WHERE email = 'tu-email@example.com';
```

---

## 🐛 Problemas Comunes

### ❌ "No se puede conectar"

**Posibles causas:**

1. **PostgreSQL no está corriendo**
   ```bash
   # Verificar estado
   pg_ctl -D ~/postgresql status
   
   # Si no está corriendo, inicia
   pg_ctl -D ~/postgresql -l ~/postgresql.log start
   ```

2. **Contraseña incorrecta**
   - Verifica que sea `password` (minúsculas)
   - Recuerda: setup inicial usa contraseña "password"

3. **Puerto incorrecto**
   - Verifica que PostgreSQL esté en puerto 5432
   ```bash
   lsof -i :5432
   ```

4. **BD expertos no existe**
   ```bash
   createdb -U postgres expertos
   ```

### ❌ "Connection refused"

```bash
# Reinicia PostgreSQL
pg_ctl -D ~/postgresql stop
pg_ctl -D ~/postgresql -l ~/postgresql.log start
```

### ❌ "SSL error"

En DBeaver:
- Ve a **Connection Settings**
- SSL Mode → selecciona **Disable**

---

## 📊 Estructura de la Base de Datos

### Tabla: `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Tabla: `rules`

```sql
CREATE TABLE rules (
    id UUID PRIMARY KEY,
    rule_id VARCHAR(255) UNIQUE NOT NULL,
    conditions VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    weight FLOAT DEFAULT 0.7,
    fault VARCHAR(255) NOT NULL,
    advice VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### Tabla: `cases`

```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE,
    selected VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    results JSON DEFAULT '[]',
    notes VARCHAR(255) DEFAULT '',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

---

## 🔐 Credenciales de Conexión

**Para localhost:**
```
Host:     localhost
Port:     5432
User:     postgres
Password: password
Database: expertos
```

**Para producción (cambiar según tu servidor):**
```
Host:     tu-servidor.com
Port:     5432
User:     usuario_prod
Password: contraseña_segura
Database: expertos_prod
SSL Mode: Require
```

---

## 📱 Alternativas a DBeaver

Si prefieres otras herramientas:

1. **pgAdmin** - Interface web
   ```bash
   # Acceso en desarrollo (si lo instalas)
   http://localhost:5050
   ```

2. **psql** - Línea de comandos
   ```bash
   psql -U postgres -d expertos
   ```

3. **VS Code + SQLTools**
   - Extensión: SQLTools
   - SQLTools PostgreSQL/MySQL/SQLite
   - Configuración similar a DBeaver

4. **DataGrip** - IDE de JetBrains (de pago)

---

## ✅ Checklist

- [ ] PostgreSQL está corriendo
- [ ] DBeaver está instalado
- [ ] Parámetros de conexión son correctos
- [ ] Test Connection pasó exitosamente
- [ ] Puedes ver la BD `expertos`
- [ ] Puedes ver las tablas: users, rules, cases
- [ ] Puedes ejecutar queries SQL

---

**Última actualización:** 11 de noviembre de 2025
