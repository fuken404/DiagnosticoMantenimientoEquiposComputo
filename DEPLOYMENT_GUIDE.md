# Guía de Deployment en Producción

## 🚀 Deployment Recomendado

Este documento describe cómo deployar tu aplicación en producción.

---

## 🏗️ Arquitectura Recomendada

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              (HTML/CSS/JS - Estático)                       │
│                   Netlify / Vercel                           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│              (Node.js + Express + Sequelize)                │
│                 Railway / Heroku / Render                   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│              (Base de Datos Relacional)                     │
│         ElephantSQL / AWS RDS / Azure Database              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-requisitos de Producción

### Checklist
- [ ] Código en Git
- [ ] Tests pasando
- [ ] Variables de entorno configuradas
- [ ] SSL/TLS (HTTPS) configurado
- [ ] Backups implementados
- [ ] Monitoreo configurado
- [ ] Logs centralizados
- [ ] CDN para assets estáticos

---

## 🔧 Configuración de Ambiente

### Variables de Producción

```env
# Base de Datos
DB_HOST=your-postgres-host.elephantsql.com
DB_PORT=5432
DB_NAME=production_db
DB_USER=prod_user
DB_PASSWORD=very_strong_password_here

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_chars_long
JWT_EXPIRES=7d

# Servidor
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# SSL (si el servidor no lo maneja automáticamente)
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🌐 Opciones de Hosting

### Opción 1: Railway (Recomendado - Más Fácil)

#### Ventajas
- ✅ Deploy automático desde Git
- ✅ PostgreSQL incluido
- ✅ SSL automático
- ✅ Escalable
- ✅ Pricing justo

#### Pasos

1. **Crear cuenta en Railway:**
   - Ir a [railway.app](https://railway.app)
   - Registrarse con GitHub

2. **Crear proyecto:**
   - Click "New Project"
   - "Deploy from GitHub"
   - Seleccionar tu repositorio

3. **Agregar PostgreSQL:**
   - Click "Add Service"
   - Seleccionar "PostgreSQL"

4. **Configurar variables:**
   - Click en la app
   - Variables → Editar .env
   - Copiar variables de Railway a .env
   - El DB_HOST y credenciales están en el servicio PostgreSQL

5. **Deploy:**
   ```bash
   git push origin main
   # Railway automáticamente deploya
   ```

### Opción 2: Heroku

#### Pasos

1. **Instalar Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   heroku login
   ```

2. **Crear app:**
   ```bash
   heroku create your-app-name
   ```

3. **Agregar PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configurar variables:**
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

### Opción 3: AWS (Más Control, Más Complejo)

#### EC2 + RDS

1. **Instancia EC2:**
   - Ubuntu 20.04 LTS
   - t3.micro (free tier)

2. **Instalar Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **PostgreSQL RDS:**
   - Crear instancia en AWS RDS
   - Configurar security groups

4. **Deploy:**
   ```bash
   # En EC2
   git clone <repo>
   cd DiagnosticoMantenimientoEquiposComputo
   npm install
   npm run dev
   ```

5. **PM2 (Process Manager):**
   ```bash
   npm install -g pm2
   pm2 start back/main.js --name "diagnostic-api"
   pm2 startup
   pm2 save
   ```

---

## 🐳 Docker (Opcional pero Recomendado)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "back/main.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: expertos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: expertos
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  pgdata:
```

### Usar Docker

```bash
# Construir imagen
docker build -t diagnostic-api .

# Ejecutar con compose
docker-compose up -d

# Ver logs
docker-compose logs -f api
```

---

## 📊 Monitoreo en Producción

### 1. Logs Centralizados

```bash
npm install winston winston-daily-rotate-file
```

```javascript
// back/logger.js
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d'
    })
  ]
});

export default logger;
```

### 2. Error Tracking con Sentry

```bash
npm install @sentry/node
```

```javascript
import Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}
```

### 3. Health Checks

```javascript
// back/main.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

---

## 🔐 Seguridad en Producción

### 1. HTTPS/SSL

```javascript
// auto-redirigir HTTP a HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

### 2. Rate Limiting Más Agresivo

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  })
});
```

### 3. Helmet Mejorado

```javascript
app.use(helmet({
  strictTransportSecurity: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

---

## 💾 Backups Automáticos

### PostgreSQL Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DB_NAME="expertos"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear backup
pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/backup_$DATE.sql

# Limpiar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup creado: backup_$DATE.sql.gz"
```

### Cron Job

```bash
# Ejecutar backup diariamente a las 2 AM
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

---

## 📈 Optimizaciones de Rendimiento

### 1. Connection Pooling

```javascript
// back/db.js
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  }
);
```

### 2. Caching con Redis

```bash
npm install redis
```

```javascript
import { createClient } from 'redis';

const redis = createClient();
redis.connect();

// Cachear reglas
app.get('/api/rules', async (req, res) => {
  const cached = await redis.get('rules');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const rules = await Rule.findAll();
  await redis.setEx('rules', 3600, JSON.stringify(rules)); // Cache 1 hora
  res.json(rules);
});
```

### 3. CDN para Frontend

```html
<!-- index.html -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/your-cdn/front/styles.css">
<script src="https://cdn.jsdelivr.net/your-cdn/front/app.js"></script>
```

---

## 📋 Checklist de Deploy

### Antes de Ir a Producción

- [ ] Todo código committeado en main
- [ ] Tests completados y pasando
- [ ] Credenciales no en repositorio
- [ ] .env configurado correctamente
- [ ] HTTPS/SSL funcionando
- [ ] CORS configurado para dominio
- [ ] Backups configurados
- [ ] Monitoreo activo
- [ ] Error tracking integrado
- [ ] Rate limiting activo
- [ ] Logs centralizados
- [ ] Performance testeado
- [ ] Escala vertical/horizontal probada

### Día del Deploy

- [ ] Backup de BD previo
- [ ] Equipo disponible para issues
- [ ] Comunicar downtime si es necesario
- [ ] Pruebas post-deploy
- [ ] Monitoring activo
- [ ] Revert plan en caso de problemas

---

## 🆘 Plan de Recuperación

### En Caso de Problemas

1. **Acceso a los logs:**
   ```bash
   # Railway
   railway logs
   
   # Heroku
   heroku logs -t
   
   # AWS
   ssh usuario@instancia
   tail -f logs/combined.log
   ```

2. **Rollback rápido:**
   ```bash
   # Si está en Git
   git revert <commit_problematico>
   git push origin main
   # Redeploy automático
   ```

3. **Restaurar BD:**
   ```bash
   psql -U postgres expertos < backup.sql
   ```

---

## 📞 Soporte en Producción

- **Railway Support:** support.railway.app
- **Heroku Support:** help.heroku.com
- **AWS Support:** AWS Console
- **PostgreSQL Docs:** postgresql.org/docs
- **Node.js LTS:** nodejs.org/en/

---

**Última actualización:** 11 de noviembre de 2025
