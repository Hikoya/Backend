// Required Information
// email - valid email
// venueId - venue ID has to be valid
// date - string, need to convert to number for storage
// slots - min length 1
// notes - not required

const { BAD_REQUEST, ACCEPTED } = require("http-status");
const BookingRequest = require("../../models/bookingRequest.model");
const Venue = require("../../models/venue.model");
const { checkIfVenueAvailable } = require("../../services/booking.service");
const {
  approveBookingRequestById,
} = require("../../services/bookingRequest.service");
const { sendEmail } = require("../../services/email.service");
const {
  sendMessageToChannel,
  venueBookingRequestMessageBuilder,
} = require("../../services/telegramBot.service");
const { inprogressTemplate } = require("../../templates/htmlTemplate");
const {
  convertDateStringToUnix,
  convertUnixToDateString,
} = require("../../utils/dateToUnix");
const { errorFormatter } = require("../../utils/errorFormatter");
const { mapSlotsToTiming } = require("../../utils/mapSlotsToTiming");

const createBookingRequestController = async (req, res, next) => {
  const { body } = req;
  const { email, venueId, date, notes, cca } = body;

  const timingSlots = body.timingSlots.sort();

  let isVenueIdValid;
  try {
    isVenueIdValid = await Venue.findOne({ _id: venueId, visible: true });
  } catch (err) {
    return next(err);
  }

  if (!isVenueIdValid) {
    const message = "Invalid venue Id";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  let dateToUnix;
  try {
    dateToUnix = convertDateStringToUnix(date);
  } catch (err) {
    return next(err);
  }

  let isVenueAvailable;
  try {
    isVenueAvailable = await checkIfVenueAvailable(
      venueId,
      dateToUnix,
      timingSlots
    );
  } catch (err) {
    return next(err);
  }

  if (!isVenueAvailable) {
    const message =
      "some slots for this venue is unavailable. Please try again or contact admin";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  const bookingRequest = new BookingRequest({
    email: email,
    venue: venueId,
    date: dateToUnix,
    timingSlots: timingSlots,
    notes: notes,
    cca: cca,
  });

  let savedBookingRequest;
  try {
    savedBookingRequest = await bookingRequest.save();
    savedBookingRequest = await BookingRequest.findOne({
      _id: savedBookingRequest.id,
    }).populate("venue");
  } catch (err) {
    return next(err);
  }

  // check if instantBook of venue is true

  const instantBook = isVenueIdValid.isInstantBook;

  if (instantBook) {
    const approvedBookingRequest = await approveBookingRequestById(
      savedBookingRequest.id
    );

    return res.status(ACCEPTED).json({
      message: "Venue eligible for instant booking",
      bookingRequestId: approvedBookingRequest.bookingRequestId,
    });
  }

  // need some form of templating
  const html = inprogressTemplate({
    venueName: savedBookingRequest.venue.name,
    id: savedBookingRequest._id.toString(),
    email: savedBookingRequest.email,
    timingSlots: savedBookingRequest.timingSlots.map((timingSlot) =>
      mapSlotsToTiming(timingSlot)
    ),
    date: convertUnixToDateString(savedBookingRequest.date),
    cca: savedBookingRequest.cca || "Personal",
    notes: savedBookingRequest.notes,
  });

  try {
    await sendEmail(
      email,
      "[IN PROGRESS] We are currently reviewing your booking request",
      savedBookingRequest.toString(),
      html
    );
  } catch (err) {
    return next(err);
  }

  try {
    const message = venueBookingRequestMessageBuilder(savedBookingRequest);
    sendMessageToChannel(message);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("Channel message not sent");
  }

  return res
    .status(ACCEPTED)
    .json({ bookingRequestId: savedBookingRequest.id });
};

module.exports = { createBookingRequestController };
