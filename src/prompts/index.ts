/**
 * Prompts predefinidos para diferentes flujos del chatbot
 */

import { RoomType } from '../types/index';
import config from '../config/index';

export const PROMPTS = {
  GREETING: `¡Hola! 👋 Bienvenido a ${config.hotel.name}. 

Soy tu asistente de reservas disponible 24/7. ¿En qué puedo ayudarte hoy?

1️⃣ Reservar una habitación
2️⃣ Consultar disponibilidad
3️⃣ Ver tarifas
4️⃣ Saber sobre nuestros servicios
5️⃣ Modificar una reserva
6️⃣ Hablar con recepción

Simplemente escribe el número o describe lo que necesitas.`,

  BOOKING_START: `Perfecto, vamos a hacer tu reserva. Te guiaré paso a paso.

¿Cuál es tu nombre completo?`,

  BOOKING_CHECK_IN: `Gracias {name}. 

¿Cuál es tu fecha de check-in? (formato: DD/MM/YYYY)`,

  BOOKING_CHECK_OUT: `¿Y tu fecha de check-out? (formato: DD/MM/YYYY)

Recuerda que el check-out es a las 11:00 AM.`,

  BOOKING_GUESTS: `¿Cuántos huéspedes serán en total?`,

  BOOKING_ROOM_TYPE: `Excelente. Ahora, ¿qué tipo de habitación prefieres?

1️⃣ Simple (1 cama) - $${config.reservation.prices[RoomType.SIMPLE]}/noche
2️⃣ Doble (2 camas) - $${config.reservation.prices[RoomType.DOUBLE]}/noche
3️⃣ Suite (Lujo) - $${config.reservation.prices[RoomType.SUITE]}/noche
4️⃣ Suite Presidencial (Premium) - $${config.reservation.prices[RoomType.PRESIDENTIAL]}/noche

¿Cuál te interesa? (responde 1, 2, 3 o 4)`,

  BOOKING_SPECIAL_REQUESTS: `¿Tienes algún pedido especial? (Ej: vista al mar, piso alto, cuna para bebé)

Si no hay nada especial, solo escribe "No" o "Ninguno".`,

  BOOKING_CONFIRMATION: `Perfecto. Aquí está el resumen de tu reserva:

{summary}

¿Deseas confirmar esta reserva? (Sí/No)`,

  SERVICES_MENU: `Aquí están nuestros principales servicios:

🌐 WiFi - Internet de alta velocidad incluido en todas las habitaciones
🏊 Piscina - Piscina climatizada abierta de 07:00 a 21:00
🍽️ Restaurante - Nuestro restaurante 5 estrellas sirve de 06:00 a 23:00
🧖 Spa - Centro de bienestar y masajes (costo adicional)
🚗 Estacionamiento - Parqueadero cubierto y seguro
🐕 Mascotas - Aceptamos mascotas en habitaciones seleccionadas
⏰ Check-in/out - Check-in a partir de 14:00, Check-out hasta 11:00
📋 Cancelación - Política flexible: puedes cancelar hasta 24h antes sin costo

¿Deseas más información sobre algún servicio?`,

  AVAILABILITY_START: `Perfecto, voy a verificar la disponibilidad para ti.

¿Cuál es tu fecha de check-in? (formato: DD/MM/YYYY)`,

  AVAILABILITY_CHECK_OUT: `¿Y tu fecha de check-out? (formato: DD/MM/YYYY)`,

  AVAILABILITY_GUESTS: `¿Para cuántos huéspedes?`,

  AVAILABILITY_ROOM_TYPE: `¿Tienes preferencia de tipo de habitación o quieres ver las opciones disponibles?

1️⃣ Simple
2️⃣ Doble
3️⃣ Suite
4️⃣ Suite Presidencial
5️⃣ Ver todas las opciones disponibles`,

  ESCALATION_QUEUED: `Entendido. Te estoy conectando con nuestro equipo de recepción. Ellos podrán ayudarte de mejor manera.

Número de atención: {reference}
Hora: {time}

Gracias por tu paciencia. ¡Un agente estará contigo en breve!`,

  FAREWELL: `Gracias por tu tiempo. ¡Esperamos verte pronto en ${config.hotel.name}! 🏨

Si necesitas ayuda más tarde, siempre estoy disponible. 

Teléfono: ${config.hotel.phone}
Email: ${config.hotel.email}`,

  ERROR: `Disculpa, no entendí bien tu mensaje. 

¿Podrías intentar de nuevo? Puedo ayudarte con:
- Reservas
- Disponibilidad
- Servicios
- O conectarte con recepción`,

  NOT_AVAILABLE: `Lamentablemente no hay disponibilidad para esas fechas y preferencias.

¿Te gustaría:
1️⃣ Intentar con diferentes fechas
2️⃣ Ver alternativas de habitaciones
3️⃣ Hablar con recepción para opciones especiales`,

  PRICE_INFO: `Aquí están nuestras tarifas:

🛏️ Habitación Simple: $${config.reservation.prices[RoomType.SIMPLE]}/noche
🛏️🛏️ Habitación Doble: $${config.reservation.prices[RoomType.DOUBLE]}/noche
✨ Suite: $${config.reservation.prices[RoomType.SUITE]}/noche
👑 Suite Presidencial: $${config.reservation.prices[RoomType.PRESIDENTIAL]}/noche

Todas las tarifas incluyen:
✓ Desayuno completo
✓ WiFi de alta velocidad
✓ Acceso a piscina
✓ Aire acondicionado

¿Te gustaría hacer una reserva?`,
};
