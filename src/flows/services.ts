/**
 * Flujo de información sobre servicios
 */

import {
  ConversationFlow,
  BotResponse,
  MessageType,
} from '../types/index';
import { contextService, aiService } from '../services/index';
import { PROMPTS } from '../prompts/index';
import logger from '../utils/logger';

export class ServicesFlow {
  async handle(userId: string, userMessage: string): Promise<BotResponse> {
    const context = contextService.getOrCreateContext(userId);
    contextService.addMessage(userId, 'user', userMessage);

    try {
      contextService.updateFlow(userId, ConversationFlow.SERVICES);

      const lowerMessage = userMessage.toLowerCase();

      // Responder según el servicio solicitado
      if (
        lowerMessage.includes('wifi') ||
        lowerMessage.includes('internet') ||
        lowerMessage.includes('conexión')
      ) {
        return this.serviceWifi(userId);
      }

      if (
        lowerMessage.includes('piscina') ||
        lowerMessage.includes('pool') ||
        lowerMessage.includes('nadar')
      ) {
        return this.servicePool(userId);
      }

      if (
        lowerMessage.includes('restaurante') ||
        lowerMessage.includes('comida') ||
        lowerMessage.includes('desayuno')
      ) {
        return this.serviceRestaurant(userId);
      }

      if (
        lowerMessage.includes('spa') ||
        lowerMessage.includes('masaje') ||
        lowerMessage.includes('bienestar')
      ) {
        return this.serviceSpa(userId);
      }

      if (
        lowerMessage.includes('mascota') ||
        lowerMessage.includes('perro') ||
        lowerMessage.includes('gato')
      ) {
        return this.servicePets(userId);
      }

      if (
        lowerMessage.includes('estacionamiento') ||
        lowerMessage.includes('parqueadero') ||
        lowerMessage.includes('parking') ||
        lowerMessage.includes('auto')
      ) {
        return this.serviceParking(userId);
      }

      if (
        lowerMessage.includes('check-in') ||
        lowerMessage.includes('check-out') ||
        lowerMessage.includes('horario')
      ) {
        return this.serviceCheckIn(userId);
      }

      if (
        lowerMessage.includes('cancelación') ||
        lowerMessage.includes('cancelar') ||
        lowerMessage.includes('política')
      ) {
        return this.serviceCancellation(userId);
      }

      if (
        lowerMessage === 'no' ||
        lowerMessage === 'volver' ||
        lowerMessage === 'menú'
      ) {
        return this.backToMenu(userId);
      }

      // Mostrar menú completo nuevamente
      return this.showFullServices(userId);
    } catch (error) {
      logger.error('Error en ServicesFlow', { userId, error: String(error) });
      const response = PROMPTS.ERROR;
      contextService.addMessage(userId, 'assistant', response);
      return { content: response, messageType: MessageType.TEXT };
    }
  }

  private serviceWifi(userId: string): BotResponse {
    const response = `🌐 **WiFi de Alta Velocidad**

Todas nuestras habitaciones incluyen acceso a WiFi de alta velocidad sin costo adicional.

Características:
• Velocidad: 100 Mbps
• Disponible 24/7
• Clave proporcionada al check-in
• Soporte técnico disponible

¿Necesitas ayuda con la conexión?`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Otros servicios', 'Volver al menú'],
    };
  }

  private servicePool(userId: string): BotResponse {
    const response = `🏊 **Piscina Climatizada**

Disfruta de nuestra hermosa piscina climatizada disponible para todos los huéspedes.

Detalles:
• Horario: 07:00 a 21:00
• Temperatura: 28°C
• Incluido en la tarifa
• Toallas disponibles en recepción
• Área infantil disponible

¿Te gustaría hacer una reserva?`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Reservar', 'Otros servicios'],
    };
  }

  private serviceRestaurant(userId: string): BotResponse {
    const response = `🍽️ **Restaurante 5 Estrellas**

Nuestro chef prepara lo mejor de la gastronomía local e internacional.

Información:
• Horario: 06:00 a 23:00
• Desayuno completo incluido
• Almuerzo: 12:00 a 15:00
• Cena: 19:00 a 23:00
• Terraza con vista panorámica
• Menú especial para alergias

Reservaciones en recepción o llamando al ${this.getHotelPhone()}`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Otros servicios', 'Recepción'],
    };
  }

  private serviceSpa(userId: string): BotResponse {
    const response = `🧖 **Spa y Centro de Bienestar**

Relájate en nuestro exclusivo spa con tratamientos premium.

Servicios:
• Masajes terapéuticos
• Faciales
• Tratamientos corporales
• Sauna y vapor
• Piscina de hidromasaje

Costo: $50-150 por servicio
Reserva con anticipación: ${this.getHotelPhone()}`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Reservar servicios', 'Otros servicios'],
    };
  }

  private servicePets(userId: string): BotResponse {
    const response = `🐕 **Política de Mascotas**

¡Tus mascotas son bienvenidas!

Política:
• Aceptamos perros y gatos pequeños
• Habitaciones pet-friendly seleccionadas
• Costo adicional: $20 por noche
• Máximo 2 mascotas por habitación
• Responsabilidad del daño corre por cuenta del huésped

Requisitos:
• Debe traer documentos de vacunación
• Comportamiento tranquilo requerido

¿Tienes mascotas?`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Sí, tengo mascotas', 'Otros servicios'],
    };
  }

  private serviceParking(userId: string): BotResponse {
    const response = `🚗 **Estacionamiento Seguro**

Parqueadero cubierto y vigilado 24/7.

Características:
• Estacionamiento cubierto
• Vigilancia por cámaras
• Tarjeta de acceso
• Capacidad: 50 espacios
• Incluido en la tarifa

Tarifas por día (si no está incluido):
• Autos pequeños: $15/día
• Autos medianos: $18/día
• Camionetas: $25/día

¿Necesitas un espacio?`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Reservar estacionamiento', 'Otros servicios'],
    };
  }

  private serviceCheckIn(userId: string): BotResponse {
    const response = `⏰ **Horarios de Check-in/Check-out**

Check-in:
• Horario estándar: A partir de 14:00
• Check-in anticipado disponible (sujeto a disponibilidad)
• Sin costo adicional si está disponible

Check-out:
• Hora de check-out: Hasta las 11:00 AM
• Check-out tardío: $30 hasta las 14:00
• Check-out tardío: $50 hasta las 18:00

Nota:
• En caso de llegar muy temprano, guardamos equipaje sin costo
• Contacta a recepción si tienes necesidades especiales`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Otros servicios', 'Recepción'],
    };
  }

  private serviceCancellation(userId: string): BotResponse {
    const response = `📋 **Política de Cancelación**

Flexibilidad garantizada:

Cancelación Gratuita:
• Hasta 24 horas antes del check-in
• Reembolso completo
• Sin penalidades

Cancelación con Cargo:
• Menos de 24 horas: 50% del total
• No-show: 100% del total
• Excepto ofertas especiales

Cambios de Fecha:
• Permitidos sin costo hasta 48h antes
• Sujeto a disponibilidad

Contacto para cancelaciones:
📞 ${this.getHotelPhone()}
📧 ${this.getHotelEmail()}`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Cancelar reserva', 'Otros servicios'],
    };
  }

  private showFullServices(userId: string): BotResponse {
    const response = PROMPTS.SERVICES_MENU;
    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: [
        'WiFi',
        'Piscina',
        'Restaurante',
        'Spa',
        'Mascotas',
        'Estacionamiento',
      ],
    };
  }

  private backToMenu(userId: string): BotResponse {
    const response = `¿Qué te gustaría hacer ahora?

1️⃣ Reservar una habitación
2️⃣ Consultar disponibilidad
3️⃣ Ver tarifas
4️⃣ Más servicios
5️⃣ Hablar con recepción`;

    contextService.addMessage(userId, 'assistant', response);
    return {
      content: response,
      messageType: MessageType.TEMPLATE,
      buttons: ['Reservar', 'Disponibilidad', 'Tarifas', 'Recepción'],
    };
  }

  private getHotelPhone(): string {
    return '+34-900-123-456';
  }

  private getHotelEmail(): string {
    return 'reservas@hotelluxe.com';
  }
}

export default new ServicesFlow();
