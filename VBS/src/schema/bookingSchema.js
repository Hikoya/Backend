const yup = require("yup");

const bookingSchema = yup.object().shape({
  startDate: yup.string().required(),
  endDate: yup.string().required(),
  venueId: yup.string().required(),
});

module.exports = { bookingSchema };
