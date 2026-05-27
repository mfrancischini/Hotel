import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI no configurado");
    }

    await mongoose.connect(uri);

    logger.info("🟢 MongoDB conectado correctamente");
  } catch (error) {
    logger.error("🔴 Error conectando MongoDB", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};