const yup = require("yup");

const createVenueSchema = yup.object().shape({
  name: yup.string().required(),
  capacity: yup.number().integer().required(),
  openingHours: yup.string().required(),
  priorityEmails: yup.array().of(yup.string()),
  description: yup.string(),
  image: yup.string(),
});

const createChildVenueSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
  capacity: yup.number().integer().required(),
  image: yup.string(),
});

const editVenueSchema = yup.object().shape({
  name: yup.string(),
  description: yup.string(),
  capacity: yup.number().integer(),
  image: yup.string(),
  openingHours: yup.string(),
});

const updateVenueVisibilitySchema = yup.object().shape({
  venueId: yup.string().required(),
});

const updateVenueInstantBookSchema = yup.object().shape({
  venueId: yup.string().required(),
});

module.exports = {
  createVenueSchema,
  updateVenueVisibilitySchema,
  createChildVenueSchema,
  editVenueSchema,
  updateVenueInstantBookSchema,
};
