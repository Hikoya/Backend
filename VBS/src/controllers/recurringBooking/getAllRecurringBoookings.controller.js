const { OK } = require("http-status");
const RecurringBooking = require("../../models/recurringBooking.model");
const { convertUnixToDateString } = require("../../utils/dateToUnix");
const { mapSlotsToTiming } = require("../../utils/mapSlotsToTiming");

const getAllRecurringBookingController = async (req, res, next) => {
  let recurringBookings;
  try {
    recurringBookings = await RecurringBooking.find({
      ...req.query,
    })
      .populate("venue")
      .sort({ createdAt: -1 });
  } catch (err) {
    return next(err);
  }

  const returnRecurringBooking = recurringBookings.map((recurringBooking) => {
    const { id, email, notes, venue, cca } = recurringBooking;
    const startDate = convertUnixToDateString(recurringBooking.startDate);
    const endDate = convertUnixToDateString(recurringBooking.endDate);
    const timingSlots = recurringBooking.timingSlots.map((timingSlot) =>
      mapSlotsToTiming(timingSlot)
    );

    return {
      id,
      email,
      startDate,
      endDate,
      timingSlots,
      notes,
      venue,
      cca,
    };
  });

  return res.status(OK).json({ recurringBookings: returnRecurringBooking });
};

module.exports = { getAllRecurringBookingController };
