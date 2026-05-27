# Hotel Chatbot - Asistente Inteligente de Reservas 🏨

Un chatbot profesional y escalable para gestión de reservas hoteleras, construido con Node.js, TypeScript y OpenAI.

## Características Principales ✨

### 1. **Flujo Conversacional Inteligente**
- Saludo automático y navegación de opciones
- Detección de intenciones con IA
- Análisis de sentimiento en tiempo real
- Escalamiento automático a humanos cuando es necesario

### 2. **Gestión de Reservas**
- Flujo completo de reserva paso a paso
- Validación de fechas y disponibilidad
- Cálculo automático de tarifas
- Resumen de reserva antes de confirmar
- Generación de referencias de reserva

### 3. **Consulta de Disponibilidad**
- Verificación en tiempo real
- Sugerencia de alternativas
- Comparación de precios
- Datos de ocupación

### 4. **Información de Servicios**
- WiFi de alta velocidad
- Piscina climatizada
- Restaurante 5 estrellas
- Spa y centro de bienestar
- Política de mascotas
- Estacionamiento seguro
- Horarios de check-in/check-out
- Política de cancelación

### 5. **Soporte al Cliente**
- Detección de reclamaciones
- Identificación de urgencias
- Derivación automática a recepción
- Historial de conversación

### 6. **Integración con OpenAI**
- Procesamiento de lenguaje natural
- Generación de respuestas contextualizadas
- Análisis de intenciones
- Fallback inteligente si OpenAI no está disponible

### 7. **Persistencia de Contexto**
- Memoria de conversación por usuario
- Almacenamiento de datos de reserva en progreso
- Seguimiento de estado del flujo
- Expiración automática de contexto

## Arquitectura 🏗️

```
src/
├── app.ts                 # Motor principal del chatbot
├── config/
│   └── index.ts          # Configuración centralizada
├── services/
│   ├── ai.ts             # Integración con OpenAI
│   ├── availability.ts   # Gestión de disponibilidad
│   ├── context.ts        # Gestión de contexto de usuario
│   ├── reservation.ts    # Gestión de reservas
│   ├── validation.ts     # Validaciones de datos
│   └── index.ts          # Exportaciones
├── flows/
│   ├── initial.ts        # Flujo inicial y menú
│   ├── booking.ts        # Flujo de reserva
│   ├── availability.ts   # Flujo de disponibilidad
│   ├── services.ts       # Flujo de servicios
│   └── index.ts          # Exportaciones
├── types/
│   └── index.ts          # Tipos e interfaces TypeScript
├── prompts/
│   └── index.ts          # Prompts predefinidos
├── utils/
│   └── logger.ts         # Sistema de logging
└── example.ts            # Ejemplo de uso
```

## Principios SOLID ✓

✅ **Single Responsibility**: Cada servicio tiene una responsabilidad única
✅ **Open/Closed**: Fácil de extender sin modificar código existente
✅ **Liskov Substitution**: Interfaces bien definidas
✅ **Interface Segregation**: Interfaces específicas y focalizadas
✅ **Dependency Inversion**: Inyección de dependencias implícita

## Configuración 🔧

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# OpenAI
OPENAI_API_KEY=sk-tu-clave-aqui
OPENAI_MODEL=gpt-4-turbo-preview

# Hotel
HOTEL_NAME=Tu Hotel
HOTEL_PHONE=+34-900-123-456
HOTEL_EMAIL=reservas@tuhotel.com

# Bot
LOG_LEVEL=info
ENVIRONMENT=development

# Persistencia
CONTEXT_STORAGE=local
CONTEXT_TTL=3600

# Tarifas
ROOM_PRICES_SIMPLE=150
ROOM_PRICES_DOUBLE=200
ROOM_PRICES_SUITE=300
ROOM_PRICES_PRESIDENTIAL=500
```

## Uso 🚀

### Modo Desarrollo

```bash
npm run dev
```

Con auto-reload:

```bash
npm run dev:watch
```

### Compilar TypeScript

```bash
npm run build
```

### Ejecutar en Producción

```bash
npm start
```

### Ejemplo de Integración

```typescript
import chatbot from './src/app.js';

// Inicializar
await chatbot.initialize();

// Procesar mensaje
const response = await chatbot.processMessage('user_123', 'Hola, quiero hacer una reserva');

console.log(response.content);
// "¡Hola! Bienvenido a Hotel Luxe..."
```

## Tipos de Datos 📋

### RoomType
- `SIMPLE`: Habitación Simple
- `DOUBLE`: Habitación Doble
- `SUITE`: Suite Lujo
- `PRESIDENTIAL`: Suite Presidencial

### ConversationFlow
- `INITIAL`: Flujo inicial
- `BOOKING`: Proceso de reserva
- `AVAILABILITY`: Consulta de disponibilidad
- `SERVICES`: Información de servicios
- `SUPPORT`: Soporte
- `CONFIRMATION`: Confirmación de reserva
- `ESCALATION`: Escalado a humano
- `COMPLETED`: Reserva completada

### SentimentType
- `POSITIVE`: Cliente satisfecho
- `NEUTRAL`: Cliente neutro
- `NEGATIVE`: Cliente con problemas
- `VERY_NEGATIVE`: Cliente muy molesto

## Validaciones ✓

El chatbot valida automáticamente:

- ✓ Formato de nombre (mínimo 2 caracteres)
- ✓ Fechas válidas (formato DD/MM/YYYY)
- ✓ Check-out posterior a check-in
- ✓ Fechas en el futuro
- ✓ Número de huéspedes compatible con habitación
- ✓ Email con formato válido
- ✓ Teléfono con al menos 10 dígitos

## Escalamiento Automático 🔄

El chatbot detecta automáticamente y escala a un humano cuando:

- El cliente expresa insatisfacción o reclamos
- Hay problemas técnicos no resueltos
- El cliente solicita hablar con recepción
- Se detectan urgencias o emergencias

## Logging 📊

Sistema de logging integrado con niveles:

- `debug`: Información detallada
- `info`: Información general
- `warn`: Advertencias
- `error`: Errores

```typescript
import logger from './src/utils/logger.js';

logger.info('Mensaje de información');
logger.error('Error encontrado', { details: 'aquí' });

// Obtener logs recientes
const logs = chatbot.getRecentLogs(50);
```

## Estadísticas 📈

Obtén estadísticas en tiempo real:

```typescript
const stats = chatbot.getStats();
console.log(stats);
// {
//   contexts: { activeUsers: 5, escalatedConversations: 1, ... },
//   reservations: { totalReservations: 42, confirmedReservations: 38, ... },
//   occupancy: { totalReservations: 42, byRoomType: {...} }
// }
```

## Estado de Salud 🏥

Verifica el estado del sistema:

```typescript
const health = chatbot.getHealthStatus();
console.log(health);
// {
//   initialized: true,
//   openaiConfigured: true,
//   timestamp: "2024-01-15T10:30:00Z",
//   stats: {...}
// }
```

## Integración con WhatsApp 📱

Para integrar con WhatsApp, puedes usar plataformas como:

- **Twilio**: SDK de WhatsApp
- **Meta (Facebook)**: WhatsApp Business API
- **Baileys**: Librería para WhatsApp Web

Ejemplo con Twilio:

```typescript
import twilio from 'twilio';
import chatbot from './src/app.js';

const client = twilio(accountSid, authToken);

// En tu webhook de mensajes
app.post('/webhook', async (req, res) => {
  const incomingMessage = req.body.Body;
  const from = req.body.From;

  const response = await chatbot.processMessage(from, incomingMessage);

  client.messages.create({
    from: process.env.TWILIO_PHONE,
    to: from,
    body: response.content,
  });

  res.send();
});
```

## Persistencia de Datos 💾

Actualmente usa almacenamiento en memoria. Para producción, considera:

- **Base de datos**: MongoDB, PostgreSQL, MySQL
- **Cache**: Redis para contextos
- **Queue**: RabbitMQ para mensajes

## Testing 🧪

Para agregar tests (no incluido pero recomendado):

```bash
npm install --save-dev jest @types/jest ts-jest
```

## Error Handling 🛡️

El chatbot maneja gracefully:

- Errores de API de OpenAI
- Validaciones inválidas
- Contextos expirados
- Mensajes vacíos o inválidos

## Performance ⚡

- **Timeout de contexto**: 1 hora (configurable)
- **Límite de historial**: 10,000 mensajes en memoria
- **Respuestas rápidas**: <500ms típicamente
- **Concurrencia**: Soporta múltiples usuarios simultáneos

## Seguridad 🔒

Recomendaciones de seguridad:

- ✓ Nunca guardes API keys en código
- ✓ Usa variables de entorno
- ✓ Valida siempre la entrada del usuario
- ✓ Implementa rate limiting
- ✓ Cifra datos sensibles en BD
- ✓ Usa HTTPS para comunicaciones
- ✓ Implementa autenticación de usuarios

## Troubleshooting 🔍

### OpenAI no responde
```
Error: Asegúrate que OPENAI_API_KEY es válida
```

Solución: Verifica tu clave en https://platform.openai.com/

### Typescript compilation errors
```
npm run type-check
```

### Logs no aparecen
```
Cambia LOG_LEVEL a 'debug' en .env
```

## Roadmap 🗺️

- [ ] Integración completa WhatsApp/Telegram
- [ ] Base de datos persistente
- [ ] Dashboard de admin
- [ ] Análisis de conversaciones
- [ ] Multi-idioma
- [ ] Webhooks personalizados
- [ ] Analytics avanzado
- [ ] Rate limiting y throttling

## Contribuir 🤝

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia 📄

MIT License - Ver LICENSE.md

## Soporte 📞

Para soporte:
- 📧 Email: dev@ejemplo.com
- 💬 Issues: GitHub Issues
- 📚 Docs: Wiki del proyecto

## Autor ✍️

Desarrollado por un equipo de expertos en IA y chatbots.

---

**Hecho con ❤️ para la industria hotelera**
