/**
 * Servicio de gestión de disponibilidad de habitaciones
 */

import {
  AvailabilityRequest,
  AvailabilityResponse,
  RoomType,
} from '../types/index';
import logger from '../utils/logger';
import config from '../config/index';

// Simulación de reservas existentes
interface SimulatedReservation {
  roomType: RoomType;
  checkIn: Date;
  checkOut: Date;
}

export class AvailabilityService {
  private bookedRooms: SimulatedReservation[] = [];

  /**
   * Verifica la disponibilidad de habitaciones
   */
  checkAvailability(request: AvailabilityRequest): AvailabilityResponse {
    const availableRooms: RoomType[] = [];
    const alternatives: RoomType[] = [];

    // Iterar sobre todos los tipos de habitación
    Object.values(RoomType).forEach((roomType) => {
      const isAvailable = this.isRoomTypeAvailable(
        roomType,
        request.checkInDate,
        request.checkOutDate,
      );

      if (request.roomType === roomType && isAvailable) {
        availableRooms.push(roomType);
      } else if (!request.roomType && isAvailable) {
        availableRooms.push(roomType);
      } else if (isAvailable) {
        alternatives.push(roomType);
      }
    });

    const available = availableRooms.length > 0;

    logger.debug('Disponibilidad verificada', {
      available,
      requestedRoom: request.roomType,
      availableCount: availableRooms.length,
    });

    const message = available
      ? `Disponible${availableRooms.length > 1 ? 's' : ''}: ${availableRooms.join(', ')}`
      : 'No hay disponibilidad para esas fechas';

    return {
      available,
      availableRooms,
      alternativeRooms: alternatives.length > 0 ? alternatives : undefined,
      message,
    };
  }

  /**
   * Verifica si un tipo de habitación está disponible para las fechas solicitadas
   */
  private isRoomTypeAvailable(
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
  ): boolean {
    const bookedCount = this.bookedRooms.filter((reservation) => {
      if (reservation.roomType !== roomType) {
        return false;
      }

      // Verificar si hay conflicto de fechas
      return this.datesOverlap(
        reservation.checkIn,
        reservation.checkOut,
        checkIn,
        checkOut,
      );
    }).length;

    // Simular que hay 10 habitaciones de cada tipo disponibles
    return bookedCount < 10;
  }

  /**
   * Verifica si dos rangos de fechas se solapan
   */
  private datesOverlap(
    existingStart: Date,
    existingEnd: Date,
    newStart: Date,
    newEnd: Date,
  ): boolean {
    return newStart < existingEnd && newEnd > existingStart;
  }

  /**
   * Reserva una habitación (simula la reserva)
   */
  reserveRoom(
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
  ): boolean {
    if (!this.isRoomTypeAvailable(roomType, checkIn, checkOut)) {
      logger.warn('Intento de reservar habitación no disponible', {
        roomType,
        checkIn,
        checkOut,
      });
      return false;
    }

    this.bookedRooms.push({
      roomType,
      checkIn,
      checkOut,
    });

    logger.info('Habitación reservada', {
      roomType,
      checkIn,
      checkOut,
      totalBooked: this.bookedRooms.length,
    });

    return true;
  }

  /**
   * Calcula el número de noches entre dos fechas
   */
  calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Calcula el precio total de una reserva
   */
  calculateTotalPrice(roomType: RoomType, checkIn: Date, checkOut: Date): number {
    const nights = this.calculateNights(checkIn, checkOut);
    const pricePerNight = config.reservation.prices[roomType];
    return nights * pricePerNight;
  }

  /**
   * Obtiene información sobre alternativas disponibles
   */
  getAlternatives(request: AvailabilityRequest): Record<RoomType, boolean> {
    const alternatives: Record<RoomType, boolean> = {
      [RoomType.SIMPLE]: this.isRoomTypeAvailable(
        RoomType.SIMPLE,
        request.checkInDate,
        request.checkOutDate,
      ),
      [RoomType.DOUBLE]: this.isRoomTypeAvailable(
        RoomType.DOUBLE,
        request.checkInDate,
        request.checkOutDate,
      ),
      [RoomType.SUITE]: this.isRoomTypeAvailable(
        RoomType.SUITE,
        request.checkInDate,
        request.checkOutDate,
      ),
      [RoomType.PRESIDENTIAL]: this.isRoomTypeAvailable(
        RoomType.PRESIDENTIAL,
        request.checkInDate,
        request.checkOutDate,
      ),
    };

    return alternatives;
  }

  /**
   * Obtiene estadísticas de ocupación
   */
  getOccupancyStats(): {
    totalReservations: number;
    byRoomType: Record<RoomType, number>;
  } {
    const byRoomType: Record<RoomType, number> = {
      [RoomType.SIMPLE]: 0,
      [RoomType.DOUBLE]: 0,
      [RoomType.SUITE]: 0,
      [RoomType.PRESIDENTIAL]: 0,
    };

    this.bookedRooms.forEach((reservation) => {
      byRoomType[reservation.roomType]++;
    });

    return {
      totalReservations: this.bookedRooms.length,
      byRoomType,
    };
  }

  /**
   * Limpia todas las reservas simuladas (para testing)
   */
  clearBookings(): void {
    this.bookedRooms = [];
    logger.debug('Todas las reservas simuladas fueron limpiadas');
  }
}

export default new AvailabilityService();
