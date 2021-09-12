const { BAD_REQUEST, ACCEPTED } = require("http-status");
const Venue = require("../../models/venue.model");
const { errorFormatter } = require("../../utils/errorFormatter");

const createChildVenueController = async (req, res, next) => {
  const { params } = req;
  const { parentId } = params;

  let findParentVenue;
  try {
    findParentVenue = await Venue.findOne({ _id: parentId });
  } catch (err) {
    return next(err);
  }

  if (!findParentVenue) {
    const message = "Invalid parent venue";
    const err = errorFormatter(message, BAD_REQUEST);
    return next(err);
  }

  const { body } = req;
  const { name, capacity } = body;
  const { openingHours, priorityEmails } = findParentVenue;
  const description = body.description || findParentVenue.description;
  const image = body.image || findParentVenue.image;
  const parentVenue = findParentVenue.id;
  const isChildVenue = true;

  const newChildVenue = new Venue({
    name: name,
    capacity: capacity,
    openingHours: openingHours,
    priorityEmails: priorityEmails,
    description: description,
    image: image,
    parentVenue: parentVenue,
    isChildVenue: isChildVenue,
  });

  let savedChildVenue;
  try {
    savedChildVenue = await newChildVenue.save();
  } catch (err) {
    return next(err);
  }

  const { childVenues } = findParentVenue;
  childVenues.push(savedChildVenue.id);

  findParentVenue.childVenues = childVenues;

  try {
    await findParentVenue.save();
  } catch (err) {
    return next(err);
  }

  return res.status(ACCEPTED).json({ venue: savedChildVenue.toObject() });
};

module.exports = { createChildVenueController };
