# Inicio Rápido 🚀

Desde cero a chatbot funcionando en 5 minutos.

## Paso 1: Prerequisitos ⚙️

```bash
# Verificar que tengas Node.js 18+
node --version    # debe ser v18 o superior
npm --version     # debe ser 8+
```

Si no tienes Node.js, descárgalo de https://nodejs.org/

## Paso 2: Clonar y Setup 📦

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/hotel-chatbot.git
cd hotel-chatbot

# Instalar dependencias (2-3 minutos)
npm install
```

## Paso 3: Configurar OpenAI 🔑

```bash
# Copiar template de configuración
cp .env.example .env

# Editar .env (abre en tu editor favorito)
nano .env
```

Busca `OPENAI_API_KEY` y:

1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Copia la key (comienza con `sk-`)
4. Pega en .env

```env
OPENAI_API_KEY=sk-tu-clave-super-secreta-aqui
```

Guarda el archivo (Ctrl+S en nano, luego Ctrl+X para salir).

## Paso 4: Ejecutar 🎯

### Opción A: Modo Desarrollo Simple

```bash
npm run example
```

Verás una conversación de ejemplo con el chatbot. ✅

### Opción B: Servidor REST

```bash
npm run dev:server
```

Abre otra terminal:

```bash
# Enviar mensaje al chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1","message":"Hola"}'
```

Abre tu navegador en http://localhost:3000/health para ver estado. ✅

### Opción C: Docker

```bash
docker-compose up -d
```

Luego el mismo curl de arriba. ✅

## Paso 5: Prueba la Conversación 💬

Usa el servidor REST para simular una conversación:

```bash
# 1. Saludar
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1","message":"Hola"}'

# 2. Querer reservar
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1","message":"Quiero hacer una reserva"}'

# 3. Proporcionar nombre
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1","message":"Juan García López"}'

# 4. Check-in
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1","message":"20/12/2024"}'

# ... y así sucesivamente
```

## Explorar la API 🔍

```bash
# Ver documentación
open http://localhost:3000/

# Ver estadísticas
curl http://localhost:3000/api/stats | jq

# Ver contexto del usuario
curl http://localhost:3000/api/users/user_1/context | jq

# Ver historial
curl http://localhost:3000/api/users/user_1/history | jq
```

## Estructura del Proyecto 📁

```
Hotel/
├── src/
│   ├── app.ts              ← Motor principal
│   ├── server.ts           ← Servidor REST
│   ├── flows/              ← Lógica conversacional
│   ├── services/           ← Servicios reutilizables
│   ├── types/              ← Tipos TypeScript
│   └── config/             ← Configuración
├── README.md               ← Documentación completa
├── API.md                  ← Referencia de API
├── DEPLOYMENT.md           ← Guías de despliegue
└── .env                    ← Variables de entorno
```

## Comandos Útiles 🛠️

```bash
# Compilar TypeScript
npm run build

# Linting
npm run lint

# Type checking
npm run type-check

# Ver logs recientes
curl http://localhost:3000/api/logs

# Limpiar contexto de usuario
curl -X DELETE http://localhost:3000/api/users/user_1/context
```

## Troubleshooting 🔧

### Error: `OPENAI_API_KEY not configured`

```
Solución: Verifica que .env existe y tiene OPENAI_API_KEY válida
```

### Error: `Port 3000 already in use`

```bash
# Usar otro puerto
PORT=3001 npm run dev:server

# O matar el proceso en 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: `npm: command not found`

```
Solución: Instala Node.js desde https://nodejs.org/
```

### El chatbot no responde a mensajes

```
Verificar:
1. OPENAI_API_KEY es válida
2. Tienes crédito en OpenAI (https://platform.openai.com/account/billing/overview)
3. El servidor está corriendo (npm run dev:server)
4. La request va a http://localhost:3000/api/chat
```

## Próximos Pasos 📚

Después de probar lo básico:

1. **Lee la documentación**
   - [README.md](./README.md) - Visión general
   - [API.md](./API.md) - Referencia completa

2. **Explora la arquitectura**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Diseño del sistema

3. **Despliega**
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - En producción

4. **Personaliza**
   - Cambiar nombre del hotel en `.env`
   - Ajustar tarifas
   - Modificar flujos

5. **Integra**
   - WhatsApp (Twilio)
   - Telegram
   - Tu aplicación web

## Ejemplos de Conversación 💭

### Ejemplo 1: Consultar Disponibilidad

```
Usuario: Consultar disponibilidad
Bot: ¿Cuál es tu fecha de check-in?
Usuario: 20/12/2024
Bot: ¿Y tu fecha de check-out?
Usuario: 23/12/2024
Bot: ¿Para cuántos huéspedes?
Usuario: 2
Bot: Disponible - Habitación Doble: $200/noche
```

### Ejemplo 2: Reservar

```
Usuario: Hacer una reserva
Bot: ¿Cuál es tu nombre?
Usuario: Juan García
Bot: ¿Check-in?
Usuario: 15/12/2024
Bot: ¿Check-out?
Usuario: 18/12/2024
Bot: ¿Cuántos huéspedes?
Usuario: 2
Bot: ¿Tipo de habitación?
Usuario: 2
Bot: [Muestra resumen]
Usuario: Sí, confirmar
Bot: ✅ Reserva confirmada
```

## Personalización Rápida 🎨

### Cambiar nombre del hotel

```bash
# En .env
HOTEL_NAME=Tu Hotel Luxe
HOTEL_PHONE=+34-900-000-000
HOTEL_EMAIL=reservas@tuhotel.com
```

### Cambiar tarifas

```bash
# En .env
ROOM_PRICES_SIMPLE=100
ROOM_PRICES_DOUBLE=150
ROOM_PRICES_SUITE=250
ROOM_PRICES_PRESIDENTIAL=400
```

### Cambiar nivel de logging

```bash
# En .env
LOG_LEVEL=debug    # más detallado
LOG_LEVEL=info     # información general
LOG_LEVEL=warn     # solo advertencias
LOG_LEVEL=error    # solo errores
```

## Recursos Adicionales 📖

- **OpenAI Docs**: https://platform.openai.com/docs
- **Express.js**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/
- **Docker**: https://docs.docker.com/

## Soporte 🆘

¿Problemas? Opciones:

1. **Revisar logs**
   ```bash
   curl http://localhost:3000/api/logs | jq
   ```

2. **Leer documentación**
   - README.md para uso
   - ARCHITECTURE.md para diseño
   - API.md para métodos

3. **Abrir issue**
   - GitHub Issues
   - Incluye: error, pasos para reproducir, versión de Node

4. **Contactar soporte**
   - Email: dev@hotelbotdev.com

---

**¡Ya estás listo para empezar!** 🎉

Si necesitas ayuda:
1. `npm run example` - Ver ejemplo funcionando
2. `npm run dev:server` - Iniciar servidor
3. Prueba los comandos curl de arriba
4. Lee la documentación

¡Disfruta! 🚀
