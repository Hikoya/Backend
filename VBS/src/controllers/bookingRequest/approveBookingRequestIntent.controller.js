const { OK, BAD_REQUEST } = require("http-status");
const BookingRequest = require("../../models/bookingRequest.model");
const {
  getConflictingBookingRequests,
} = require("../../services/bookingRequest.service");
const { convertUnixToDateString } = require("../../utils/dateToUnix");
const { errorFormatter } = require("../../utils/errorFormatter");
const { mapSlotsToTiming } = require("../../utils/mapSlotsToTiming");

// returns what requests will be rejected on approval

const approveBookingRequestIntentController = async (req, res, next) => {
  const { query } = req;
  const { bookingRequestId } = query;

  let bookingRequest;
  try {
    bookingRequest = await BookingRequest.findOne({
      _id: bookingRequestId,
    }).populate("venue");
  } catch (err) {
    return next(err);
  }

  if (!bookingRequest) {
    const message = "Invalid booking requestId";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  const { venue, date } = bookingRequest;
  const bookingTimeSlots = bookingRequest.timingSlots;

  let conflictBookingRequest;
  try {
    conflictBookingRequest = await getConflictingBookingRequests(
      venue,
      date,
      bookingTimeSlots,
      bookingRequest.id
    );
  } catch (err) {
    return next(err);
  }

  const returnId = bookingRequest.id;
  const returnEmail = bookingRequest.email;
  const returnDate = convertUnixToDateString(bookingRequest.date);
  const returnTimingSlots = bookingRequest.timingSlots.map((timingSlot) =>
    mapSlotsToTiming(timingSlot)
  );
  const returnNotes = bookingRequest.notes;
  const returnVenue = bookingRequest.venue;
  const returnCca = bookingRequest.cca;

  const returnConflict = conflictBookingRequest.map((bookingRequestInfo) => {
    const { id, email, notes, venueData, cca } = bookingRequestInfo;
    const dateString = convertUnixToDateString(bookingRequestInfo.date);
    const timingSlots = bookingRequestInfo.timingSlots.map((timingSlot) =>
      mapSlotsToTiming(timingSlot)
    );

    return {
      id,
      email,
      dateString,
      timingSlots,
      notes,
      venueData,
      cca,
    };
  });

  return res.status(OK).json({
    bookingRequest: {
      id: returnId,
      email: returnEmail,
      date: returnDate,
      timingSlots: returnTimingSlots,
      notes: returnNotes,
      venue: returnVenue,
      cca: returnCca,
    },
    conflicts: returnConflict,
  });
};

module.exports = { approveBookingRequestIntentController };
