const { Schema, connection, Types } = require("mongoose");

const BookingSchema = new Schema(
  {
    email: { type: String, required: true },
    venue: { type: Types.ObjectId, ref: "VenueSchema", required: true },
    date: { type: Number, required: true },
    timingSlot: { type: Number, required: true },
    notes: { type: String, maxLength: 500 },
  },
  {
    collection: "bookings",
    timestamps: true,
  }
);

module.exports = connection.model("BookingSchema", BookingSchema);
