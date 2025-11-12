# 🔐 Sistema de Autenticación y Roles

## 📋 Descripción

Se ha implementado un sistema completo de autenticación con soporte para dos roles:

- **👤 Usuario Regular**: Puede diagnosticar equipos usando el motor de inferencia
- **👨‍💼 Administrador**: Además de diagnosticar, puede crear y editar nuevas reglas diagnósticas

## 🚀 Funcionalidades

### Para Usuarios
- ✅ Registro de cuenta nueva
- ✅ Inicio de sesión
- ✅ Acceso al motor de diagnóstico completo
- ✅ Exportar casos en JSON
- ✅ Historial de casos guardados en BD

### Para Administradores
- ✅ Todas las funcionalidades de usuario
- ✅ **Panel de administración** con form para crear nuevas reglas
- ✅ Crear reglas con: ID, falla, peso, condiciones y recomendaciones
- ✅ Las nuevas reglas se sincronizan automáticamente en el motor

## 🔑 Credenciales de Prueba

### Usuario Normal
```
Email: usuario@example.com
Contraseña: usuario123
Rol: user
```

### Administrador
```
Email: admin@example.com
Contraseña: admin123
Rol: admin
```

⚠️ **Nota:** Estos usuarios deben crearse manualmente. Ver sección "Crear Usuarios de Prueba" abajo.

## 📱 Interfaz

### Flujo de Login
1. Al abrir la aplicación, aparece un modal de autenticación
2. Opciones: "Iniciar sesión" o "Crear cuenta"
3. Los datos se guardan en `localStorage` (persisten entre sesiones)

### Panel de Usuario
- Ubicado en la esquina superior derecha
- Muestra: Nombre + rol (si es admin)
- Botón "Cerrar sesión" para logout

### Panel de Administrador
- Visible solo para usuarios con rol `admin`
- Ubicado arriba del área principal de diagnóstico
- Campos:
  - **ID de Regla**: Ej: `F19`, `F20`
  - **Falla/Diagnóstico**: Descripción del problema
  - **Peso**: Factor de certeza (0-1), default 0.7
  - **Condiciones**: IDs de condiciones separadas por comas
  - **Recomendaciones**: Una por línea

### Ejemplo de Creación de Regla
```
ID: F19
Falla: Disco duro con problemas de SMART
Peso: 0.85
Condiciones: disk_detected, smart_errors
Recomendaciones: 
  - Respalda datos inmediatamente
  - Reemplaza el disco duro
  - Verifica la salud SMART con herramientas como HD Sentinel
```

## 🔧 Crear Usuarios de Prueba

### Opción 1: Mediante el Frontend (Recomendado)
1. Abre http://localhost:5500
2. Haz clic en "Crear cuenta"
3. Ingresa email, nombre y contraseña
4. ✅ Cuenta creada automáticamente como `user`

### Opción 2: Hacer Admin a un Usuario Existente
```sql
UPDATE users SET role = 'admin' WHERE email = 'tu-email@example.com';
```

### Opción 3: Crear Usuario Admin Directamente
```bash
# Con Node.js (en el proyecto)
node -e "
const argon2 = require('argon2');
(async () => {
  const hash = await argon2.hash('micontraseña', { type: argon2.argon2id });
  console.log(hash);
})();
"

# Luego insertar en BD:
# INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
# VALUES (gen_random_uuid(), 'nuevo@admin.com', 'Mi Admin', 'HASH_AQUI', 'admin', NOW(), NOW());
```

## 🔐 Seguridad

- ✅ **Contraseñas**: Hasheadas con Argon2 (salt automático)
- ✅ **Tokens JWT**: Expiran en 7 días
- ✅ **Cookies**: HTTPOnly, Secure (en producción), SameSite
- ✅ **Rate Limiting**: 50 intentos por 15 minutos en `/api/auth`
- ✅ **CORS**: Restringido a localhost (configurable en `.env`)
- ✅ **Middleware**: Validación de rol en endpoints `/api/admin/*`

## 📡 Endpoints API

### Autenticación
```
POST   /api/auth/register      - Registrar usuario nuevo
POST   /api/auth/login         - Iniciar sesión
POST   /api/auth/logout        - Cerrar sesión
GET    /api/auth/me            - Obtener datos del usuario actual
```

### Diagnóstico (Público)
```
GET    /api/rules              - Obtener todas las reglas
POST   /api/cases              - Guardar un caso de diagnóstico (requiere auth)
GET    /api/cases              - Listar últimos 5 casos (requiere auth)
GET    /api/my-cases           - Listar mis casos (requiere auth)
```

### Administración (Solo Admin)
```
GET    /api/admin/rules        - Listar todas las reglas (con detalles)
POST   /api/admin/rules        - Crear nueva regla
PUT    /api/admin/rules/:id    - Editar regla existente
DELETE /api/admin/rules/:id    - Eliminar regla
```

## 🔄 Flujo de Datos

```
Frontend (localhost:5500)
    ↓
    ├─ localStorage (currentUser, token implícito en cookies)
    ├─ Modal de Auth
    └─ API Calls (/api/auth/login, /api/auth/register)
          ↓
Backend (localhost:4000)
    ├─ Express + Sequelize
    ├─ PostgreSQL (BD: expertos)
    └─ Middlewares (requireAuth, requireAdmin)
          ↓
    Response con JWT en Cookie
```

## 🧪 Pruebas Recomendadas

### 1. Crear Usuario Nuevo
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"password123"}'
```

### 2. Iniciar Sesión
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 3. Crear Regla (como Admin)
```bash
curl -X POST http://localhost:4000/api/admin/rules \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "ruleId":"F99",
    "fault":"Problema de ejemplo",
    "weight":0.8,
    "conditions":["no_power","power_cable_ok"],
    "advice":["Verifica el cable","Reinicia el equipo"]
  }'
```

### 4. Obtener Datos del Usuario
```bash
curl http://localhost:4000/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## 📝 Variables de Entorno (.env)

```env
# BD
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expertos
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=una_clave_larga_aleatoria_super_secreta
JWT_EXPIRES=7d

# API
PORT=4000
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
NODE_ENV=development
TZ=America/Bogota
```

## ❓ FAQ

### P: ¿Cómo cambio una contraseña?
R: No hay endpoint de cambio de contraseña aún. Puedes actualizar directamente en BD haciendo hash con Argon2.

### P: ¿Qué pasa si olvido la contraseña?
R: No hay recuperación aún. En producción, implementar email de recuperación.

### P: ¿Un admin puede ver los casos de otros usuarios?
R: Actualmente, `/api/cases` muestra los últimos 5 casos globales. Se recomienda agregar filtrado por usuario.

### P: ¿Puedo crear reglas desde la API sin el frontend?
R: Sí, con curl o Postman. Requiere estar autenticado como admin y enviar JWT en header o cookie.

## 🚀 Próximas Mejoras

- [ ] Endpoints para cambio de contraseña
- [ ] Recuperación de contraseña por email
- [ ] Gestión de usuarios (crear/editar/borrar) para admins
- [ ] Auditoría de acciones de admin
- [ ] Roles adicionales (moderador, soporte)
- [ ] 2FA (autenticación de dos factores)
- [ ] Exportar reglas a JSON
- [ ] Búsqueda y filtrado de casos

---

**Última actualización:** 11 de noviembre de 2025
