/**
 * Flujo de consulta de disponibilidad
 */

import {
  ConversationFlow,
  BotResponse,
  MessageType,
  RoomType,
  AvailabilityRequest,
} from '../types/index';
import {
  contextService,
  availabilityService,
  aiService,
} from '../services/index';
import { PROMPTS } from '../prompts/index';
import logger from '../utils/logger';

export class AvailabilityFlow {
  async handle(userId: string, userMessage: string): Promise<BotResponse> {
    const context = contextService.getOrCreateContext(userId);
    contextService.addMessage(userId, 'user', userMessage);

    try {
      // Obtener datos temporales de disponibilidad
      let availabilityData = (context.reservationData as AvailabilityRequest) || {};

      // Solicitar fecha check-in
      if (!availabilityData.checkInDate) {
        const checkInDate = this.parseDate(userMessage);
        if (!checkInDate) {
          const response = `Por favor, ingresa tu fecha de check-in en formato DD/MM/YYYY`;
          contextService.addMessage(userId, 'assistant', response);
          return { content: response, messageType: MessageType.TEXT };
        }
        availabilityData.checkInDate = checkInDate;
        contextService.updateReservationData(userId, availabilityData);

        const response = PROMPTS.AVAILABILITY_CHECK_OUT;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
      }

      // Solicitar fecha check-out
      if (!availabilityData.checkOutDate) {
        const checkOutDate = this.parseDate(userMessage);
        if (!checkOutDate) {
          const response = `Por favor, ingresa tu fecha de check-out en formato DD/MM/YYYY`;
          contextService.addMessage(userId, 'assistant', response);
          return { content: response, messageType: MessageType.TEXT };
        }
        availabilityData.checkOutDate = checkOutDate;
        contextService.updateReservationData(userId, availabilityData);

        const response = PROMPTS.AVAILABILITY_GUESTS;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
      }

      // Solicitar número de huéspedes
      if (!availabilityData.numberOfGuests) {
        const guests = parseInt(userMessage, 10);
        if (isNaN(guests) || guests < 1) {
          const response = `Por favor, ingresa un número válido de huéspedes`;
          contextService.addMessage(userId, 'assistant', response);
          return { content: response, messageType: MessageType.TEXT };
        }
        availabilityData.numberOfGuests = guests;
        contextService.updateReservationData(userId, availabilityData);

        const response = PROMPTS.AVAILABILITY_ROOM_TYPE;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
      }

      // Procesar tipo de habitación
      return this.checkAndDisplayAvailability(userId, userMessage, availabilityData);
    } catch (error) {
      logger.error('Error en AvailabilityFlow', { userId, error: String(error) });
      const response = PROMPTS.ERROR;
      contextService.addMessage(userId, 'assistant', response);
      return { content: response, messageType: MessageType.TEXT };
    }
  }

  private async checkAndDisplayAvailability(
    userId: string,
    userMessage: string,
    availabilityData: Partial<AvailabilityRequest>,
  ): Promise<BotResponse> {
    let roomType: RoomType | undefined;

    const selection = userMessage.toLowerCase().trim();

    if (selection === '5' || selection === 'todas' || selection === 'todas las opciones') {
      // Mostrar todas las opciones
      roomType = undefined;
    } else {
      roomType = this.parseRoomType(userMessage);
      if (!roomType) {
        const response = `Por favor, selecciona una opción válida (1, 2, 3, 4 o 5)`;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
      }
    }

    availabilityData.roomType = roomType;

    // Consultar disponibilidad
    const availability = availabilityService.checkAvailability(
      availabilityData as AvailabilityRequest,
    );

    return this.displayAvailabilityResult(userId, availability);
  }

  private displayAvailabilityResult(userId: string, availability: any): BotResponse {
    contextService.updateFlow(userId, ConversationFlow.AVAILABILITY);

    let response = '';

    if (availability.available) {
      response = `✅ **¡Excelente! Tenemos disponibilidad**\n\n`;
      response += `Habitaciones disponibles: ${availability.availableRooms.join(', ')}\n\n`;

      // Mostrar precios
      response += `💰 **Tarifas por noche:**\n`;
      availability.availableRooms.forEach((room: RoomType) => {
        const price = this.getRoomPrice(room);
        response += `• ${this.formatRoomType(room)}: $${price}\n`;
      });

      if (availability.alternativeRooms && availability.alternativeRooms.length > 0) {
        response += `\n🔄 **También disponibles:**\n`;
        response += `${availability.alternativeRooms.join(', ')}\n`;
      }

      response += `\n¿Te gustaría hacer una reserva?`;

      contextService.addMessage(userId, 'assistant', response);

      return {
        content: response,
        messageType: MessageType.TEMPLATE,
        buttons: ['Sí, reservar', 'Ver tarifas', 'Volver al menú'],
      };
    } else {
      response = `😞 **Lamentablemente no hay disponibilidad** para esas fechas.\n\n`;
      response += PROMPTS.NOT_AVAILABLE;

      contextService.addMessage(userId, 'assistant', response);

      return {
        content: response,
        messageType: MessageType.TEMPLATE,
        buttons: ['Otras fechas', 'Hablar con recepción'],
      };
    }
  }

  private parseDate(input: string): Date | null {
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
    ];

    for (const format of formats) {
      const match = input.match(format);
      if (match) {
        if (format === formats[0] || format === formats[1]) {
          const [, day, month, year] = match;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date;
          }
        } else if (format === formats[2]) {
          const [, year, month, day] = match;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }

    return null;
  }

  private parseRoomType(input: string): RoomType | undefined {
    const roomMap: Record<string, RoomType> = {
      '1': RoomType.SIMPLE,
      'simple': RoomType.SIMPLE,
      '2': RoomType.DOUBLE,
      'doble': RoomType.DOUBLE,
      '3': RoomType.SUITE,
      'suite': RoomType.SUITE,
      '4': RoomType.PRESIDENTIAL,
      'presidencial': RoomType.PRESIDENTIAL,
    };

    return roomMap[input.toLowerCase()];
  }

  private formatRoomType(roomType: RoomType): string {
    const names: Record<RoomType, string> = {
      [RoomType.SIMPLE]: 'Habitación Simple',
      [RoomType.DOUBLE]: 'Habitación Doble',
      [RoomType.SUITE]: 'Suite',
      [RoomType.PRESIDENTIAL]: 'Suite Presidencial',
    };
    return names[roomType];
  }

  private getRoomPrice(roomType: RoomType): number {
    const prices: Record<RoomType, number> = {
      [RoomType.SIMPLE]: 150,
      [RoomType.DOUBLE]: 200,
      [RoomType.SUITE]: 300,
      [RoomType.PRESIDENTIAL]: 500,
    };
    return prices[roomType];
  }
}

export default new AvailabilityFlow();
