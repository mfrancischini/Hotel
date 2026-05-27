/**
 * Aplicación principal del chatbot
 * Orquesta todos los servicios y flows
 */
import { connectDB } from "./config/database";

import {
    ConversationFlow,
    BotResponse,
    SentimentType,
    MessageType,
} from './types/index';
import {
    contextService,
    aiService,
    availabilityService,
    reservationService,
} from './services/index';
import {
    initialFlow,
    bookingFlow,
    availabilityFlow,
    servicesFlow,
} from './flows/index';
import logger from './utils/logger';
import config from './config/index';

export class HotelChatbot {
    private initialized: boolean = false;

    /**
     * Inicializa el chatbot
     */
    async initialize(): Promise<void> {
        try {
            logger.info('🤖 Inicializando Hotel Chatbot...');
            // 🔥 1. CONECTAR BASE DE DATOS (PRIMERO DE TODO)
            await connectDB();
            logger.info('✓ Base de datos conectada');

            // Validar configuración
            config;
            validateConfig();

            // Verificar OpenAI
            if (!aiService.isConfigured()) {
                logger.warn('⚠️ OpenAI no está configurado. Usando fallback para IA');
            } else {
                logger.info('✓ OpenAI configurado correctamente');
            }

            logger.info('✓ Configuración validada');
            logger.info('✓ Servicios cargados');
            logger.info('✓ Flows cargados');

            this.initialized = true;
            logger.info('✓ Hotel Chatbot inicializado correctamente');

            this.logBotStats();
        } catch (error) {
            logger.error('❌ Error al inicializar el chatbot', { error: String(error) });
            throw error;
        }
    }

    /**
     * Procesa un mensaje del usuario
     */
    async processMessage(userId: string, userMessage: string): Promise<BotResponse> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.debug('Mensaje recibido', { userId, messageLength: userMessage.length });

            // Validar entrada
            if (!userId || userId.trim().length === 0) {
                throw new Error('userId es requerido');
            }

            if (!userMessage || userMessage.trim().length === 0) {
                return {
                    content: '¿Disculpa? Por favor, escribe tu mensaje.',
                    messageType: MessageType.TEXT,
                };
            }

            // Obtener o crear contexto
            const context = contextService.getOrCreateContext(userId);

            // Determinar el flujo actual
            const currentFlow = context.currentFlow;

            let response: BotResponse;

            switch (currentFlow) {
                case ConversationFlow.INITIAL:
                    response = await initialFlow.handle(userId, userMessage);
                    break;

                case ConversationFlow.BOOKING:
                    response = await bookingFlow.handle(userId, userMessage);
                    break;

                case ConversationFlow.AVAILABILITY:
                    response = await availabilityFlow.handle(userId, userMessage);
                    break;

                case ConversationFlow.SERVICES:
                    response = await servicesFlow.handle(userId, userMessage);
                    break;

                case ConversationFlow.ESCALATION:
                    response = {
                        content:
                            'Estás conectado con soporte. Un agente se pondrá en contacto pronto.',
                        messageType: MessageType.TEXT,
                    };
                    break;

                case ConversationFlow.CONFIRMATION:
                    response = await bookingFlow.handle(userId, userMessage);
                    break;

                default:
                    response = await initialFlow.handle(userId, userMessage);
                    break;
            }

            logger.debug('Respuesta generada', {
                userId,
                flow: currentFlow,
                responseLength: response.content.length,
            });

            return response;
        } catch (error) {
            logger.error('Error al procesar mensaje', { userId, error: String(error) });

            return {
                content:
                    'Disculpa, hubo un error procesando tu solicitud. Por favor intenta de nuevo.',
                messageType: MessageType.TEXT,
            };
        }
    }

    /**
     * Obtiene el contexto de un usuario
     */
    getUserContext(userId: string) {
        return contextService.getContext(userId);
    }

    /**
     * Limpia el contexto de un usuario
     */
    clearUserContext(userId: string): void {
        contextService.clearContext(userId);
        logger.info('Contexto de usuario limpiado', { userId });
    }

    /**
     * Obtiene estadísticas del chatbot
     */
    getStats() {
        return {
            contexts: contextService.getStats(),
            reservations: reservationService.getStats(),
            occupancy: availabilityService.getOccupancyStats(),
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Obtiene últimos logs
     */
    getRecentLogs(limit: number = 50) {
        return logger.getLogs({ limit });
    }

    /**
     * Muestra estadísticas del bot en consola
     */
    private logBotStats(): void {
        const stats = this.getStats();
        logger.info('📊 Estadísticas del Bot', {
            activeUsers: stats.contexts.activeUsers,
            escalatedConversations: stats.contexts.escalatedConversations,
            totalReservations: stats.reservations.totalReservations,
            confirmedReservations: stats.reservations.confirmedReservations,
        });
    }

    /**
     * Salud del sistema
     */
    getHealthStatus() {
        return {
            initialized: this.initialized,
            openaiConfigured: aiService.isConfigured(),
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
        };
    }
}

/**
 * Valida la configuración requerida
 */
function validateConfig(): void {
    if (!config.openai.apiKey) {
        logger.warn('⚠️ OPENAI_API_KEY no está configurada');
    }

    if (!config.hotel.name) {
        throw new Error('HOTEL_NAME es requerido en variables de entorno');
    }
}

// Exportar singleton
export const chatbot = new HotelChatbot();

export default chatbot;
