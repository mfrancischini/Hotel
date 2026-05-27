/**
 * Servicio de validación para datos de reserva
 */

import { ReservationRequest, ValidationResult, ValidationError, RoomType } from '../types/index';
import logger from '../utils/logger';
import config from '../config/index';

export class ValidationService {
  /**
   * Valida una solicitud de reserva completa
   */
  validateReservation(reservation: Partial<ReservationRequest>): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar nombre
    if (!reservation.fullName || reservation.fullName.trim().length < 2) {
      errors.push({
        field: 'fullName',
        message: 'El nombre debe tener al menos 2 caracteres',
        code: 'INVALID_NAME',
      });
    }

    // Validar fechas
    const dateValidation = this.validateDates(reservation.checkInDate, reservation.checkOutDate);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    }

    // Validar número de huéspedes
    const guestValidation = this.validateGuests(
      reservation.numberOfGuests,
      reservation.roomType,
    );
    if (!guestValidation.isValid) {
      errors.push(...guestValidation.errors);
    }

    // Validar tipo de habitación
    if (reservation.roomType && !Object.values(RoomType).includes(reservation.roomType)) {
      errors.push({
        field: 'roomType',
        message: `Tipo de habitación inválido. Tipos disponibles: ${Object.values(RoomType).join(', ')}`,
        code: 'INVALID_ROOM_TYPE',
      });
    }

    // Validar email si se proporciona
    if (reservation.email && !this.isValidEmail(reservation.email)) {
      errors.push({
        field: 'email',
        message: 'Email inválido',
        code: 'INVALID_EMAIL',
      });
    }

    // Validar teléfono si se proporciona
    if (reservation.phone && !this.isValidPhone(reservation.phone)) {
      errors.push({
        field: 'phone',
        message: 'Número de teléfono inválido',
        code: 'INVALID_PHONE',
      });
    }

    logger.debug('Validación de reserva completada', {
      fullName: reservation.fullName,
      isValid: errors.length === 0,
      errorCount: errors.length,
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida las fechas de check-in y check-out
   */
  private validateDates(checkIn?: Date, checkOut?: Date): ValidationResult {
    const errors: ValidationError[] = [];

    if (!checkIn) {
      errors.push({
        field: 'checkInDate',
        message: 'La fecha de check-in es requerida',
        code: 'MISSING_CHECK_IN',
      });
    }

    if (!checkOut) {
      errors.push({
        field: 'checkOutDate',
        message: 'La fecha de check-out es requerida',
        code: 'MISSING_CHECK_OUT',
      });
    }

    if (checkIn && checkOut) {
      // Validar que check-out sea después de check-in
      if (checkOut <= checkIn) {
        errors.push({
          field: 'checkOutDate',
          message: 'La fecha de check-out debe ser posterior a la de check-in',
          code: 'INVALID_DATE_RANGE',
        });
      }

      // Validar que check-in sea en el futuro
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (checkIn < now) {
        errors.push({
          field: 'checkInDate',
          message: 'La fecha de check-in debe ser en el futuro',
          code: 'PAST_DATE',
        });
      }

      // Validar que no sea más de 1 año en el futuro
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (checkIn > maxDate || checkOut > maxDate) {
        errors.push({
          field: 'checkInDate',
          message: 'Las fechas no pueden ser más de 1 año en el futuro',
          code: 'DATE_TOO_FAR',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida el número de huéspedes según el tipo de habitación
   */
  private validateGuests(
    numberOfGuests?: number,
    roomType?: RoomType,
  ): ValidationResult {
    const errors: ValidationError[] = [];

    if (!numberOfGuests) {
      errors.push({
        field: 'numberOfGuests',
        message: 'El número de huéspedes es requerido',
        code: 'MISSING_GUESTS',
      });
      return { isValid: false, errors };
    }

    if (numberOfGuests < 1) {
      errors.push({
        field: 'numberOfGuests',
        message: 'Debe haber al menos 1 huésped',
        code: 'INVALID_GUEST_COUNT',
      });
    }

    if (numberOfGuests > config.reservation.maxGuests) {
      errors.push({
        field: 'numberOfGuests',
        message: `Máximo ${config.reservation.maxGuests} huéspedes permitidos`,
        code: 'MAX_GUESTS_EXCEEDED',
      });
    }

    // Validar capacidad según tipo de habitación
    const capacities: Record<RoomType, number> = {
      [RoomType.SIMPLE]: 1,
      [RoomType.DOUBLE]: 2,
      [RoomType.SUITE]: 4,
      [RoomType.PRESIDENTIAL]: 6,
    };

    if (roomType && numberOfGuests > capacities[roomType]) {
      errors.push({
        field: 'numberOfGuests',
        message: `La habitación ${roomType} soporta máximo ${capacities[roomType]} huéspedes`,
        code: 'EXCEEDS_ROOM_CAPACITY',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de teléfono
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d+\-\s()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Valida que los datos requeridos para confirmar estén presentes
   */
  validateRequiredForConfirmation(reservation: Partial<ReservationRequest>): ValidationResult {
    const errors: ValidationError[] = [];

    if (!reservation.fullName) {
      errors.push({
        field: 'fullName',
        message: 'Nombre requerido',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    if (!reservation.checkInDate) {
      errors.push({
        field: 'checkInDate',
        message: 'Fecha de check-in requerida',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    if (!reservation.checkOutDate) {
      errors.push({
        field: 'checkOutDate',
        message: 'Fecha de check-out requerida',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    if (!reservation.numberOfGuests) {
      errors.push({
        field: 'numberOfGuests',
        message: 'Número de huéspedes requerido',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    if (!reservation.roomType) {
      errors.push({
        field: 'roomType',
        message: 'Tipo de habitación requerido',
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new ValidationService();
