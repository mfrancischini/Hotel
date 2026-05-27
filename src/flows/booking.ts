/**
 * Flujo de reserva
 * Maneja el proceso completo de crear una reserva
 */
import googleCalendarService from "../services/googleCalendar";
import {
    ConversationFlow,
    BotResponse,
    MessageType,
    RoomType,
    ReservationRequest,
} from '../types/index';
import {
    contextService,
    aiService,
    validationService,
    reservationService,
    availabilityService,
} from '../services/index';
import { PROMPTS } from '../prompts/index';
import logger from '../utils/logger';

export class BookingFlow {
    async handle(userId: string, userMessage: string): Promise<BotResponse> {
        const context = contextService.getOrCreateContext(userId);
        contextService.addMessage(userId, 'user', userMessage);

        try {
            const reservationData = context.reservationData;

            // Solicitar nombre
            if (!reservationData.fullName) {
                if (userMessage.trim().length < 2) {
                    return this.askForName(userId, 'El nombre debe tener al menos 2 caracteres');
                }
                contextService.updateReservationData(userId, { fullName: userMessage.trim() });
                const response = PROMPTS.BOOKING_CHECK_IN;
                contextService.addMessage(userId, 'assistant', response);
                return { content: response, messageType: MessageType.TEXT };
            }

            // Solicitar fecha check-in
            if (!reservationData.checkInDate) {
                const checkInDate = this.parseDate(userMessage);
                if (!checkInDate) {
                    return this.askForCheckIn(userId);
                }
                contextService.updateReservationData(userId, { checkInDate });
                const response = PROMPTS.BOOKING_CHECK_OUT;
                contextService.addMessage(userId, 'assistant', response);
                return { content: response, messageType: MessageType.TEXT };
            }

            // Solicitar fecha check-out
            if (!reservationData.checkOutDate) {
                const checkOutDate = this.parseDate(userMessage);
                if (!checkOutDate) {
                    return this.askForCheckOut(userId);
                }
                contextService.updateReservationData(userId, { checkOutDate });
                const response = PROMPTS.BOOKING_GUESTS;
                contextService.addMessage(userId, 'assistant', response);
                return { content: response, messageType: MessageType.TEXT };
            }

            // Solicitar número de huéspedes
            if (!reservationData.numberOfGuests) {
                const guests = parseInt(userMessage, 10);
                if (isNaN(guests) || guests < 1) {
                    return this.askForGuests(userId);
                }
                contextService.updateReservationData(userId, { numberOfGuests: guests });
                const response = PROMPTS.BOOKING_ROOM_TYPE;
                contextService.addMessage(userId, 'assistant', response);
                return { content: response, messageType: MessageType.TEXT };
            }

            // Solicitar tipo de habitación
            if (!reservationData.roomType) {
                const roomType = this.parseRoomType(userMessage);
                if (!roomType) {
                    return this.askForRoomType(userId);
                }
                contextService.updateReservationData(userId, { roomType });
                const response = PROMPTS.BOOKING_SPECIAL_REQUESTS;
                contextService.addMessage(userId, 'assistant', response);
                return { content: response, messageType: MessageType.TEXT };
            }

            // Solicitar peticiones especiales (opcional)
            if (!('specialRequests' in reservationData)) {
                if (
                    userMessage.toLowerCase() !== 'no' &&
                    userMessage.toLowerCase() !== 'ninguno'
                ) {
                    contextService.updateReservationData(userId, {
                        specialRequests: userMessage,
                    });
                }
                return this.showConfirmation(userId);
            }

            // Confirmación final
            if (
                userMessage.toLowerCase() === 'sí' ||
                userMessage.toLowerCase() === 'si' ||
                userMessage.toLowerCase() === 'yes'
            ) {
                return this.completeReservation(userId);
            } else if (
                userMessage.toLowerCase() === 'no' ||
                userMessage.toLowerCase() === 'cancel'
            ) {
                return this.cancelBooking(userId);
            } else {
                return this.showConfirmation(userId);
            }
        } catch (error) {
            logger.error('Error en BookingFlow', { userId, error: String(error) });
            const response = PROMPTS.ERROR;
            contextService.addMessage(userId, 'assistant', response);
            return { content: response, messageType: MessageType.TEXT };
        }
    }

    private askForName(userId: string, errorMessage?: string): BotResponse {
        const response = errorMessage
            ? `${errorMessage}\n\n¿Cuál es tu nombre completo?`
            : PROMPTS.BOOKING_START;

        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
    }

    private askForCheckIn(userId: string): BotResponse {
        const response = `Por favor, ingresa tu fecha de check-in en formato DD/MM/YYYY (ejemplo: 25/12/2024)`;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
    }

    private askForCheckOut(userId: string): BotResponse {
        const response = `Por favor, ingresa tu fecha de check-out en formato DD/MM/YYYY (debe ser posterior al check-in)`;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
    }

    private askForGuests(userId: string): BotResponse {
        const response = `Por favor, ingresa el número de huéspedes (entre 1 y 10)`;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
    }

    private askForRoomType(userId: string): BotResponse {
        const response = `Por favor, selecciona el tipo de habitación (1, 2, 3 o 4)`;
        contextService.addMessage(userId, 'assistant', response);
        return { content: response, messageType: MessageType.TEXT };
    }

    private parseDate(input: string): Date | null {
        // Intentar múltiples formatos
        const formats = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
            /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
            /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
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

    private parseRoomType(input: string): RoomType | null {
        const roomMap: Record<string, RoomType> = {
            '1': RoomType.SIMPLE,
            'simple': RoomType.SIMPLE,
            '2': RoomType.DOUBLE,
            'doble': RoomType.DOUBLE,
            'double': RoomType.DOUBLE,
            '3': RoomType.SUITE,
            'suite': RoomType.SUITE,
            '4': RoomType.PRESIDENTIAL,
            'presidencial': RoomType.PRESIDENTIAL,
            'presidential': RoomType.PRESIDENTIAL,
        };

        return roomMap[input.toLowerCase()] || null;
    }

    private async showConfirmation(userId: string): Promise<BotResponse> {
        const context = contextService.getOrCreateContext(userId);
        const reservation = context.reservationData as Partial<ReservationRequest>;

        // Validar que los datos requeridos estén presentes
        const validation = validationService.validateRequiredForConfirmation(reservation);
        if (!validation.isValid) {
            contextService.resetReservation(userId);
            return {
                content: 'Algo salió mal con los datos. Vamos a empezar de nuevo.\n\n' + PROMPTS.BOOKING_START,
                messageType: MessageType.TEXT,
            };
        }

        // Verificar disponibilidad
        const availability = await availabilityService.checkAvailability({
            checkInDate: reservation.checkInDate!,
            checkOutDate: reservation.checkOutDate!,
            numberOfGuests: reservation.numberOfGuests!,
            roomType: reservation.roomType,
        });

        if (!availability.available) {
            contextService.resetReservation(userId);
            return {
                content: PROMPTS.NOT_AVAILABLE,
                messageType: MessageType.TEXT,
            };
        }

        // Crear resumen
        const tempReservation = await reservationService.createReservation(
            reservation as ReservationRequest,
        );

        if (!tempReservation) {
            return {
                content: 'Error al procesar la reserva. Por favor intenta de nuevo.',
                messageType: MessageType.TEXT,
            };
        }

        contextService.updateFlow(userId, ConversationFlow.CONFIRMATION);
        const summary = reservationService.getReservationSummary(tempReservation);
        const response = PROMPTS.BOOKING_CONFIRMATION.replace('{summary}', summary);

        contextService.addMessage(userId, 'assistant', response);

        return {
            content: response,
            messageType: MessageType.TEMPLATE,
            buttons: ['Confirmar reserva', 'Cancelar y empezar de nuevo'],
            metadata: { reservationData: tempReservation },
        };
    }

    private async completeReservation(userId: string): Promise<BotResponse> {
        contextService.updateFlow(userId, ConversationFlow.COMPLETED);

        const context = contextService.getOrCreateContext(userId);
        const reservation = context.reservationData;

        const bookingReference = `HLX-${Date.now()}`;

        try {
            await googleCalendarService.createEvent({
                title: `Reserva de ${reservation.fullName}`,
                description: `
🏨 HOTEL RESERVATION

👤 Huésped: ${reservation.fullName}
🛏️ Habitación: ${reservation.roomType}
👥 Huéspedes: ${reservation.numberOfGuests}
🎫 Referencia: ${bookingReference}
            `,
                startDate: reservation.checkInDate!,
                endDate: reservation.checkOutDate!,
            });

            logger.info("📅 Evento creado en Google Calendar");
        } catch (error) {
            logger.error("❌ Error Google Calendar", {
                error: String(error),
            });
        }

        const response = `✅ ¡Tu reserva ha sido confirmada exitosamente!

Pronto recibirás un email con los detalles completos de tu reserva.

${PROMPTS.FAREWELL}`;

        contextService.addMessage(userId, 'assistant', response);

        return {
            content: response,
            messageType: MessageType.TEXT,
            metadata: { status: 'completed' },
        };
    }
    private cancelBooking(userId: string): BotResponse {
        contextService.resetReservation(userId);

        const response = `No hay problema. Hemos cancelado la reserva.\n\n¿Hay algo más en lo que pueda ayudarte?\n\n${PROMPTS.GREETING}`;

        contextService.addMessage(userId, 'assistant', response);
        logger.info('Reserva cancelada', { userId });

        return {
            content: response,
            messageType: MessageType.TEXT,
        };
    }
}

export default new BookingFlow();
