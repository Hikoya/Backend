const { Schema, connection, Types } = require("mongoose");

const RecurringBookingSchema = new Schema(
  {
    email: { type: String, required: true },
    venue: { type: Types.ObjectId, ref: "VenueSchema", required: true },
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    dayOfTheWeek: { type: Number, requied: true },
    timingSlots: { type: [Number], required: true },
    cca: { type: String },
    notes: { type: String, maxLength: 500 },
  },
  {
    collection: "recurring_bookings",
    timestamps: true,
  }
);

module.exports = connection.model(
  "RecurringBookingSchema",
  RecurringBookingSchema
);
