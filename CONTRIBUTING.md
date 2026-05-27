# Contribuir al Hotel Chatbot 🤝

Primero, ¡gracias por tu interés en contribuir! Estas pautas ayudarán a que el proceso sea suave.

## Código de Conducta

Sé respetuoso y profesional. No toleramos acoso, discriminación o lenguaje abusivo.

## Formas de Contribuir

### 1. Reportar Bugs 🐛

Usa GitHub Issues con etiqueta `bug`:

```
Título: [BUG] Breve descripción

Descripción:
- ¿Qué esperabas que sucediera?
- ¿Qué sucedió realmente?
- Pasos para reproducir:
  1. ...
  2. ...
  3. ...

Información del sistema:
- OS: Windows/Mac/Linux
- Node version: ...
- npm version: ...
```

### 2. Sugerir Mejoras ✨

Usa GitHub Issues con etiqueta `enhancement`:

```
Título: [FEATURE] Breve descripción

Descripción:
- Propuesta
- Beneficios
- Posible implementación
- Casos de uso
```

### 3. Escribir Documentación 📚

Mejora README, API.md, ARCHITECTURE.md, etc.

### 4. Escribir Código 💻

Sigue las pautas de abajo.

## Setup para Desarrollo

```bash
# Fork el proyecto
git clone https://github.com/TU_USUARIO/hotel-chatbot.git
cd hotel-chatbot

# Crear rama
git checkout -b feature/tu-feature

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar con tus credenciales

# Compilar
npm run build

# Tests (cuando existan)
npm test
```

## Pautas de Código

### TypeScript

- ✅ Usa `strict: true` siempre
- ✅ Escribe tipos explícitos
- ✅ Evita `any` cuando sea posible
- ✅ Interfaz para objetos complejos
- ✅ Enums para constantes relacionadas

```typescript
// ✅ Bien
interface UserData {
  name: string;
  email: string;
}

function saveUser(data: UserData): Promise<void> {
  // implementación
}

// ❌ Evitar
function saveUser(data: any): any {
  // implementación
}
```

### Nombrado

```
variables, funciones:  camelCase
clases, interfaces:    PascalCase
constantes:            UPPER_SNAKE_CASE
archivos:              kebab-case.ts
carpetas:              kebab-case
```

```typescript
// ✅ Bien
const MAX_USERS = 100;
const activeUsers: string[] = [];

function getUserContext(userId: string): UserContext { }

interface UserContext { }

class ReservationService { }
```

### Funciones

```typescript
// ✅ Preferir pequeñas y enfocadas
function parseDate(input: string): Date | null {
  // Una responsabilidad
}

// ❌ Evitar responsabilidades múltiples
function parseAndValidateAndSaveDate(input: string) {
  // Mucho en una función
}
```

### Comentarios

```typescript
// ✅ Comentarios útiles
/**
 * Procesa un mensaje y retorna respuesta del chatbot
 * @param userId ID único del usuario
 * @param message Contenido del mensaje
 * @returns Respuesta formateada del chatbot
 */
async function processMessage(
  userId: string,
  message: string,
): Promise<BotResponse> {
  // implementación
}

// ❌ Obvios
const name = 'Juan'; // asignar nombre

// ❌ Desactualizados
// TODO: Arreglado en PR #123 (no, no está arreglado)
```

### Error Handling

```typescript
// ✅ Bien
try {
  const result = await aiService.interpretMessage(message);
  return result;
} catch (error) {
  logger.error('Error interpretando mensaje', { error: String(error) });
  return getDefaultInterpretation(message);
}

// ❌ Silenciar errores
try {
  // algo
} catch (error) {
  // sin hacer nada
}
```

### Logging

```typescript
// ✅ Bien
logger.info('Mensaje procesado', { userId, messageLength: msg.length });
logger.error('Error critical', { error: String(error), context: data });

// ❌ console.log en producción
console.log('Debug:', someData);
```

## Git Workflow

### Commits

```bash
# Formato de commit
git commit -m "type(scope): description"

# Types: feat, fix, docs, style, refactor, test, chore
# Ejemplos:
git commit -m "feat(booking): add email validation"
git commit -m "fix(ai): handle openai timeout"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(services): simplify context storage"
```

### Rama

```bash
# Nombres descriptivos
git checkout -b feature/multi-language
git checkout -b fix/context-expiration
git checkout -b docs/deployment-guide
```

### Commits Limpios

```bash
# ✅ Bien: commits atómicos, descriptivos
commit 1: feat: add email validation service
commit 2: tests: add email validation tests
commit 3: docs: update validation docs

# ❌ Evitar: commits grandes, genéricos
commit 1: Fixed stuff and added things
```

## Proceso de Pull Request

1. **Crear PR**
   ```bash
   git push origin feature/tu-feature
   # Ir a GitHub y crear Pull Request
   ```

2. **Descripción de PR**
   ```
   ## Description
   Breve descripción de los cambios

   ## Type of Change
   - [x] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Related Issues
   Fixes #123

   ## Testing
   - [ ] Unit tests added
   - [ ] Tested locally
   - [ ] No breaking changes
   ```

3. **Checks Automáticos**
   - TypeScript compilation debe pasar
   - Linting debe pasar
   - Tests deben pasar

4. **Review**
   - Al menos un maintainer debe revisar
   - Direcciones constructivas
   - Aprobación y merge

## Checklist Antes de Enviar PR

- [ ] Código compilado sin errores
- [ ] Tipado correctamente
- [ ] Linting: `npm run lint`
- [ ] Type check: `npm run type-check`
- [ ] Tests agregados (si aplica)
- [ ] Documentación actualizada
- [ ] Commits limpios y descriptivos
- [ ] Branch está actualizada con main
- [ ] Sin conflictos de merge

## Estructura de Archivos

Mantén el proyecto organizado:

```
src/
├── flows/
│   ├── initial.ts      ← lógica del flujo
│   ├── booking.ts
│   └── index.ts        ← exportar
├── services/
│   ├── ai.ts
│   ├── reservation.ts
│   └── index.ts
├── types/
│   └── index.ts        ← todas las interfaces
├── utils/
│   └── logger.ts
├── config/
│   └── index.ts
└── app.ts              ← motor principal
```

**No**: crear archivos sueltos sin estructura clara.

## Performance

Considera:

```typescript
// ❌ Crear nuevo objeto cada vez
Object.values(RoomType).forEach(room => { });

// ✅ Reutilizar o cachear
const roomTypes = Object.values(RoomType);
roomTypes.forEach(room => { });
```

## Seguridad

```typescript
// ✅ Validar entrada
function booking(input: any): void {
  validationService.validateReservation(input);
}

// ✅ No guardar credenciales
// NUNCA: const apiKey = 'sk-...';

// ✅ Usar variables de entorno
import config from './config/index.js';
const apiKey = config.openai.apiKey;
```

## Documentación

- Actualiza README si cambias comportamiento
- Documenta APIs nuevas en API.md
- Actualiza ARCHITECTURE.md si cambias estructura
- Añade comentarios JSDoc en funciones públicas

```typescript
/**
 * Valida datos de una reserva
 * 
 * @param reservation - Datos de la reserva a validar
 * @returns Resultado de validación con errores si aplica
 * 
 * @example
 * const result = validationService.validateReservation(data);
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateReservation(
  reservation: Partial<ReservationRequest>,
): ValidationResult {
  // implementación
}
```

## Testing (Roadmap)

Cuando se implementen tests:

```bash
npm test
npm test -- --coverage
```

Estructura:

```
tests/
├── unit/
│   ├── services/
│   │   ├── ai.test.ts
│   │   └── reservation.test.ts
│   └── flows/
│       └── booking.test.ts
└── integration/
    └── chatbot.test.ts
```

## Reportar Vulnerabilidades

**No** abras issue público.

Envía email a: security@hotelbotdev.com

```
Subject: [SECURITY] Descripción breve
Body:
- Descripción detallada
- Pasos para reproducir
- Impacto potencial
```

## Preguntas?

- Abre una "Discussion" en GitHub
- Email: dev@hotelbotdev.com
- Discord: (si disponible)

## Reconocimiento

- Todos los contribuidores aparecen en CONTRIBUTORS.md
- Grandes contribuciones merecen mención especial

---

¡Gracias por hacer este proyecto mejor! 🙏
