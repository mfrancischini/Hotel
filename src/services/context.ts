/**
 * Servicio de gestión del contexto de conversación
 * Mantiene el estado de cada usuario durante la conversación
 */

import {
  UserContext,
  ConversationFlow,
  ConversationMessage,
  Partial,
  ReservationRequest,
  SentimentType,
} from '../types/index';
import logger from '../utils/logger';
import config from '../config/index';

export class ContextService {
  private contexts: Map<string, UserContext> = new Map();
  private contextExpiryTimes: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Obtiene o crea el contexto para un usuario
   */
  getOrCreateContext(userId: string): UserContext {
    let context = this.contexts.get(userId);

    if (!context) {
      context = this.createNewContext(userId);
      this.contexts.set(userId, context);
      this.setContextExpiry(userId);
      logger.info('Nuevo contexto creado', { userId });
    }

    return context;
  }

  /**
   * Crea un nuevo contexto vacío para un usuario
   */
  private createNewContext(userId: string): UserContext {
    return {
      userId,
      currentFlow: ConversationFlow.INITIAL,
      conversationHistory: [],
      reservationData: {},
      lastInteraction: new Date(),
      sentiment: SentimentType.NEUTRAL,
      isEscalated: false,
    };
  }

  /**
   * Obtiene el contexto de un usuario
   */
  getContext(userId: string): UserContext | undefined {
    return this.contexts.get(userId);
  }

  /**
   * Actualiza el flujo actual del usuario
   */
  updateFlow(userId: string, flow: ConversationFlow): void {
    const context = this.getOrCreateContext(userId);
    context.currentFlow = flow;
    context.lastInteraction = new Date();
    logger.debug('Flujo actualizado', { userId, flow });
  }

  /**
   * Añade un mensaje al historial de conversación
   */
  addMessage(userId: string, role: 'user' | 'assistant', content: string): void {
    const context = this.getOrCreateContext(userId);
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date(),
    };
    context.conversationHistory.push(message);
    context.lastInteraction = new Date();

    // Limpiar expiry anterior y crear uno nuevo
    this.setContextExpiry(userId);
  }

  /**
   * Actualiza los datos de reserva del usuario
   */
  updateReservationData(
    userId: string,
    data: Partial<ReservationRequest>,
  ): void {
    const context = this.getOrCreateContext(userId);
    context.reservationData = {
      ...context.reservationData,
      ...data,
    };
    context.lastInteraction = new Date();
    logger.debug('Datos de reserva actualizados', { userId, fields: Object.keys(data) });
  }

  /**
   * Obtiene los datos de reserva del usuario
   */
  getReservationData(userId: string): Partial<ReservationRequest> {
    const context = this.getOrCreateContext(userId);
    return { ...context.reservationData };
  }

  /**
   * Actualiza el sentimiento detectado del usuario
   */
  updateSentiment(userId: string, sentiment: SentimentType): void {
    const context = this.getOrCreateContext(userId);
    context.sentiment = sentiment;
    logger.debug('Sentimiento actualizado', { userId, sentiment });
  }

  /**
   * Marca la conversación como escalada
   */
  escalateToHuman(userId: string, reason: string): void {
    const context = this.getOrCreateContext(userId);
    context.isEscalated = true;
    context.escalationReason = reason;
    context.currentFlow = ConversationFlow.ESCALATION;
    logger.warn('Conversación escalada a humano', { userId, reason });
  }

  /**
   * Obtiene el historial de conversación
   */
  getConversationHistory(userId: string): ConversationMessage[] {
    const context = this.getContext(userId);
    return context?.conversationHistory ?? [];
  }

  /**
   * Limpia el contexto de un usuario
   */
  clearContext(userId: string): void {
    this.contexts.delete(userId);
    const timeout = this.contextExpiryTimes.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      this.contextExpiryTimes.delete(userId);
    }
    logger.debug('Contexto limpiado', { userId });
  }

  /**
   * Reinicia la reserva manteniendo otros datos
   */
  resetReservation(userId: string): void {
    const context = this.getOrCreateContext(userId);
    context.reservationData = {};
    context.currentFlow = ConversationFlow.INITIAL;
    logger.debug('Reserva reiniciada', { userId });
  }

  /**
   * Establece un temporizador para expirar el contexto
   */
  private setContextExpiry(userId: string): void {
    // Limpiar timeout anterior si existe
    const existingTimeout = this.contextExpiryTimes.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Crear nuevo timeout
    const timeout = setTimeout(() => {
      this.clearContext(userId);
      logger.debug('Contexto expirado automáticamente', { userId });
    }, config.context.ttl * 1000);

    this.contextExpiryTimes.set(userId, timeout);
  }

  /**
   * Obtiene estadísticas de contextos activos
   */
  getStats(): {
    activeUsers: number;
    escalatedConversations: number;
    averageMessagesPerConversation: number;
  } {
    let escalatedCount = 0;
    let totalMessages = 0;

    this.contexts.forEach((context) => {
      if (context.isEscalated) {
        escalatedCount++;
      }
      totalMessages += context.conversationHistory.length;
    });

    return {
      activeUsers: this.contexts.size,
      escalatedConversations: escalatedCount,
      averageMessagesPerConversation:
        this.contexts.size > 0 ? Math.round(totalMessages / this.contexts.size) : 0,
    };
  }

  /**
   * Limpia todos los contextos (uso administrativo)
   */
  clearAllContexts(): void {
    this.contextExpiryTimes.forEach((timeout) => clearTimeout(timeout));
    this.contexts.clear();
    this.contextExpiryTimes.clear();
    logger.warn('Todos los contextos fueron limpiados');
  }
}

export default new ContextService();
