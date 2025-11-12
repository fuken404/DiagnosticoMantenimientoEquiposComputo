#!/bin/bash

# Script de configuración inicial para el proyecto
# Uso: bash setup.sh

set -e

echo "🚀 Iniciando configuración del proyecto..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${BLUE}1. Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no está instalado${NC}"
    echo "Descargar desde: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js v$(node -v)${NC}"
echo ""

# 2. Verificar PostgreSQL
echo -e "${BLUE}2. Verificando PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está instalado${NC}"
    echo "macOS: brew install postgresql"
    echo "Linux: sudo apt-get install postgresql"
    echo "Windows: Descargar desde https://www.postgresql.org/download/"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL $(psql --version)${NC}"
echo ""

# 3. Crear archivo .env
echo -e "${BLUE}3. Configurando variables de entorno...${NC}"
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env ya existe${NC}"
else
    cp .env.example .env
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo -e "${YELLOW}   Edita .env con tus credenciales de PostgreSQL${NC}"
fi
echo ""

# 4. Instalar dependencias
echo -e "${BLUE}4. Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# 5. Crear base de datos
echo -e "${BLUE}5. Creando base de datos PostgreSQL...${NC}"
echo "Introduce contraseña de PostgreSQL (usuario: postgres):"
psql -U postgres -c "CREATE DATABASE expertos;" || echo -e "${YELLOW}⚠️  La BD puede que ya exista${NC}"
echo -e "${GREEN}✓ Base de datos lista${NC}"
echo ""

echo -e "${GREEN}✅ ¡Configuración completada!${NC}"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Edita .env con tus credenciales de PostgreSQL"
echo "2. Ejecuta: npm run dev"
echo "3. En otra terminal: npm run seed:rules"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo "Backend:  http://localhost:4000"
echo "Frontend: http://localhost:5500"
echo ""
