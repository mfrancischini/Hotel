/**
 * Configuración centralizada del proyecto
 */

import dotenv from 'dotenv';
import { RoomPricing, RoomType } from '../types/index';

dotenv.config();

export interface Config {
  openai: {
    apiKey: string;
    model: string;
  };
  hotel: {
    name: string;
    phone: string;
    email: string;
  };
  bot: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    environment: 'development' | 'production';
  };
  context: {
    storage: 'local' | 'redis';
    ttl: number;
  };
  reservation: {
    maxGuests: number;
    roomsAvailable: number;
    prices: RoomPricing;
  };
}

const config: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  hotel: {
    name: process.env.HOTEL_NAME || 'Hotel Luxe',
    phone: process.env.HOTEL_PHONE || '+34-900-123-456',
    email: process.env.HOTEL_EMAIL || 'reservas@hotelluxe.com',
  },
  bot: {
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    environment: (process.env.ENVIRONMENT as 'development' | 'production') || 'development',
  },
  context: {
    storage: (process.env.CONTEXT_STORAGE as 'local' | 'redis') || 'local',
    ttl: parseInt(process.env.CONTEXT_TTL || '3600', 10),
  },
  reservation: {
    maxGuests: parseInt(process.env.MAX_GUESTS || '10', 10),
    roomsAvailable: parseInt(process.env.ROOMS_AVAILABLE || '50', 10),
    prices: {
      [RoomType.SIMPLE]: parseInt(process.env.ROOM_PRICES_SIMPLE || '150', 10),
      [RoomType.DOUBLE]: parseInt(process.env.ROOM_PRICES_DOUBLE || '200', 10),
      [RoomType.SUITE]: parseInt(process.env.ROOM_PRICES_SUITE || '300', 10),
      [RoomType.PRESIDENTIAL]: parseInt(process.env.ROOM_PRICES_PRESIDENTIAL || '500', 10),
    },
  },
};

export const validateConfig = (): void => {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  if (!config.hotel.name) {
    throw new Error('HOTEL_NAME environment variable is required');
  }
};

export default config;
