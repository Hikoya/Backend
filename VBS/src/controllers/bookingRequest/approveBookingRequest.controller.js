const { BAD_REQUEST, ACCEPTED, INTERNAL_SERVER_ERROR } = require("http-status");
const Booking = require("../../models/booking.model");
const BookingRequest = require("../../models/bookingRequest.model");
const { checkIfVenueAvailable } = require("../../services/booking.service");
const {
  rejectBookingRequestInTheseSlots,
} = require("../../services/bookingRequest.service");
const { sendEmail } = require("../../services/email.service");
const { errorFormatter } = require("../../utils/errorFormatter");
const { approveTemplate } = require("../../templates/htmlTemplate");
const { convertUnixToDateString } = require("../../utils/dateToUnix");
const { mapSlotsToTiming } = require("../../utils/mapSlotsToTiming");

// check if booking request exist
// check if booking request is already approved
// check if booking request is already rejected
// check if venue is available for given timingSlots
// make booking
// approve booking request and save bookingIds to booking request
// reject all booking request that conflict with this
// return

const approveBookingRequestController = async (req, res, next) => {
  const { body } = req;
  const { bookingRequestId } = body;

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

  const { email, venue, date, notes, isApproved, isRejected } = bookingRequest;
  const bookingTimeSlots = bookingRequest.timingSlots;

  if (isApproved) {
    const message =
      "Booking request has already been approved. You cannot reApprove it";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  if (isRejected) {
    const message =
      "Booking request has already been rejected. You cannot approve a rejected request";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  let isVenueAvailable;
  try {
    isVenueAvailable = await checkIfVenueAvailable(
      venue,
      date,
      bookingTimeSlots
    );
  } catch (err) {
    return next(err);
  }

  if (!isVenueAvailable) {
    const message = "some slots for this venue is unavailable";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  const newBookingIds = [];

  for (let i = 0; i < bookingTimeSlots.length; i += 1) {
    const timingSlot = bookingTimeSlots[i];
    const newBooking = new Booking({
      email: email,
      venue: venue,
      date: date,
      timingSlot: timingSlot,
      notes: notes,
    });
    let savedBooking;
    try {
      // if order dont matter, should use map, then promise.all it. To improve the speed
      savedBooking = await newBooking.save();
    } catch (err) {
      return next(err);
    }

    newBookingIds.push(savedBooking.id);
  }

  bookingRequest.isApproved = true;
  bookingRequest.bookingIds = newBookingIds;
  let savedBookingRequest;
  try {
    savedBookingRequest = await bookingRequest.save();
    savedBookingRequest = await BookingRequest.findOne({
      _id: savedBookingRequest.id,
    })
      .populate("venue")
      .populate("bookingIds");
  } catch (err) {
    return next(err);
  }

  const bookings = savedBookingRequest.bookingIds.map((booking) => {
    const returnBooking = {
      id: booking._id,
      date: convertUnixToDateString(booking.date),
      timingSlot: mapSlotsToTiming(booking.timingSlot),
      notes: booking.notes,
    };

    return returnBooking;
  });

  const html = approveTemplate({
    id: savedBookingRequest._id.toString(),
    email: savedBookingRequest.email,
    venue: savedBookingRequest.venue.toObject(),
    bookingIds: bookings,
    cca: savedBookingRequest.cca || "Personal",
  });

  // send email of approval
  try {
    await sendEmail(
      email,
      "[APPROVED] Your request of booking has been approved",
      savedBookingRequest.toString(),
      html
    );
  } catch (err) {
    return next(err);
  }

  // reject all request that has this slot
  let rejectedBookingRequestsIds = [];
  try {
    rejectedBookingRequestsIds = await rejectBookingRequestInTheseSlots(
      venue,
      date,
      bookingTimeSlots,
      savedBookingRequest.id
    );
  } catch (err) {
    const message =
      "Error occured after booking has been approved. Pls check console for more detailed error logs";
    // eslint-disable-next-line no-console
    console.log(err);
    return next(errorFormatter(message, INTERNAL_SERVER_ERROR));
  }

  savedBookingRequest.conflictingRequest = rejectedBookingRequestsIds;

  try {
    savedBookingRequest = await savedBookingRequest.save();
  } catch (err) {
    return next(err);
  }

  return res.status(ACCEPTED).json({
    bookingRequestId: savedBookingRequest.id,
    bookingIds: newBookingIds,
    rejectedBookingRequestsIds: rejectedBookingRequestsIds,
  });
};

module.exports = { approveBookingRequestController };
