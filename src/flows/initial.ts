/**
 * Flujo inicial del chatbot
 * Maneja el saludo inicial y navegación de opciones principales
 */

import {
  ConversationFlow,
  BotResponse,
  MessageType,
  SentimentType,
} from '../types/index';
import { contextService, aiService } from '../services/index';
import { PROMPTS } from '../prompts/index';
import logger from '../utils/logger';

export class InitialFlow {
  async handle(userId: string, userMessage: string): Promise<BotResponse> {
    const context = contextService.getOrCreateContext(userId);
    contextService.addMessage(userId, 'user', userMessage);

    try {
      // Interpretar el mensaje del usuario
      const interpretation = await aiService.interpretMessage(
        userMessage,
        context.conversationHistory,
      );

      // Actualizar sentimiento
      contextService.updateSentiment(userId, interpretation.sentiment);

      // Verificar si requiere escalación
      if (interpretation.requiresEscalation) {
        contextService.escalateToHuman(userId, interpretation.escalationReason || 'Solicitud del usuario');
        return this.handleEscalation(userId);
      }

      // Verificar si es primer mensaje
      if (context.conversationHistory.length <= 1) {
        return this.sendGreeting(userId);
      }

      // Procesar según intención
      switch (interpretation.intent) {
        case 'booking':
          return this.redirectToBooking(userId);
        case 'availability':
          return this.redirectToAvailability(userId);
        case 'services':
          return this.redirectToServices(userId);
        case 'complaint':
          return this.handleComplaint(userId, userMessage);
        case 'help':
          return this.sendMainMenu(userId);
        default:
          return this.sendMainMenu(userId);
      }
    } catch (error) {
      logger.error('Error en InitialFlow', { userId, error: String(error) });
      return this.handleError(userId);
    }
  }

  private sendGreeting(userId: string): BotResponse {
    contextService.updateFlow(userId, ConversationFlow.INITIAL);
    const response = PROMPTS.GREETING;
    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: [
        'Reservar habitación',
        'Consultar disponibilidad',
        'Ver tarifas',
        'Servicios',
      ],
    };
  }

  private sendMainMenu(userId: string): BotResponse {
    const response = `¿Cómo puedo ayudarte?

1️⃣ Reservar una habitación
2️⃣ Consultar disponibilidad
3️⃣ Ver tarifas
4️⃣ Saber sobre nuestros servicios
5️⃣ Hablar con recepción`;

    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: [
        'Reservar',
        'Disponibilidad',
        'Tarifas',
        'Servicios',
        'Recepción',
      ],
    };
  }

  private redirectToBooking(userId: string): BotResponse {
    contextService.updateFlow(userId, ConversationFlow.BOOKING);
    const response = PROMPTS.BOOKING_START;
    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEXT,
    };
  }

  private redirectToAvailability(userId: string): BotResponse {
    contextService.updateFlow(userId, ConversationFlow.AVAILABILITY);
    const response = PROMPTS.AVAILABILITY_START;
    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEXT,
    };
  }

  private redirectToServices(userId: string): BotResponse {
    contextService.updateFlow(userId, ConversationFlow.SERVICES);
    const response = PROMPTS.SERVICES_MENU;
    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEMPLATE,
    };
  }

  private handleComplaint(userId: string, userMessage: string): BotResponse {
    logger.warn('Queja detectada del usuario', { userId, message: userMessage });

    return this.handleEscalation(userId);
  }

  private handleEscalation(userId: string): BotResponse {
    const context = contextService.getContext(userId);
    if (context) {
      contextService.updateFlow(userId, ConversationFlow.ESCALATION);
    }

    const response = aiService.generateEscalationMessage();
    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEXT,
      metadata: {
        escalated: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private handleError(userId: string): BotResponse {
    const response = PROMPTS.ERROR;
    contextService.addMessage(userId, 'assistant', response);

    return {
      content: response,
      messageType: MessageType.TEXT,
    };
  }
}

export default new InitialFlow();
