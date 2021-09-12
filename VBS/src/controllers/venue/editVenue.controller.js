const { BAD_REQUEST, ACCEPTED } = require("http-status");
const fs = require("fs/promises");
const Venue = require("../../models/venue.model");
const { errorFormatter } = require("../../utils/errorFormatter");

const editVenueController = async (req, res, next) => {
  const { params } = req;
  const { venueId } = params;

  const { body } = req;

  let venue;
  try {
    venue = await Venue.findOne({ _id: venueId });
  } catch (err) {
    return next(err);
  }

  if (!venue) {
    const message = "Venue does not exist";
    return next(errorFormatter(message, BAD_REQUEST));
  }

  if (body.image) {
    const { image } = body;

    // move old image out
    if (venue.image) {
      const imageId = venue.image.split("/")[2];
      const tempStorageRemove = `${__dirname}/../../temp/${imageId}`;
      const permStorageRemove = `${__dirname}/../../../public/img/${imageId}`;
      try {
        await fs.rename(permStorageRemove, tempStorageRemove);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log("File not in public folder");
      }
    }

    // move new image in
    const tempStorage = `${__dirname}/../../temp/${image}`;
    const permStorage = `${__dirname}/../../../public/img/${image}`;
    try {
      await fs.rename(tempStorage, permStorage);
    } catch (err) {
      return next(err);
    }

    body.image = `/img/${image}`;
  }

  let updatedVenue;
  try {
    updatedVenue = await Venue.findByIdAndUpdate(
      venueId,
      { ...body },
      { new: true }
    );
  } catch (err) {
    return next(err);
  }

  return res.status(ACCEPTED).json({ venue: updatedVenue.toObject() });
};

module.exports = { editVenueController };
