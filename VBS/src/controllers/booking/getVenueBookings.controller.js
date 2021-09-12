const { OK } = require("http-status");
const Booking = require("../../models/booking.model");
const {
  convertUnixToDateString,
  convertDateStringToUnix,
} = require("../../utils/dateToUnix");

const getVenueBookingsController = async (req, res, next) => {
  const { query } = req;
  const { startDate, endDate, venueId } = query;

  let startDateToUnix;
  try {
    startDateToUnix = convertDateStringToUnix(startDate);
  } catch (err) {
    return next(err);
  }

  let endDateToUnix;
  try {
    endDateToUnix = convertDateStringToUnix(endDate);
  } catch (err) {
    return next(err);
  }

  let bookings = [];
  try {
    bookings = await Booking.find({
      venue: venueId,
      date: { $gte: startDateToUnix, $lte: endDateToUnix },
    });
  } catch (err) {
    return next(err);
  }

  const response = {};
  bookings.map((booking) => {
    const { date, timingSlot } = booking;
    const dateString = convertUnixToDateString(date, "yyyyLLdd");
    const dateStringExist = response[dateString];

    if (!dateStringExist) {
      response[dateString] = [timingSlot];
    } else {
      const arr = response[dateString];
      const newArr = [...arr, timingSlot];
      response[dateString] = newArr;
    }
    return booking;
  });

  return res.status(OK).json({ bookings: response });
};

module.exports = { getVenueBookingsController };
