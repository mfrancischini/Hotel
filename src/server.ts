/**
 * Servidor Express de ejemplo
 * Sirve una API REST para el chatbot
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import chatbot from './app';
import logger from './utils/logger';

interface ChatRequest {
  userId: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface ChatResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

const PORT = process.env.PORT || 3000;
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error no manejado', { error: err.message, path: req.path });
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
});

// Rutas de Health Check
app.get('/health', (req: Request, res: Response) => {
  const health = chatbot.getHealthStatus();
  res.json(health);
});

app.get('/ready', (req: Request, res: Response) => {
  const health = chatbot.getHealthStatus();
  if (health.initialized) {
    res.json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// Ruta principal de chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { userId, message, metadata }: ChatRequest = req.body;

    // Validar entrada
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userId es requerido y debe ser una cadena',
      });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message es requerido y debe ser una cadena',
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede estar vacío',
      });
    }

    // Procesar mensaje
    const response = await chatbot.processMessage(userId, message);

    res.json({
      success: true,
      data: response,
    } as ChatResponse);
  } catch (error) {
    logger.error('Error en /api/chat', { error: String(error) });
    res.status(500).json({
      success: false,
      error: 'Error procesando el mensaje',
    });
  }
});

// Obtener contexto del usuario
app.get('/api/users/:userId/context', (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const context = chatbot.getUserContext(userId);

    if (!context) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        userId: context.userId,
        currentFlow: context.currentFlow,
        sentiment: context.sentiment,
        isEscalated: context.isEscalated,
        messagesCount: context.conversationHistory.length,
        hasReservationData: Object.keys(context.reservationData).length > 0,
        lastInteraction: context.lastInteraction,
      },
    });
  } catch (error) {
    logger.error('Error en /api/users/:userId/context', { error: String(error) });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo contexto',
    });
  }
});

// Obtener historial completo del usuario
app.get('/api/users/:userId/history', (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const context = chatbot.getUserContext(userId);

    if (!context) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        totalMessages: context.conversationHistory.length,
        history: context.conversationHistory,
      },
    });
  } catch (error) {
    logger.error('Error en /api/users/:userId/history', {
      error: String(error),
    });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial',
    });
  }
});

// Limpiar contexto del usuario
app.delete('/api/users/:userId/context', (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    chatbot.clearUserContext(userId);

    res.json({
      success: true,
      message: 'Contexto limpiado exitosamente',
    });
  } catch (error) {
    logger.error('Error en DELETE /api/users/:userId/context', {
      error: String(error),
    });
    res.status(500).json({
      success: false,
      error: 'Error limpiando contexto',
    });
  }
});

// Estadísticas globales
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = chatbot.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error en /api/stats', { error: String(error) });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
    });
  }
});

// Obtener logs recientes
app.get('/api/logs', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = chatbot.getRecentLogs(limit);

    res.json({
      success: true,
      data: {
        count: logs.length,
        logs,
      },
    });
  } catch (error) {
    logger.error('Error en /api/logs', { error: String(error) });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo logs',
    });
  }
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Hotel Chatbot API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      ready: 'GET /ready',
      chat: 'POST /api/chat',
      userContext: 'GET /api/users/:userId/context',
      userHistory: 'GET /api/users/:userId/history',
      clearContext: 'DELETE /api/users/:userId/context',
      stats: 'GET /api/stats',
      logs: 'GET /api/logs',
    },
    documentation: 'Ver API.md para documentación completa',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Inicializar chatbot
    await chatbot.initialize();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor escuchando en puerto ${PORT}`);
      logger.info(`📚 Documentación: http://localhost:${PORT}/`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Error iniciando servidor', { error: String(error) });
    process.exit(1);
  }
}

// Manejo de señales
process.on('SIGTERM', () => {
  logger.warn('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.warn('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

startServer().catch(console.error);

export default app;
