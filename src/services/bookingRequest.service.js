const { Types } = require("mongoose");
const BookingRequest = require("../models/bookingRequest.model");
const Venue = require("../models/venue.model");

const rejectBookingRequestInTheseSlots = async (
  venueId,
  unixDate,
  timingSlots = [],
  except
) => {
  const venue = await Venue.findOne({ _id: venueId });

  const isChildVenue = venue.isChildVenue;
  console.log(venue.childVenues);

  let searchQuery;
  if (isChildVenue) {
    searchQuery = {
      venue: { $in: [venueId, venue.parentVenue] },
      date: unixDate,
      timingSlots: { $in: timingSlots },
    };
  } else {
    searchQuery = {
      venue: {
        $in: [...venue.childVenues, venueId],
      },
      date: unixDate,
      timingSlots: { $in: timingSlots },
    };

    console.log(searchQuery);
  }

  const requestToReject = await BookingRequest.find(searchQuery);

  console.log(requestToReject);

  if (requestToReject.length <= 0) {
    return [];
  }

  console.log(requestToReject);

  rejectedBookingRequestIds = [];
  for (let i = 0; i < requestToReject.length; i++) {
    const request = requestToReject[i];
    if (request.id.toString() === except) {
      continue;
    }
    if (request.isRejected) {
      continue;
    }
    request.isRejected = true;
    const savedRequest = await request.save();

    // send emails of rejection
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

  const isChildVenue = venue.isChildVenue;

  let searchQuery;
  if (isChildVenue) {
    searchQuery = {
      venue: { $in: [venueId, venue.parentVenue] },
      date: unixDate,
      timingSlots: { $in: timingSlots },
    };
  } else {
    searchQuery = {
      venue: {
        $in: [...venue.childVenues, venueId],
      },
      date: unixDate,
      timingSlots: { $in: timingSlots },
    };
  }

  const conflictingBookingRequests = await BookingRequest.find(searchQuery);

  if (conflictingBookingRequests.length <= 0) {
    return [];
  }

  const returnVal = conflictingBookingRequests.filter(
    (conflictingBookingRequest) => {
      return (
        conflictingBookingRequest.id.toString() != except &&
        !conflictingBookingRequest.isRejected
      );
    }
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

module.exports = {
  rejectBookingRequestInTheseSlots,
  getConflictingBookingRequests,
};
