/**
 * API.md - Documentación de la API del Chatbot
 * Ejemplos de uso y referencia completa de métodos
 */

# API del Hotel Chatbot 🏨

## Tabla de Contenidos

1. [Instalación y Setup](#instalación-y-setup)
2. [API Principal](#api-principal)
3. [Ejemplos de Uso](#ejemplos-de-uso)
4. [Tipos de Respuesta](#tipos-de-respuesta)
5. [Manejo de Errores](#manejo-de-errores)
6. [Webhooks](#webhooks)
7. [Rate Limiting](#rate-limiting)

## Instalación y Setup

### Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales
```

### Importar el Chatbot

```typescript
import chatbot from './src/app.js';

// Inicializar (una sola vez)
await chatbot.initialize();
```

## API Principal

### `chatbot.processMessage(userId: string, userMessage: string): Promise<BotResponse>`

Procesa un mensaje de usuario y retorna una respuesta del chatbot.

**Parámetros:**
- `userId` (string): ID único del usuario
- `userMessage` (string): Mensaje del usuario

**Retorna:** `BotResponse`

**Ejemplo:**

```typescript
const response = await chatbot.processMessage('user_123', 'Hola');
console.log(response.content);
// "¡Hola! Bienvenido a Hotel Luxe..."
```

### `chatbot.getUserContext(userId: string): UserContext | undefined`

Obtiene el contexto actual de un usuario (historial, datos de reserva, etc).

**Parámetros:**
- `userId` (string): ID del usuario

**Retorna:** `UserContext` o `undefined`

**Ejemplo:**

```typescript
const context = chatbot.getUserContext('user_123');
if (context) {
  console.log('Flujo actual:', context.currentFlow);
  console.log('Sentimiento:', context.sentiment);
  console.log('Historial:', context.conversationHistory);
}
```

### `chatbot.clearUserContext(userId: string): void`

Limpia el contexto de un usuario (historial y datos de reserva).

**Parámetros:**
- `userId` (string): ID del usuario

**Ejemplo:**

```typescript
chatbot.clearUserContext('user_123');
console.log('Contexto limpiado');
```

### `chatbot.getStats(): object`

Obtiene estadísticas globales del chatbot.

**Retorna:** Objeto con estadísticas

**Ejemplo:**

```typescript
const stats = chatbot.getStats();
console.log(stats);
// {
//   contexts: {
//     activeUsers: 5,
//     escalatedConversations: 1,
//     averageMessagesPerConversation: 8
//   },
//   reservations: {
//     totalReservations: 42,
//     confirmedReservations: 38,
//     cancelledReservations: 2,
//     byRoomType: { simple: 10, double: 15, suite: 12, presidential: 5 }
//   },
//   occupancy: {
//     totalReservations: 42,
//     byRoomType: { ... }
//   },
//   timestamp: "2024-01-15T10:30:00Z"
// }
```

### `chatbot.getRecentLogs(limit?: number): LogEntry[]`

Obtiene los últimos logs del sistema.

**Parámetros:**
- `limit` (number, opcional): Número de logs a retornar (default: 50)

**Retorna:** Array de `LogEntry`

**Ejemplo:**

```typescript
const logs = chatbot.getRecentLogs(10);
logs.forEach(log => {
  console.log(`[${log.level}] ${log.message}`);
});
```

### `chatbot.getHealthStatus(): object`

Obtiene el estado de salud del sistema.

**Retorna:** Objeto con estado del sistema

**Ejemplo:**

```typescript
const health = chatbot.getHealthStatus();
console.log(health);
// {
//   initialized: true,
//   openaiConfigured: true,
//   timestamp: "2024-01-15T10:30:00Z",
//   stats: { ... }
// }
```

## Ejemplos de Uso

### Conversación Completa

```typescript
import chatbot from './src/app.js';

async function runConversation() {
  await chatbot.initialize();

  const userId = 'customer_001';
  const messages = [
    'Hola',
    'Quiero hacer una reserva',
    'Juan García',
    '20/12/2024',
    '23/12/2024',
    '2',
    '2',
    'Vistas al mar',
    'Sí'
  ];

  for (const msg of messages) {
    console.log(`Yo: ${msg}`);
    const response = await chatbot.processMessage(userId, msg);
    console.log(`Bot: ${response.content}\n`);
  }
}

runConversation().catch(console.error);
```

### Integración con Express

```typescript
import express from 'express';
import chatbot from './src/app.js';

const app = express();
app.use(express.json());

await chatbot.initialize();

app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId y message son requeridos' });
    }

    const response = await chatbot.processMessage(userId, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/stats', (req, res) => {
  res.json(chatbot.getStats());
});

app.get('/api/health', (req, res) => {
  res.json(chatbot.getHealthStatus());
});

app.listen(3000, () => {
  console.log('Servidor escuchando en puerto 3000');
});
```

### Integración con WhatsApp (Twilio)

```typescript
import twilio from 'twilio';
import express from 'express';
import chatbot from './src/app.js';

const app = express();
const client = twilio(accountSid, authToken);

app.post('/webhook', async (req, res) => {
  const incomingMessage = req.body.Body;
  const from = req.body.From;

  try {
    const response = await chatbot.processMessage(from, incomingMessage);

    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: from,
      body: response.content,
    });

    res.send();
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    res.status(500).send('Error');
  }
});
```

### Obtener Información de Reserva

```typescript
async function checkReservation(userId) {
  const context = chatbot.getUserContext(userId);

  if (!context) {
    console.log('Usuario no encontrado');
    return;
  }

  const { reservationData } = context;

  if (Object.keys(reservationData).length === 0) {
    console.log('Sin datos de reserva en progreso');
    return;
  }

  console.log('Datos de reserva:');
  console.log(JSON.stringify(reservationData, null, 2));
}

await checkReservation('user_123');
```

## Tipos de Respuesta

### BotResponse

```typescript
interface BotResponse {
  content: string;              // Contenido del mensaje
  messageType: MessageType;     // Tipo de mensaje
  buttons?: string[];           // Botones sugeridos
  metadata?: Record<string, unknown>; // Datos adicionales
}
```

### MessageType

```enum
- TEXT = 1      // Mensaje de texto simple
- BUTTON = 2    // Mensaje con botones
- LIST = 3      // Mensaje con lista
- TEMPLATE = 4  // Mensaje con template
```

### Ejemplo de Respuesta

```json
{
  "content": "Perfecto, vamos a hacer tu reserva. Te guiaré paso a paso.\n\n¿Cuál es tu nombre completo?",
  "messageType": 1,
  "buttons": ["Cancelar", "Ayuda"],
  "metadata": {
    "flow": "booking",
    "step": 1
  }
}
```

## Manejo de Errores

### Try-Catch

```typescript
try {
  const response = await chatbot.processMessage(userId, message);
  // Procesar respuesta
} catch (error) {
  console.error('Error:', error.message);
  // Manejar error
}
```

### Validación de Entrada

```typescript
function validateMessage(message) {
  if (!message || message.trim().length === 0) {
    throw new Error('Mensaje vacío');
  }

  if (message.length > 1000) {
    throw new Error('Mensaje muy largo');
  }

  return true;
}

// Uso
try {
  validateMessage(userMessage);
  const response = await chatbot.processMessage(userId, userMessage);
} catch (error) {
  console.error('Error de validación:', error.message);
}
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `OPENAI_API_KEY no configurada` | API key faltante | Configura en .env |
| `userId es requerido` | userId vacío | Proporciona un ID válido |
| `Mensaje vacío` | Mensaje sin contenido | Envía un mensaje no vacío |
| `No hay disponibilidad` | Fechas no disponibles | Intenta con otras fechas |
| `Datos de reserva incompletos` | Faltan campos requeridos | Completa todos los campos |

## Webhooks

### Configurar Webhooks Personalizados

```typescript
class ChatbotWithWebhooks extends HotelChatbot {
  private webhooks: Map<string, Function> = new Map();

  onReservationComplete(callback: (reservationData) => void) {
    this.webhooks.set('reservationComplete', callback);
  }

  onEscalation(callback: (userId, reason) => void) {
    this.webhooks.set('escalation', callback);
  }

  private async triggerWebhook(event: string, data: any) {
    const callback = this.webhooks.get(event);
    if (callback) {
      await callback(data);
    }
  }
}
```

### Ejemplo de Uso

```typescript
const chatbot = new ChatbotWithWebhooks();

chatbot.onReservationComplete((reservation) => {
  console.log('Nueva reserva:', reservation);
  // Enviar email, guardar en BD, etc.
});

chatbot.onEscalation((userId, reason) => {
  console.log(`Usuario ${userId} escalado: ${reason}`);
  // Notificar a recepción
});
```

## Rate Limiting

Implementa rate limiting para producción:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 mensajes por ventana
  message: 'Demasiados mensajes, intenta más tarde'
});

app.post('/api/chat', limiter, async (req, res) => {
  // Tu código aquí
});
```

### Rate Limiting Personalizado

```typescript
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts = 100;
  private windowMs = 15 * 60 * 1000;

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(userId) || [];

    // Limpiar intentos antiguos
    const recentAttempts = attempts.filter(t => now - t < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(userId, recentAttempts);

    return true;
  }
}

// Uso
const limiter = new RateLimiter();

app.post('/api/chat', async (req, res) => {
  const { userId } = req.body;

  if (!limiter.isAllowed(userId)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes' });
  }

  // Procesar mensaje
});
```

## Configuración Avanzada

### Variables de Entorno

```env
# Logging
LOG_LEVEL=debug|info|warn|error

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Persistencia
CONTEXT_STORAGE=local|redis
CONTEXT_TTL=3600

# Hotel
HOTEL_NAME=Hotel Luxe
HOTEL_PHONE=+34-900-123-456
HOTEL_EMAIL=reservas@hotel.com

# Tarifas
ROOM_PRICES_SIMPLE=150
ROOM_PRICES_DOUBLE=200
ROOM_PRICES_SUITE=300
ROOM_PRICES_PRESIDENTIAL=500
```

### Extensión de Flujos

```typescript
import { InitialFlow } from './src/flows/initial.js';

class CustomFlow extends InitialFlow {
  async handleCustomIntent(userId: string, message: string) {
    // Tu lógica personalizada
  }
}
```

---

**Para más ayuda, consulta el README.md o abre un issue en GitHub**
