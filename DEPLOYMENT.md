# Guía de Despliegue 🚀

Instrucciones para desplegar el Hotel Chatbot en diferentes plataformas.

## Tabla de Contenidos

1. [Desarrollo Local](#desarrollo-local)
2. [Docker](#docker)
3. [Vercel](#vercel)
4. [Heroku](#heroku)
5. [AWS](#aws)
6. [Google Cloud](#google-cloud)
7. [Azure](#azure)
8. [Producción Checklist](#producción-checklist)

## Desarrollo Local

### Requisitos

- Node.js 18+
- npm o yarn
- Editor de código (VS Code recomendado)

### Setup

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/hotel-chatbot.git
cd hotel-chatbot

# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env

# Editar .env con credenciales
nano .env

# Compilar TypeScript
npm run build

# Ejecutar ejemplo
npm run example

# Iniciar servidor
npm run dev:server
```

### Acceder a la API

```bash
# En otra terminal
curl -X GET http://localhost:3000/health

# Enviar mensaje
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1","message":"Hola"}'
```

## Docker

### Build Local

```bash
# Construir imagen
docker build -t hotel-chatbot:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e HOTEL_NAME="Mi Hotel" \
  hotel-chatbot:latest
```

### Docker Compose

```bash
# Copiar .env
cp .env.example .env

# Editar .env con credenciales
nano .env

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f chatbot

# Detener servicios
docker-compose down
```

### Optimizaciones para Producción

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npm ci && npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /build/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## Vercel

### Despliegue

1. **Conectar repositorio**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Desplegar**
   ```bash
   vercel
   ```

3. **Configurar variables de entorno**
   - Ir a Dashboard → Project Settings → Environment Variables
   - Añadir: `OPENAI_API_KEY`, `HOTEL_NAME`, etc.

4. **Archivo `vercel.json`**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "env": {
       "OPENAI_API_KEY": "@openai_api_key",
       "HOTEL_NAME": "@hotel_name"
     }
   }
   ```

### API Serverless

Para usar como serverless:

```typescript
// api/chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import chatbot from '../src/app.js';

export default async (req: VercelRequest, res: VercelResponse) => {
  const { userId, message } = req.body;

  try {
    const response = await chatbot.processMessage(userId, message);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
};
```

## Heroku

### Setup

1. **Crear cuenta en Heroku**
   ```bash
   heroku login
   heroku create tu-hotel-chatbot
   ```

2. **Procfile**
   ```
   web: npm run server:build
   ```

3. **Enviar variables**
   ```bash
   heroku config:set OPENAI_API_KEY=sk-...
   heroku config:set HOTEL_NAME="Mi Hotel"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Ver logs**
   ```bash
   heroku logs --tail
   ```

## AWS

### Opción 1: EC2

```bash
# Conectar a instancia
ssh -i key.pem ec2-user@your-instance.com

# Instalar dependencias
sudo yum install nodejs npm git

# Clonar y desplegar
git clone https://github.com/tu-usuario/hotel-chatbot.git
cd hotel-chatbot
npm install
npm run build

# Crear servicio systemd
sudo nano /etc/systemd/system/chatbot.service
```

```ini
[Unit]
Description=Hotel Chatbot
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/hotel-chatbot
ExecStart=/usr/bin/node /home/ec2-user/hotel-chatbot/dist/server.js
Restart=always
Environment="NODE_ENV=production"
EnvironmentFile=/home/ec2-user/hotel-chatbot/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable chatbot
sudo systemctl start chatbot
sudo systemctl status chatbot
```

### Opción 2: ECS (Elastic Container Service)

1. **Crear cluster**
   ```bash
   aws ecs create-cluster --cluster-name hotel-chatbot-cluster
   ```

2. **Push a ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t hotel-chatbot .
   docker tag hotel-chatbot:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-chatbot:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-chatbot:latest
   ```

3. **Crear task definition** (task-definition.json)
   ```json
   {
     "family": "hotel-chatbot",
     "containerDefinitions": [
       {
         "name": "hotel-chatbot",
         "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/hotel-chatbot:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "hostPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "OPENAI_API_KEY",
             "value": "sk-..."
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/hotel-chatbot",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

4. **Registrar y ejecutar**
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   aws ecs run-task --cluster hotel-chatbot-cluster --task-definition hotel-chatbot:1 --desired-count 1
   ```

## Google Cloud

### Cloud Run

```bash
# Conectar a GCP
gcloud auth login
gcloud config set project PROJECT_ID

# Construir y enviar imagen
gcloud builds submit --tag gcr.io/PROJECT_ID/hotel-chatbot

# Deploy a Cloud Run
gcloud run deploy hotel-chatbot \
  --image gcr.io/PROJECT_ID/hotel-chatbot \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=sk-...,HOTEL_NAME="Mi Hotel" \
  --allow-unauthenticated
```

### App Engine

1. **app.yaml**
   ```yaml
   runtime: nodejs20
   
   env: standard
   
   env_variables:
     OPENAI_API_KEY: "sk-..."
     HOTEL_NAME: "Mi Hotel"
   
   automatic_scaling:
     min_instances: 1
     max_instances: 10
   ```

2. **Deploy**
   ```bash
   gcloud app deploy
   ```

## Azure

### App Service

```bash
# Login
az login

# Crear grupo de recursos
az group create --name hotel-chatbot-rg --location eastus

# Crear App Service Plan
az appservice plan create \
  --name hotel-chatbot-plan \
  --resource-group hotel-chatbot-rg \
  --sku B1 --is-linux

# Crear Web App
az webapp create \
  --resource-group hotel-chatbot-rg \
  --plan hotel-chatbot-plan \
  --name hotel-chatbot-app \
  --runtime "NODE|20-lts"

# Configurar variables
az webapp config appsettings set \
  --resource-group hotel-chatbot-rg \
  --name hotel-chatbot-app \
  --settings OPENAI_API_KEY=sk-... HOTEL_NAME="Mi Hotel"

# Deploy desde git
az webapp deployment source config-zip \
  --resource-group hotel-chatbot-rg \
  --name hotel-chatbot-app \
  --src deployment.zip
```

### Container Instances

```bash
# Crear registro
az acr create --resource-group hotel-chatbot-rg \
  --name hotelbotregistry --sku Basic

# Build imagen
az acr build --registry hotelbotregistry \
  --image hotel-chatbot:latest .

# Deploy contenedor
az container create \
  --resource-group hotel-chatbot-rg \
  --name hotel-chatbot \
  --image hotelbotregistry.azurecr.io/hotel-chatbot:latest \
  --environment-variables OPENAI_API_KEY=sk-... HOTEL_NAME="Mi Hotel" \
  --ports 3000 \
  --dns-name-label hotel-chatbot
```

## Producción Checklist ✅

### Seguridad

- [ ] Todas las credenciales en variables de entorno
- [ ] No guardar .env en git
- [ ] Usar HTTPS obligatoriamente
- [ ] Implementar autenticación de API
- [ ] Rate limiting activado
- [ ] CORS configurado correctamente
- [ ] Validar entrada de usuario
- [ ] Usar secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)

### Performance

- [ ] Compilar TypeScript a minificado
- [ ] Usar PM2 o similar para process management
- [ ] Redis para caching de contextos
- [ ] CDN para archivos estáticos
- [ ] Compresión gzip activada
- [ ] Load balancing configurado

### Monitoring

- [ ] Logs centralizados (CloudWatch, Stackdriver, etc.)
- [ ] Alertas configuradas
- [ ] Health checks implementados
- [ ] Métricas de performance
- [ ] Error tracking (Sentry, etc.)
- [ ] Uptime monitoring

### Base de Datos

- [ ] Migrar de memoria a BD persistente
- [ ] Backups automáticos
- [ ] Conexión pool configurada
- [ ] Encryption en tránsito y reposo

### DevOps

- [ ] CI/CD pipeline
- [ ] Tests automatizados
- [ ] Versionado semántico
- [ ] Changelog mantenido
- [ ] Documentación actualizada
- [ ] Plan de rollback

### Escalabilidad

- [ ] Stateless architecture
- [ ] Sesiones distribuidas
- [ ] Cachéing estratégico
- [ ] Database replication
- [ ] CDN configurado

## Mantenimiento

### Actualizar Dependencias

```bash
# Ver actualizaciones disponibles
npm outdated

# Actualizar seguras
npm update

# Actualizar específicas
npm install package@version --save
```

### Monitoreo Continuo

```bash
# Ver procesos
pm2 status

# Ver logs en tiempo real
pm2 logs chatbot

# Reinicar si hay cambios
pm2 start server.ts --watch
```

### Backups

```bash
# Backup de base de datos (si aplica)
pg_dump hotel_chatbot > backup_$(date +%Y%m%d).sql

# Restaurar
psql hotel_chatbot < backup_20240115.sql
```

---

**Para problemas específicos, contacta al equipo de DevOps**
