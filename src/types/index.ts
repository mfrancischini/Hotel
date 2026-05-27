/**
 * Tipos e interfaces para el chatbot de reservas de hotel
 */

export enum RoomType {
  SIMPLE = 'simple',
  DOUBLE = 'double',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential',
}

export enum ConversationFlow {
  INITIAL = 'initial',
  BOOKING = 'booking',
  AVAILABILITY = 'availability',
  SERVICES = 'services',
  SUPPORT = 'support',
  CONFIRMATION = 'confirmation',
  COMPLETED = 'completed',
  ESCALATION = 'escalation',
}

export enum MessageType {
  TEXT = 'text',
  BUTTON = 'button',
  LIST = 'list',
  TEMPLATE = 'template',
}

export enum SentimentType {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative',
}

export interface Message {
  userId: string;
  content: string;
  timestamp: Date;
  messageType: MessageType;
  metadata?: Record<string, unknown>;
}

export interface UserContext {
  userId: string;
  currentFlow: ConversationFlow;
  conversationHistory: ConversationMessage[];
  reservationData: Partial<ReservationRequest>;
  lastInteraction: Date;
  sentiment: SentimentType;
  isEscalated: boolean;
  escalationReason?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ReservationRequest {
  fullName: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  roomType: RoomType;
  specialRequests?: string;
  email?: string;
  phone?: string;
}

export interface ReservationResponse {
  reservationId: string;
  bookingReference: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  roomType: RoomType;
  numberOfNights: number;
  totalGuests: number;
  totalPrice: number;
  roomPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
}

export interface AvailabilityRequest {
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  roomType?: RoomType;
}

export interface AvailabilityResponse {
  available: boolean;
  availableRooms: RoomType[];
  alternativeRooms?: RoomType[];
  message: string;
}

export interface AIInterpretationResult {
  intent: string;
  confidence: number;
  extractedEntities: Record<string, unknown>;
  sentiment: SentimentType;
  requiresEscalation: boolean;
  escalationReason?: string;
}

export type RoomPricing = Record<RoomType, number>;

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

export interface BotResponse {
  content: string;
  messageType: MessageType;
  buttons?: string[];
  metadata?: Record<string, unknown>;
}
