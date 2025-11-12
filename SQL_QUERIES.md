-- Guía de Consultas SQL Comunes
-- Base de datos: expertos
-- Última actualización: 11 de noviembre de 2025

-- ========================================
-- USUARIOS
-- ========================================

-- Ver todos los usuarios
SELECT * FROM "Users";

-- Ver usuario específico
SELECT * FROM "Users" WHERE email = 'usuario@example.com';

-- Contar usuarios registrados
SELECT COUNT(*) as total_usuarios FROM "Users";

-- Usuarios más activos (por casos)
SELECT u.email, u.name, COUNT(c.id) as total_casos
FROM "Users" u
LEFT JOIN "Cases" c ON u.id = c."userId"
GROUP BY u.id
ORDER BY total_casos DESC;

-- Eliminar usuario (y sus casos)
DELETE FROM "Cases" WHERE "userId" = 'uuid-aqui';
DELETE FROM "Users" WHERE id = 'uuid-aqui';

-- ========================================
-- REGLAS
-- ========================================

-- Ver todas las reglas
SELECT * FROM "Rules" ORDER BY "ruleId";

-- Ver regla específica
SELECT * FROM "Rules" WHERE "ruleId" = 'F01';

-- Contar total de reglas
SELECT COUNT(*) as total_reglas FROM "Rules";

-- Ver reglas por condición
SELECT * FROM "Rules" 
WHERE "conditions" @> '["no_power"]'::jsonb;

-- Reglas con mayor peso
SELECT "ruleId", fault, weight FROM "Rules"
ORDER BY weight DESC LIMIT 10;

-- Buscar falla por palabra clave
SELECT "ruleId", fault FROM "Rules"
WHERE fault ILIKE '%fuente%' OR fault ILIKE '%poder%';

-- ========================================
-- CASOS / DIAGNÓSTICOS
-- ========================================

-- Ver todos los casos
SELECT * FROM "Cases" ORDER BY "createdAt" DESC;

-- Ver casos de un usuario específico
SELECT * FROM "Cases" 
WHERE "userId" = 'uuid-aqui'
ORDER BY "createdAt" DESC;

-- Casos del último mes
SELECT * FROM "Cases"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY "createdAt" DESC;

-- Contar casos por día
SELECT DATE("createdAt") as fecha, COUNT(*) as cantidad
FROM "Cases"
GROUP BY DATE("createdAt")
ORDER BY fecha DESC;

-- Síntomas más comunes
SELECT DISTINCT "selected" FROM "Cases" LIMIT 10;

-- Casos con resultados específicos
SELECT id, timestamp, notes FROM "Cases"
WHERE results::text LIKE '%F01%'
ORDER BY "createdAt" DESC;

-- Eliminar caso específico
DELETE FROM "Cases" WHERE id = 'uuid-aqui';

-- Limpiar casos antiguos (más de 6 meses)
DELETE FROM "Cases"
WHERE "createdAt" < CURRENT_DATE - INTERVAL '180 days';

-- ========================================
-- ESTADÍSTICAS
-- ========================================

-- Dashboard general
SELECT 
  (SELECT COUNT(*) FROM "Users") as usuarios,
  (SELECT COUNT(*) FROM "Rules") as reglas,
  (SELECT COUNT(*) FROM "Cases") as casos_total,
  (SELECT COUNT(*) FROM "Cases" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days') as casos_ultima_semana;

-- Casos por usuario en el último mes
SELECT u.email, COUNT(c.id) as casos
FROM "Users" u
LEFT JOIN "Cases" c ON u.id = c."userId"
  AND c."createdAt" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.email
ORDER BY casos DESC;

-- Promedio de resultados por caso
SELECT 
  COUNT(*) as total_casos,
  COUNT(results) as casos_con_resultados,
  ROUND(100.0 * COUNT(results) / COUNT(*), 2) as porcentaje_completados
FROM "Cases";

-- ========================================
-- MANTENIMIENTO
-- ========================================

-- Ver tamaño de tablas
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamaño
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver conexiones activas
SELECT pid, usename, application_name, state
FROM pg_stat_activity
WHERE datname = 'expertos';

-- Verificar índices
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- VACUUM (optimización)
VACUUM ANALYZE;

-- ========================================
-- COPIAS DE SEGURIDAD
-- ========================================

-- Exportar datos a CSV (ejecutar desde terminal)
-- psql -U postgres -d expertos -c "\COPY \"Users\" TO '/tmp/users.csv' CSV HEADER"
-- psql -U postgres -d expertos -c "\COPY \"Rules\" TO '/tmp/rules.csv' CSV HEADER"
-- psql -U postgres -d expertos -c "\COPY \"Cases\" TO '/tmp/cases.csv' CSV HEADER"

-- Respaldar toda la BD (desde terminal)
-- pg_dump -U postgres expertos > backup_expertos.sql

-- Restaurar respaldo (desde terminal)
-- psql -U postgres expertos < backup_expertos.sql

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

/*
1. Los UUIDs se generan automáticamente con UUIDV4
2. Las fechas se guardan en UTC (createdAt, updatedAt)
3. Los arrays se almacenan como ARRAY en PostgreSQL
4. JSON se almacena como JSONB para mejor rendimiento
5. Para arrays: usa @> (contains) en queries
   Ejemplo: WHERE "conditions" @> '["no_power"]'::jsonb
6. El usuario postgres es el admin por defecto
7. Para producción: crea usuario con permisos limitados
*/

-- Crear usuario con permisos limitados (recomendado para producción)
-- CREATE USER app_user WITH PASSWORD 'contraseña_segura';
-- GRANT CONNECT ON DATABASE expertos TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
