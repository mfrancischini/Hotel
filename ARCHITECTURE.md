# Arquitectura del Hotel Chatbot 🏗️

## Visión General

El Hotel Chatbot es una aplicación modular y escalable construida con Node.js y TypeScript siguiendo principios SOLID y patrones de arquitectura limpios.

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│        (WhatsApp, Telegram, API REST, Web, SMS)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE ORQUESTACIÓN                     │
│                      HotelChatbot (app.ts)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE FLUJOS (Flows)                    │
│  ┌──────────┐  ┌─────────┐  ┌────────────┐  ┌──────────┐   │
│  │ Initial  │  │ Booking │  │Availability│  │ Services │   │
│  └──────────┘  └─────────┘  └────────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE SERVICIOS (Services)              │
│  ┌────────┐  ┌──────────────┐  ┌─────────┐  ┌────────────┐ │
│  │   AI   │  │ Reservation  │  │Validation│  │Availability│ │
│  └────────┘  └──────────────┘  └─────────┘  └────────────┘ │
│       ↓                                           ↓          │
│  ┌────────┐  ┌───────────┐  ┌──────────────┐              │
│  │OpenAI  │  │ Context   │  │ Configuration │              │
│  └────────┘  └───────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS (Storage)                  │
│    ┌──────────┐  ┌──────────┐  ┌──────────────┐            │
│    │  Memory  │  │  Redis   │  │   Database   │            │
│    └──────────┘  └──────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. **Capa de Orquestación (app.ts)**

Responsable de:
- Orquestar la comunicación entre flows y servicios
- Inicializar el sistema
- Enrutar mensajes al flow correcto
- Manejar errores globales

```typescript
class HotelChatbot {
  - initialize()
  - processMessage()
  - getUserContext()
  - getStats()
}
```

### 2. **Capa de Flujos (flows/)**

Cada flujo maneja un tipo de interacción específica:

#### InitialFlow
- Saludo inicial
- Menú principal
- Detección de intención
- Escalamiento automático

#### BookingFlow
- Recopilación de datos (nombre, fechas, etc.)
- Validación en tiempo real
- Confirmación de reserva
- Generación de referencias

#### AvailabilityFlow
- Consulta de disponibilidad
- Búsqueda de alternativas
- Comparación de precios

#### ServicesFlow
- Información sobre servicios
- Detalles de amenidades
- Políticas del hotel

### 3. **Capa de Servicios (services/)**

#### AIService
```typescript
- interpretMessage()           // NLP con OpenAI
- generateResponse()           // Generación contextualizada
- generateEscalationMessage()
- isConfigured()
```

**Flujo:**
```
Input → OpenAI API → Parse JSON → AIInterpretationResult
                  ↓
            Fallback (si falla)
```

#### ContextService
```typescript
- getOrCreateContext()        // Obtener/crear contexto usuario
- addMessage()                // Añadir al historial
- updateReservationData()     // Guardar datos de reserva
- escalateToHuman()           // Marcar como escalada
- getStats()
```

**Características:**
- TTL automático (1 hora por defecto)
- Expiración en segundo plano
- Historial de conversación

#### ReservationService
```typescript
- createReservation()         // Crear nueva reserva
- getReservation()
- cancelReservation()
- getReservationSummary()
- getStats()
```

#### AvailabilityService
```typescript
- checkAvailability()         // Verificar disponibilidad
- reserveRoom()               // Reservar habitación
- calculateNights()
- calculateTotalPrice()
- getOccupancyStats()
```

#### ValidationService
```typescript
- validateReservation()       // Validar datos completos
- validateDates()
- validateGuests()
- validateEmail()
- validatePhone()
```

### 4. **Capa de Tipos (types/)**

Define todas las interfaces TypeScript:

```typescript
// Enums
- RoomType: SIMPLE | DOUBLE | SUITE | PRESIDENTIAL
- ConversationFlow: INITIAL | BOOKING | AVAILABILITY | ...
- MessageType: TEXT | BUTTON | LIST | TEMPLATE
- SentimentType: POSITIVE | NEUTRAL | NEGATIVE | VERY_NEGATIVE

// Interfaces
- Message
- UserContext
- ReservationRequest
- ReservationResponse
- AIInterpretationResult
- BotResponse
```

### 5. **Capa de Configuración (config/)**

- Variables de entorno centralizadas
- Validación de configuración
- Precios y límites configurables

### 6. **Utilidades (utils/)**

#### Logger
```typescript
- debug()
- info()
- warn()
- error()
- getLogs()
```

**Características:**
- Múltiples niveles
- Buffer de últimos logs
- Timestamps automáticos

## Flujos de Datos

### Flujo de un Mensaje

```
1. Usuario envía mensaje
        ↓
2. HotelChatbot.processMessage(userId, message)
        ↓
3. ContextService.getOrCreateContext(userId)
        ↓
4. Determinar CurrentFlow del usuario
        ↓
5. Enrutar a Flow correspondiente
        ↓
6. Flow procesa y retorna BotResponse
        ↓
7. ContextService.addMessage() (historial)
        ↓
8. Retornar BotResponse al usuario
```

### Flujo de Reserva (Detallado)

```
Usuario: "Quiero hacer una reserva"
        ↓
InitialFlow detecta intención: "booking"
        ↓
Cambiar a BookingFlow
        ↓
┌─────────────────────────────────────┐
│ Solicitar nombre                    │
│ ✓ Nombre proporcionado              │
│ Guardar: ContextService.update()    │
├─────────────────────────────────────┤
│ Solicitar fecha check-in            │
│ ✓ Fecha válida                      │
│ Guardar y continuar                 │
├─────────────────────────────────────┤
│ Solicitar fecha check-out           │
│ ✓ check-out > check-in              │
├─────────────────────────────────────┤
│ Solicitar número de huéspedes       │
│ ✓ Validar capacidad habitación      │
├─────────────────────────────────────┤
│ Solicitar tipo de habitación        │
│ ✓ Tipo válido                       │
├─────────────────────────────────────┤
│ Validación global                   │
│ ✓ ValidationService.validateReq()   │
├─────────────────────────────────────┤
│ Verificar disponibilidad            │
│ ✓ AvailabilityService.check()       │
├─────────────────────────────────────┤
│ Crear reserva                       │
│ ✓ ReservationService.create()       │
├─────────────────────────────────────┤
│ Mostrar resumen                     │
│ Usuario: "Sí, confirmar"            │
├─────────────────────────────────────┤
│ ✓ Reserva confirmada                │
│ Generar referencia                  │
└─────────────────────────────────────┘
        ↓
Retornar BotResponse con confirmación
```

## Manejo de Errores

```
try {
  procesarMensaje()
} catch (error) {
  logger.error()
  ├─ Si es de validación
  │  ├─ Mostrar mensaje amigable
  │  └─ Pedir reintentar
  ├─ Si es de API (OpenAI)
  │  ├─ Usar fallback inteligente
  │  └─ Loguear para análisis
  ├─ Si es crítico
  │  ├─ Escalar a humano
  │  └─ Notificar admin
  └─ Retornar error genérico al usuario
}
```

## Escalabilidad

### Horizontal (Múltiples instancias)

```
Load Balancer
    ↓
  ┌─┴─┐
  ↓   ↓
[Bot1] [Bot2] [Bot3]
  └─┬─┘
  Shared Storage (Redis)
    ├─ Context cache
    ├─ Sessions
    └─ Rate limiting
```

### Vertical (Una sola instancia)

```
- Compilación optimizada
- Uso eficiente de memoria
- Pool de conexiones
- Cachéing estratégico
```

### Mejoras propuestas

1. **Base de Datos Persistente**
   - Migrar contextos de memoria a DB
   - Históricos de conversación
   - Analítica

2. **Redis**
   - Contextos activos en caché
   - Session store distribuida
   - Rate limiting

3. **Message Queue**
   - Procesar mensajes asincronamente
   - Desacoplar procesamiento
   - Escalado horizontal

4. **CDN**
   - Servir assets
   - Imágenes
   - Respuestas en caché

## Patrones de Diseño

### 1. **Singleton**
- `Logger`
- `ContextService`
- `AIService`
- `HotelChatbot`

### 2. **Factory**
- Creación de contextos
- Generación de respuestas

### 3. **Strategy**
- Diferentes flows = diferentes estrategias
- ValidationService = diferentes validadores

### 4. **Observer**
- ContextService observa cambios
- Triggerea expiración automática

### 5. **Adapter**
- Adaptar respuestas para diferentes canales

## Seguridad

### Validación
```
Input → Validar → Sanitizar → Procesar
```

### Autenticación (propuesto)
```
Token → Verificar → Generar Context
```

### Autorización
- Usuarios solo ven su propio contexto
- Admins pueden ver todos

### Encriptación
```
Datos sensibles:
- Email
- Teléfono
- Datos de tarjeta

→ Encriptar antes de guardar
```

## Testing

### Estructura propuesta

```
tests/
├── unit/
│   ├── services/
│   ├── flows/
│   └── utils/
├── integration/
│   └── end-to-end/
└── fixtures/
    └── mocks/
```

## Monitoreo

### Métricas

```
- Mensajes procesados/min
- Tiempo promedio respuesta
- Tasa de error
- Usuarios activos
- Escalamientos a humano
- Reservas completadas
```

### Alertas

```
- Errores > 5% → Alert
- Latencia > 1s → Warn
- Memoria > 80% → Warn
- API OpenAI down → Critical
```

## Ciclo de Vida de un Contexto

```
1. Creación
   - Usuario envía primer mensaje
   - Se genera contexto vacío
   - Se inicia temporizador

2. Activo
   - Usuario interactúa
   - Se resetea temporizador
   - Se acumula historial

3. Inactivo
   - Pasa tiempo sin interacción
   - Se acerca timeout
   - Log de limpieza

4. Expiración
   - TTL vencido
   - Se limpia contexto
   - Se libera memoria
```

## Mejoras Futuras

1. **Machine Learning**
   - Mejorar detección de intención
   - Análisis de sentimiento más preciso
   - Predicción de pasos

2. **Multiidioma**
   - Detección automática
   - Traducción en tiempo real

3. **Personalization**
   - Historial de cliente
   - Preferencias guardadas
   - Recomendaciones

4. **Integración**
   - Múltiples canales
   - CRM integration
   - Sistemas de reserva reales

---

**Para cambios de arquitectura, crear issue con etiqueta `architecture`**
