import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

class GoogleCalendarService {
  private calendar: any;

  constructor() {
    let auth;

    // CASO 1: archivo credentials.json
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/calendar"],
      });
    }

    // CASO 2: credenciales en JSON dentro del .env
    if (process.env.GOOGLE_CREDENTIALS) {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/calendar"],
      });
    }

    this.calendar = google.calendar({ version: "v3", auth });
  }

  async createEvent({
    title,
    description,
    startDate,
    endDate,
  }: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }) {
    const event = await this.calendar.events.insert({
      calendarId: "marianofrancischini@gmail.com",
      requestBody: {
        summary: title,
        description,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "America/Argentina/Buenos_Aires",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "America/Argentina/Buenos_Aires",
        },
      },
    });

    return event.data;
  }
}

export default new GoogleCalendarService();