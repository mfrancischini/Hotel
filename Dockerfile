FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm install -g typescript

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Limpiar archivos fuente no necesarios
RUN rm -rf src

# Exponer puerto (ajusta según tu app)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('ok')" || exit 1

# Comando para ejecutar
CMD ["npm", "start"]
