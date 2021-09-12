const { BAD_REQUEST, ACCEPTED } = require("http-status");
const Venue = require("../../models/venue.model");
const { errorFormatter } = require("../../utils/errorFormatter");

const updateVenueInstantBookController = async (req, res, next) => {
  const { venueId } = req.params;

  let venueFound;
  try {
    venueFound = await Venue.findOne({ _id: venueId });
  } catch (err) {
    return next(err);
  }

  if (!venueFound) {
    const message = "No venue found by given Id";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  const updateVenueInstantBook = !venueFound.isInstantBook;
  venueFound.isInstantBook = updateVenueInstantBook;

  let venueSaved;
  try {
    venueSaved = await venueFound.save();
  } catch (err) {
    return next(err);
  }

  return res.status(ACCEPTED).json({ venue: venueSaved.toObject() });
};

module.exports = { updateVenueInstantBookController };
