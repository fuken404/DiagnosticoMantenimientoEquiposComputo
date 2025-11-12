-- Script para crear usuarios de prueba
-- Ejecutar: psql -U postgres -d expertos -f create_test_users.sql

-- ⚠️ NOTA: Las contraseñas aquí son HASHES de argon2
-- Para crear un usuario admin con contraseña "admin123", usa el frontend o crea el hash con Node.js

-- Usuario Usuario Normal (contraseña: usuario123)
INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'usuario@example.com',
  'Usuario de Prueba',
  -- Este es un hash argon2 de "usuario123" (solo para referencia)
  '$argon2id$v=19$m=19456,t=2,p=1$JG1iQ2w3dURORUhWSDl5Zw$7CZVgBT1VVq2QKNBl5K8iHKV8uMbNBQ4zV0L7KjVq30',
  'user',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Usuario Administrador (contraseña: admin123)
INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'admin@example.com',
  'Administrador',
  -- Este es un hash argon2 de "admin123" (solo para referencia)
  '$argon2id$v=19$m=19456,t=2,p=1$SkpYaDd2Vk5pWFV3eHJCOQ$X8/qJL0l3E1nBcbkT5VwZmVsKKv4QNK5l5V5j5K5q50',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
