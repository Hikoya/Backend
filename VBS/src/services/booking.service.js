const Booking = require("../models/booking.model");
const RecurringBooking = require("../models/recurringBooking.model");
const Venue = require("../models/venue.model");
const { getDayOfTheWeekInt } = require("../utils/dateToUnix");

// parent venue only available if all child venue is available
// child venue is only available if parent venue is available

const checkIfVenueAvailable = async (venueId, unixDate, slots = []) => {
  const venue = await Venue.findOne({ _id: venueId });

  const { isChildVenue } = venue;

  let searchQuery;
  let recurringBookingQuery;
  if (isChildVenue) {
    searchQuery = {
      venue: { $in: [venueId, venue.parentVenue] },
      date: unixDate,
      timingSlot: { $in: slots },
    };
    recurringBookingQuery = {
      venue: { $in: [venueId, venue.parentVenue] },
      startDate: { $lte: unixDate },
      endDate: { $gte: unixDate },
      dayOfTheWeek: getDayOfTheWeekInt(unixDate),
      timingSlots: { $in: slots },
    };
  } else {
    searchQuery = {
      venue: { $in: [...venue.childVenues, venueId] },
      date: unixDate,
      timingSlot: { $in: slots },
    };
    recurringBookingQuery = {
      venue: { $in: [...venue.childVenues, venueId] },
      startDate: { $lte: unixDate },
      endDate: { $gte: unixDate },
      dayOfTheWeek: getDayOfTheWeekInt(unixDate),
      timingSlots: { $in: slots },
    };
  }
  const isBooked = await Booking.find(searchQuery);

  const hasRecurringBooking = await RecurringBooking.find(
    recurringBookingQuery
  );

  if (isBooked.length > 0) {
    return false;
  }

  if (hasRecurringBooking.length > 0) {
    return false;
  }

  return true;
};

module.exports = { checkIfVenueAvailable };
