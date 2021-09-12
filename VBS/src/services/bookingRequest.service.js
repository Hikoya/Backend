const Booking = require("../models/booking.model");
const BookingRequest = require("../models/bookingRequest.model");
const Venue = require("../models/venue.model");
const {
  rejectedTemplate,
  approveTemplate,
} = require("../templates/htmlTemplate");
const { convertUnixToDateString } = require("../utils/dateToUnix");
const { mapSlotsToTiming } = require("../utils/mapSlotsToTiming");
const { sendEmail } = require("./email.service");
const {
  instantBookingRequestMessageBuilder,
  sendMessageToChannel,
} = require("./telegramBot.service");

const rejectBookingRequestInTheseSlots = async (
  venueId,
  unixDate,
  timingSlots = [],
  except
) => {
  const venue = await Venue.findOne({ _id: venueId });

  const { isChildVenue } = venue;

  let searchQuery;
  if (isChildVenue) {
    searchQuery = {
      venue: { $in: [venueId, venue.parentVenue] },
      date: unixDate,
      timingSlots: { $in: timingSlots },
      isRejected: false,
      isCancelled: false,
    };
  } else {
    searchQuery = {
      venue: {
        $in: [...venue.childVenues, venueId],
      },
      date: unixDate,
      timingSlots: { $in: timingSlots },
      isRejected: false,
      isCancelled: false,
    };
  }

  const requestToReject = await BookingRequest.find(searchQuery).populate(
    "venue"
  );

  if (requestToReject.length <= 0) {
    return [];
  }

  const rejectedBookingRequestIds = [];
  for (let i = 0; i < requestToReject.length; i += 1) {
    const request = requestToReject[i];
    if (request.id.toString() === except) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (request.isRejected) {
      // eslint-disable-next-line no-continue
      continue;
    }
    request.isRejected = true;
    const savedRequest = await request.save();

    // send emails of rejection
    // need some form of templating
    const html = rejectedTemplate({
      id: request._id.toString(),
      email: request.email,
      venueName: request.venue.name,
      timingSlots: request.timingSlots.map((timingSlot) =>
        mapSlotsToTiming(timingSlot)
      ),
      date: convertUnixToDateString(request.date),
      cca: request.cca || "Personal",
      notes: request.notes,
    });

    await sendEmail(
      request.email,
      "[REJECTED] Your request for booking has been rejected",
      request.toString(),
      html
    );

    rejectedBookingRequestIds.push(savedRequest.id);
  }

  return rejectedBookingRequestIds;
};

const getConflictingBookingRequests = async (
  venueId,
  unixDate,
  timingSlots = [],
  except
) => {
  const venue = await Venue.findOne({ _id: venueId });

  const { isChildVenue } = venue;

  let searchQuery;
  if (isChildVenue) {
    searchQuery = {
      venue: { $in: [venueId, venue.parentVenue] },
      date: unixDate,
      timingSlots: { $in: timingSlots },
      isRejected: false,
      isCancelled: false,
    };
  } else {
    searchQuery = {
      venue: {
        $in: [...venue.childVenues, venueId],
      },
      date: unixDate,
      timingSlots: { $in: timingSlots },
      isRejected: false,
      isCancelled: false,
    };
  }

  const conflictingBookingRequests = await BookingRequest.find(searchQuery);

  if (conflictingBookingRequests.length <= 0) {
    return [];
  }

  const returnVal = conflictingBookingRequests.filter(
    (conflictingBookingRequest) =>
      conflictingBookingRequest.id.toString() !== except &&
      !conflictingBookingRequest.isRejected
  );

  // rejectedBookingRequestIds = [];
  // for (let i = 0; i < requestToReject.length; i++) {
  //   const request = requestToReject[i];
  //   if (request.id.toString() === except) {
  //     continue;
  //   }
  //   if (request.isRejected) {
  //     continue;
  //   }
  //   request.isRejected = true;
  //   const savedRequest = await request.save();

  //   // send emails of rejection
  //   rejectedBookingRequestIds.push(savedRequest.id);
  // }

  return returnVal;
};

// very dangerous.. need to find a way to refactor it
const approveBookingRequestById = async (bookingRequestId) => {
  const bookingRequest = await BookingRequest.findOne({
    _id: bookingRequestId,
  });

  const {
    email,
    venue,
    date,
    bookingTimeSlots,
    notes,
    isApproved,
    isRejected,
  } = bookingRequest.email;

  if (isApproved) {
    throw new Error(
      "Booking request has already been approved. You cannot reApprove it"
    );
  }

  if (isRejected) {
    throw new Error(
      "Booking request has already been rejected. You cannot approve a rejected request"
    );
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
    const savedBooking = await newBooking.save();

    newBookingIds.push(savedBooking.id);
  }

  bookingRequest.isApproved = true;
  bookingRequest.bookingIds = newBookingIds;
  let savedBookingRequest = await bookingRequest.save();
  savedBookingRequest = await BookingRequest.findOne({
    _id: savedBookingRequest.id,
  })
    .populate("venue")
    .populate("bookingIds");

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
  await sendEmail(
    email,
    "[APPROVED] Your request of booking has been approved",
    savedBookingRequest.toString(),
    html
  );

  try {
    const message = instantBookingRequestMessageBuilder(savedBookingRequest);
    sendMessageToChannel(message);
  } catch (err) {
    /* eslint-disable no-console */
    console.log(err);
    console.log("Channel message not sent");
    /* eslint-enable no-console */
  }

  return {
    bookingRequestId: savedBookingRequest.id,
    bookingIds: newBookingIds,
  };
};

module.exports = {
  rejectBookingRequestInTheseSlots,
  getConflictingBookingRequests,
  approveBookingRequestById,
};
