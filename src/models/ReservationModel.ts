import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    reservationId: String,
    bookingReference: String,
    guestName: String,
    checkIn: Date,
    checkOut: Date,
    roomType: String,
    numberOfGuests: Number,
    numberOfNights: Number,
    totalPrice: Number,
    status: String,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "reservations" }
);

export default mongoose.model("Reservation", ReservationSchema);