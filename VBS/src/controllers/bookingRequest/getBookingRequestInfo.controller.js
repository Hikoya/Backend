const { BAD_REQUEST, OK } = require("http-status");
const BookingRequest = require("../../models/bookingRequest.model");
const { errorFormatter } = require("../../utils/errorFormatter");

const getBookingRequestInfo = async (req, res, next) => {
  const { query } = req;
  const { bookingRequestId } = query;

  let bookingRequest;
  try {
    bookingRequest = await BookingRequest.findOne({ _id: bookingRequestId })
      .populate("bookingIds")
      .populate("venue");
  } catch (err) {
    return next(err);
  }

  if (!bookingRequest) {
    const message = "No such booking request";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  return res.status(OK).json({ bookingRequest: bookingRequest.toObject() });
};

module.exports = { getBookingRequestInfo };
