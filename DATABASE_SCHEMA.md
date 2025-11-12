# 📊 Estructura de la Base de Datos

## Diagrama ER (Entity-Relationship)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌──────────────┐                         │
│                    │    USERS     │                         │
│                    ├──────────────┤                         │
│                    │ id (PK)      │◄───────────┐            │
│                    │ email        │            │            │
│                    │ name         │            │ (1..*)     │
│                    │ passwordHash │            │            │
│                    │ createdAt    │            │            │
│                    │ updatedAt    │            │            │
│                    └──────────────┘            │            │
│                                               │            │
│                                               │            │
│                    ┌──────────────┐           │ (0..1)     │
│                    │    CASES     │───────────┘            │
│                    ├──────────────┤                         │
│                    │ id (PK)      │                         │
│                    │ timestamp    │                         │
│                    │ selected[]   │                         │
│                    │ results (JSON)│                        │
│                    │ notes        │                         │
│                    │ userId (FK)  │                         │
│                    │ createdAt    │                         │
│                    │ updatedAt    │                         │
│                    └──────────────┘                         │
│                                                             │
│                    ┌──────────────┐                         │
│                    │    RULES     │                         │
│                    ├──────────────┤                         │
│                    │ id (PK)      │                         │
│                    │ ruleId       │ (F01, F02, etc.)      │
│                    │ conditions[] │                         │
│                    │ weight       │ (0.0 - 1.0)           │
│                    │ fault        │                         │
│                    │ advice[]     │                         │
│                    │ createdAt    │                         │
│                    │ updatedAt    │                         │
│                    └──────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Especificación de Tablas

### 1. Tabla: `Users` (Usuarios)

**Propósito:** Almacenar información de usuarios registrados

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Identificador único del usuario |
| `email` | VARCHAR | UNIQUE, NOT NULL | Correo electrónico único |
| `name` | VARCHAR | - | Nombre del usuario |
| `passwordHash` | VARCHAR | NOT NULL | Contraseña encriptada con Argon2 |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha de última actualización |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `email`

**Relaciones:**
- 1 Usuario → Muchos Casos (1:N)

---

### 2. Tabla: `Rules` (Reglas de Diagnóstico)

**Propósito:** Almacenar reglas del árbol de decisión para diagnóstico

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Identificador único de la regla |
| `ruleId` | VARCHAR | UNIQUE, NOT NULL | ID de la regla (F01, F02, etc.) |
| `conditions` | ARRAY(VARCHAR) | DEFAULT '{}' | Array de condiciones requeridas |
| `weight` | FLOAT | CHECK (0-1) | Peso/confianza de la regla (0.0-1.0) |
| `fault` | VARCHAR | NOT NULL | Descripción de la falla detectada |
| `advice` | ARRAY(VARCHAR) | DEFAULT '{}' | Array de recomendaciones |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha de última actualización |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `ruleId`

**Relaciones:**
- Independiente (referenciado por Casos)

---

### 3. Tabla: `Cases` (Casos/Diagnósticos)

**Propósito:** Registrar cada diagnóstico realizado por un usuario

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT UUIDV4 | Identificador único del caso |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | Cuando se realizó el diagnóstico |
| `selected` | ARRAY(VARCHAR) | DEFAULT '{}' | Array de síntomas seleccionados |
| `results` | JSONB | - | Resultados del diagnóstico (objeto JSON) |
| `notes` | TEXT | - | Notas adicionales del usuario |
| `userId` | UUID | FOREIGN KEY | Referencia al usuario propietario |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de creación del registro |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha de última actualización |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `userId` → `Users.id`

**Relaciones:**
- N Casos ← 1 Usuario

---

## 🔄 Relaciones

### Relación: Users ↔ Cases (1:N)

```
Un Usuario puede tener MUCHOS Casos
Un Caso pertenece a UN Usuario
```

**Integridad Referencial:**
- ON DELETE: CASCADE (si se elimina usuario, se eliminan sus casos)
- ON UPDATE: CASCADE (si cambia el ID de usuario, se actualiza en casos)

---

## 📝 Ejemplos de Datos

### Users
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "passwordHash": "$argon2id$v=19$m=65540,t=3,p=4$...",
  "createdAt": "2025-11-11T10:30:00Z",
  "updatedAt": "2025-11-11T10:30:00Z"
}
```

### Rules
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "ruleId": "F01",
  "conditions": ["no_power", "no_beeps"],
  "weight": 0.85,
  "fault": "Falla en fuente de poder",
  "advice": [
    "Verificar conexión de poder",
    "Probar con otra fuente de poder",
    "Revisar botón de encendido"
  ],
  "createdAt": "2025-11-11T08:00:00Z",
  "updatedAt": "2025-11-11T08:00:00Z"
}
```

### Cases
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2025-11-11T14:45:00Z",
  "selected": ["no_power", "no_beeps", "ventiladores_giran"],
  "results": [
    {
      "ruleId": "F01",
      "score": 0.85,
      "matched": 2,
      "total": 3,
      "weight": 0.85
    }
  ],
  "notes": "El equipo no enciende desde esta mañana",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-11T14:45:00Z",
  "updatedAt": "2025-11-11T14:45:00Z"
}
```

---

## 🔐 Seguridad de Datos

### Campos Sensibles

| Campo | Encriptación | Método |
|-------|--------------|--------|
| `passwordHash` | ✅ Sí | Argon2 (no reversible) |
| `email` | ❌ No | Almacenado en texto plano |
| `userId` | ❌ No | UUID visible |

### Validaciones

- **Emails:** Únicos, lowercase, trimmed
- **Passwords:** Mínimo 8 caracteres, hasheadas
- **UUIDs:** Generados automáticamente
- **Arrays:** Validadas en aplicación
- **Weight:** Entre 0 y 1

---

## 🎯 Queries Comunes

### Obtener casos de un usuario
```sql
SELECT * FROM "Cases"
WHERE "userId" = $1
ORDER BY "createdAt" DESC;
```

### Buscar regla por ID
```sql
SELECT * FROM "Rules"
WHERE "ruleId" = $1;
```

### Contar diagnósticos del mes
```sql
SELECT COUNT(*) FROM "Cases"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days';
```

### Obtener usuario por email
```sql
SELECT * FROM "Users"
WHERE email = $1;
```

---

## 📈 Tamaño Aproximado

Considerando 10,000 usuarios, 100,000 casos y 50 reglas:

| Tabla | Filas | Tamaño Aprox. |
|-------|-------|--------------|
| Users | 10,000 | ~2 MB |
| Rules | 50 | ~50 KB |
| Cases | 100,000 | ~50 MB |
| **Total** | **110,050** | **~52 MB** |

---

## 🔧 Mantenimiento

### Backups Recomendados
- **Diarios:** Completos
- **Por hora:** Incrementales
- **Ubicación:** Almacenamiento seguro/cloud

### Limpieza
```sql
-- Eliminar casos más antiguos de 6 meses
DELETE FROM "Cases"
WHERE "createdAt" < CURRENT_DATE - INTERVAL '180 days';

-- Optimizar tablas
VACUUM ANALYZE;
```

---

**Última actualización:** 11 de noviembre de 2025
