/**
 * Servicio de integración con OpenAI para procesamiento de lenguaje natural
 */

import OpenAI from 'openai';
import {
  AIInterpretationResult,
  SentimentType,
  ConversationMessage,
} from '../types/index';
import logger from '../utils/logger';
import config from '../config/index';

export class AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Interpreta un mensaje del usuario y extrae intención y sentimiento
   */
  async interpretMessage(
    userMessage: string,
    conversationHistory: ConversationMessage[],
  ): Promise<AIInterpretationResult> {
    try {
      const systemPrompt = this.buildInterpretationPrompt();
      const messages = this.buildMessages(conversationHistory, userMessage);

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        // Intentar parsear como JSON
        const result = JSON.parse(content);
        logger.debug('Mensaje interpretado', {
          intent: result.intent,
          sentiment: result.sentiment,
          confidence: result.confidence,
        });
        return result as AIInterpretationResult;
      } catch {
        // Fallback si el JSON no es válido
        logger.warn('Respuesta de IA no es JSON válido', { content });
        return this.getDefaultInterpretation(userMessage);
      }
    } catch (error) {
      logger.error('Error al interpretar mensaje', { error: String(error) });
      return this.getDefaultInterpretation(userMessage);
    }
  }

  /**
   * Genera una respuesta natural del chatbot
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    context?: Record<string, unknown>,
  ): Promise<string> {
    try {
      const systemPrompt = this.buildResponsePrompt(context);
      const messages = this.buildMessages(conversationHistory, userMessage);

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '';
      logger.debug('Respuesta generada por IA');
      return content;
    } catch (error) {
      logger.error('Error al generar respuesta', { error: String(error) });
      return 'Disculpa, tengo un problema técnico. ¿Podrías intentar más tarde?';
    }
  }

  /**
   * Construye el prompt para interpretar mensajes
   */
  private buildInterpretationPrompt(): string {
    return `Eres un asistente de IA especializado en chatbots de reservas hoteleras.
Tu tarea es analizar el mensaje del usuario e interpretar:
1. La intención: booking, availability, services, complaint, help, cancel, modify
2. El sentimiento: positive, neutral, negative, very_negative
3. Entidades extraídas: nombres, fechas, números, tipos de habitación
4. Si requiere escalación: true/false
5. Razón de escalación si aplica

Responde SIEMPRE en JSON con esta estructura exacta:
{
  "intent": "string",
  "confidence": number (0-1),
  "extractedEntities": { },
  "sentiment": "positive|neutral|negative|very_negative",
  "requiresEscalation": boolean,
  "escalationReason": "string o null"
}`;
  }

  /**
   * Construye el prompt para generar respuestas
   */
  private buildResponsePrompt(context?: Record<string, unknown>): string {
    let prompt = `Eres un asistente de atención al cliente para ${config.hotel.name}.

Tu rol es:
1. Saludar amablemente
2. Ayudar con reservas de habitaciones
3. Responder preguntas sobre disponibilidad
4. Informar sobre servicios del hotel
5. Ser empático y profesional
6. Mantener un tono conversacional en español

Servicios disponibles:
- WiFi de alta velocidad
- Piscina climatizada
- Restaurante 5 estrellas
- Spa y centro de bienestar
- Parqueadero cubierto
- Acepta mascotas en ciertas habitaciones
- Check-in flexible desde 14:00 y check-out hasta 11:00
- Política de cancelación flexible hasta 24h antes

Evita:
- Respuestas muy largas
- Tecnicismos innecesarios
- Información falsa`;

    if (context?.guestName) {
      prompt += `\n\nEl usuario se llama: ${context.guestName}`;
    }

    if (context?.reservationData) {
      prompt += `\n\nDatos de reserva en progreso: ${JSON.stringify(context.reservationData)}`;
    }

    return prompt;
  }

  /**
   * Construye el array de mensajes para OpenAI
   */
  private buildMessages(
    history: ConversationMessage[],
    userMessage: string,
  ): OpenAI.ChatCompletionMessageParam[] {
    const messages: OpenAI.ChatCompletionMessageParam[] = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Obtiene una interpretación por defecto cuando falla OpenAI
   */
  private getDefaultInterpretation(userMessage: string): AIInterpretationResult {
    let intent = 'help';
    let sentiment: SentimentType = SentimentType.NEUTRAL;
    let requiresEscalation = false;

    const lowerMessage = userMessage.toLowerCase();

    // Detectar intención básica
    if (
      lowerMessage.includes('reserv') ||
      lowerMessage.includes('book') ||
      lowerMessage.includes('habitación')
    ) {
      intent = 'booking';
    } else if (
      lowerMessage.includes('disponib') ||
      lowerMessage.includes('available') ||
      lowerMessage.includes('tienes lugar')
    ) {
      intent = 'availability';
    } else if (
      lowerMessage.includes('servicio') ||
      lowerMessage.includes('service') ||
      lowerMessage.includes('amenity')
    ) {
      intent = 'services';
    } else if (
      lowerMessage.includes('cancela') ||
      lowerMessage.includes('cancel') ||
      lowerMessage.includes('delete')
    ) {
      intent = 'cancel';
    } else if (
      lowerMessage.includes('queja') ||
      lowerMessage.includes('problema') ||
      lowerMessage.includes('complaint')
    ) {
      intent = 'complaint';
      sentiment = SentimentType.NEGATIVE;
      requiresEscalation = true;
    }

    // Detectar sentimiento básico
    if (
      lowerMessage.includes('genial') ||
      lowerMessage.includes('excelente') ||
      lowerMessage.includes('gracias') ||
      lowerMessage.includes('thank') ||
      lowerMessage.includes('😊')
    ) {
      sentiment = SentimentType.POSITIVE;
    } else if (
      lowerMessage.includes('problema') ||
      lowerMessage.includes('queja') ||
      lowerMessage.includes('mal') ||
      lowerMessage.includes('error') ||
      lowerMessage.includes('😠')
    ) {
      sentiment = SentimentType.NEGATIVE;
    }

    return {
      intent,
      confidence: 0.6,
      extractedEntities: {},
      sentiment,
      requiresEscalation,
    };
  }

  /**
   * Genera un mensaje de escalación a humano
   */
  generateEscalationMessage(): string {
    return `Entendido. Voy a conectarte con un agente de nuestro equipo de recepción para que pueda ayudarte mejor. Por favor espera un momento...`;
  }

  /**
   * Valida que la API key esté configurada
   */
  isConfigured(): boolean {
    return !!config.openai.apiKey && config.openai.apiKey !== '';
  }
}

export default new AIService();
