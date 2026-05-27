/**
 * Servicio de gestión de reservas
 */
import googleCalendarService from "../services/googleCalendar";
import {
    ReservationRequest,
    ReservationResponse,
    RoomType,
} from '../types/index';
import logger from '../utils/logger';
import availabilityService from './availability';
import config from '../config/index';
import ReservationModel from "../models/ReservationModel";

export class ReservationService {
    private reservations: Map<string, ReservationResponse> = new Map();
    private reservationCounter: number = 1000;

    /**
     * Crea una nueva reserva
     */
    async createReservation(request: ReservationRequest): Promise<ReservationResponse | null> {
        // Verificar disponibilidad
        const availability = availabilityService.checkAvailability({
            checkInDate: request.checkInDate,
            checkOutDate: request.checkOutDate,
            numberOfGuests: request.numberOfGuests,
            roomType: request.roomType,
        });

        if (!availability.available) {
            logger.warn('Disponibilidad no encontrada para nueva reserva', {
                roomType: request.roomType,
                checkIn: request.checkInDate,
                checkOut: request.checkOutDate,
            });
            return null;
        }

        // Reservar la habitación
        const reserved = availabilityService.reserveRoom(
            request.roomType,
            request.checkInDate,
            request.checkOutDate,
        );

        if (!reserved) {
            return null;
        }

        // Generar IDs
        const reservationId = this.generateReservationId();
        const bookingReference = this.generateBookingReference();

        // Calcular datos
        const numberOfNights = availabilityService.calculateNights(
            request.checkInDate,
            request.checkOutDate,
        );
        const roomPrice = config.reservation.prices[request.roomType];
        const totalPrice = availabilityService.calculateTotalPrice(
            request.roomType,
            request.checkInDate,
            request.checkOutDate,
        );

        // Crear respuesta
        const reservation: ReservationResponse = {
            reservationId,
            bookingReference,
            guestName: request.fullName,
            checkIn: request.checkInDate,
            checkOut: request.checkOutDate,
            roomType: request.roomType,
            numberOfNights,
            totalGuests: request.numberOfGuests,
            totalPrice,
            roomPrice,
            status: 'confirmed',
            createdAt: new Date(),
        };



        // Guardar en memoria (lo que ya tenías)
        this.reservations.set(reservationId, reservation);

        // 🟢 GUARDAR EN MONGODB
        await ReservationModel.create({
            reservationId,
            bookingReference,
            guestName: request.fullName,
            checkIn: request.checkInDate,
            checkOut: request.checkOutDate,
            roomType: request.roomType,
            numberOfNights,
            totalGuests: request.numberOfGuests,
            totalPrice,
            roomPrice,
            status: "confirmed",
            createdAt: new Date(),
        });
        await googleCalendarService.createEvent({
            title: `Reserva - ${request.fullName}`,
            description: `
Referencia: ${bookingReference}
Habitación: ${request.roomType}
Huéspedes: ${request.numberOfGuests}
  `,
            startDate: request.checkInDate,
            endDate: request.checkOutDate,
        });


        // Guardar reserva
        this.reservations.set(reservationId, reservation);

        logger.info('Nueva reserva creada', {
            reservationId,
            bookingReference,
            guestName: request.fullName,
            roomType: request.roomType,
            totalPrice,
        });

        return reservation;
    }



    /**
     * Obtiene una reserva por ID
     */
    getReservation(reservationId: string): ReservationResponse | undefined {
        return this.reservations.get(reservationId);
    }

    /**
     * Obtiene una reserva por referencia de reserva
     */
    getReservationByReference(bookingReference: string): ReservationResponse | undefined {
        for (const reservation of this.reservations.values()) {
            if (reservation.bookingReference === bookingReference) {
                return reservation;
            }
        }
        return undefined;
    }

    /**
     * Cancela una reserva
     */
    cancelReservation(reservationId: string): boolean {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) {
            return false;
        }

        reservation.status = 'cancelled';
        logger.info('Reserva cancelada', {
            reservationId,
            bookingReference: reservation.bookingReference,
        });

        return true;
    }

    /**
     * Obtiene el resumen de una reserva formateado para mostrar
     */
    getReservationSummary(reservation: ReservationResponse): string {
        const checkIn = reservation.checkIn.toLocaleDateString('es-ES');
        const checkOut = reservation.checkOut.toLocaleDateString('es-ES');

        return `
📋 **RESUMEN DE RESERVA**

👤 Nombre: ${reservation.guestName}
📅 Check-in: ${checkIn}
📅 Check-out: ${checkOut}
🛏️ Tipo de habitación: ${this.formatRoomType(reservation.roomType)}
👥 Huéspedes: ${reservation.totalGuests}
🌙 Noches: ${reservation.numberOfNights}

💰 **TARIFA**
Precio por noche: $${reservation.roomPrice}
Total de noches: ${reservation.numberOfNights}
**Total a pagar: $${reservation.totalPrice}**

✅ Estado: ${reservation.status === 'confirmed' ? 'CONFIRMADA' : 'PENDIENTE'}
🎫 Referencia: ${reservation.bookingReference}
    `;
    }

    /**
     * Formatea el nombre del tipo de habitación
     */
    private formatRoomType(roomType: RoomType): string {
        const names: Record<RoomType, string> = {
            [RoomType.SIMPLE]: 'Habitación Simple',
            [RoomType.DOUBLE]: 'Habitación Doble',
            [RoomType.SUITE]: 'Suite',
            [RoomType.PRESIDENTIAL]: 'Suite Presidencial',
        };
        return names[roomType];
    }

    /**
     * Genera un ID único para la reserva
     */
    private generateReservationId(): string {
        return `RES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Genera una referencia de reserva legible
     */
    private generateBookingReference(): string {
        this.reservationCounter++;
        const timestamp = Date.now().toString(36).toUpperCase();
        return `HLX${timestamp}${this.reservationCounter}`;
    }

    /**
     * Obtiene estadísticas de reservas
     */
    getStats(): {
        totalReservations: number;
        confirmedReservations: number;
        cancelledReservations: number;
        byRoomType: Record<RoomType, number>;
    } {
        const stats = {
            totalReservations: this.reservations.size,
            confirmedReservations: 0,
            cancelledReservations: 0,
            byRoomType: {
                [RoomType.SIMPLE]: 0,
                [RoomType.DOUBLE]: 0,
                [RoomType.SUITE]: 0,
                [RoomType.PRESIDENTIAL]: 0,
            } as Record<RoomType, number>,
        };

        this.reservations.forEach((reservation) => {
            if (reservation.status === 'confirmed') {
                stats.confirmedReservations++;
            } else if (reservation.status === 'cancelled') {
                stats.cancelledReservations++;
            }

            stats.byRoomType[reservation.roomType]++;
        });

        return stats;
    }

    /**
     * Limpia todas las reservas (para testing)
     */
    clearReservations(): void {
        this.reservations.clear();
        this.reservationCounter = 1000;
        logger.debug('Todas las reservas fueron limpiadas');
    }
}

export default new ReservationService();
