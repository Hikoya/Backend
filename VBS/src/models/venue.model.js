const { Schema, connection, Types } = require("mongoose");

const VenueSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    openingHours: { type: String, required: true },
    priorityEmails: { type: [String] },
    description: { type: String, maxLength: 500 },
    visible: { type: Boolean, default: true, required: true },
    image: { type: String, required: false },
    parentVenue: { type: Types.ObjectId, ref: "VenueSchema" },
    isChildVenue: { type: Boolean, default: false, required: true },
    childVenues: {
      type: [{ type: Types.ObjectId, ref: "VenueSchema" }],
      required: false,
      default: [],
    },
    isInstantBook: { type: Boolean, default: false, required: true },
  },
  {
    collection: "venues",
    timestamps: true,
  }
);

module.exports = connection.model("VenueSchema", VenueSchema);
