const { OK } = require("http-status");
const BookingRequest = require("../../models/bookingRequest.model");
const { convertUnixToDateString } = require("../../utils/dateToUnix");
const { mapSlotsToTiming } = require("../../utils/mapSlotsToTiming");

const getAllBookingRequestController = async (req, res, next) => {
  const { query } = req;
  const { q } = query;

  let searchQuery = {};

  if (q === "PENDING") {
    searchQuery = { isApproved: false, isRejected: false, isCancelled: false };
  } else if (q === "APPROVED") {
    searchQuery = { isApproved: true, isRejected: false, isCancelled: false };
  } else if (q === "REJECTED") {
    searchQuery = { isRejected: true };
  } else if (q === "CANCELLED") {
    searchQuery = { isCancelled: true };
  }

  let allBookingRequest;
  try {
    allBookingRequest = await BookingRequest.find(searchQuery)
      .populate("venue")
      .sort({ createdAt: -1 });
  } catch (err) {
    return next(err);
  }

  const returnBookingRequest = allBookingRequest.map((bookingRequest) => {
    const { id, email, isApproved, isRejected, notes, venue, cca } =
      bookingRequest;
    const date = convertUnixToDateString(bookingRequest.date);
    const timingSlots = bookingRequest.timingSlots.map((timingSlot) =>
      mapSlotsToTiming(timingSlot)
    );

    return {
      id,
      email,
      date,
      timingSlots,
      notes,
      isApproved,
      isRejected,
      venue,
      cca,
    };
  });

  return res.status(OK).json({ bookingRequest: returnBookingRequest });
};

module.exports = { getAllBookingRequestController };
