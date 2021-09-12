const { Schema, connection, Types } = require("mongoose");

const BookingReqSchema = new Schema(
  {
    email: { type: String, required: true },
    venue: { type: Types.ObjectId, ref: "VenueSchema", required: true },
    date: { type: Number, required: true },
    timingSlots: { type: [Number], required: true },
    isApproved: { type: Boolean, required: true, default: false },
    isRejected: { type: Boolean, required: true, default: false },
    isCancelled: { type: Boolean, requiered: true, default: false },
    bookingIds: {
      type: [{ type: Types.ObjectId, ref: "BookingSchema" }],
      required: false,
    },
    conflictingRequest: {
      type: [{ type: Types.ObjectId, ref: "BookingReqSchema" }],
      default: [],
    },
    notes: { type: String, maxLength: 500 },
    cca: { type: String, default: "PERSONAL" },
  },
  {
    collection: "booking_requests",
    timestamps: true,
  }
);

module.exports = connection.model("BookingReqSchema", BookingReqSchema);
