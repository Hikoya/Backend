const { ACCEPTED } = require("http-status");
const fs = require("fs");
const Venue = require("../../models/venue.model");

const createVenueController = async (req, res, next) => {
  const { body } = req;
  const { name, capacity, openingHours, priorityEmails, description, image } =
    body;

  // move image to perm storage
  if (image) {
    const tempStorage = `${__dirname}/../../temp/${image}`;
    const permStorage = `${__dirname}/../../../public/img/${image}`;
    fs.rename(tempStorage, permStorage, (err) => {
      if (err) {
        return next(err);
      }

      return true;
    });
  }

  const newVenue = new Venue({
    name: name,
    capacity: capacity,
    openingHours: openingHours,
    priorityEmails: priorityEmails,
    description: description,
    image: `/img/${image}`,
  });

  let savedVenue;
  try {
    savedVenue = await newVenue.save();
  } catch (err) {
    return next(err);
  }

  return res.status(ACCEPTED).json({
    venue: savedVenue.toObject(),
  });
};

module.exports = { createVenueController };
