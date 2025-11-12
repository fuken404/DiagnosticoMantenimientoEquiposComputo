#!/bin/bash
# Script para promover un usuario a administrador
# Uso: ./promote-admin.sh email@example.com

if [ -z "$1" ]; then
    echo "❌ Uso: ./promote-admin.sh <email>"
    echo "Ejemplo: ./promote-admin.sh admin@example.com"
    exit 1
fi

EMAIL=$1

echo "🔄 Promoviendo a admin: $EMAIL"

psql -U postgres -d expertos -c "UPDATE users SET role = 'admin' WHERE email = '$EMAIL';"

if [ $? -eq 0 ]; then
    echo "✅ Usuario promovido a admin correctamente"
    echo ""
    echo "Verificando:"
    psql -U postgres -d expertos -c "SELECT id, email, name, role FROM users WHERE email = '$EMAIL';"
else
    echo "❌ Error al promover usuario"
    exit 1
fi
