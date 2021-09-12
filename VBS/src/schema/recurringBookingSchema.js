const yup = require("yup");
const { CCAList } = require("../constants/ccas");

const createRecurringBookingSchema = yup.object().shape({
  email: yup.string().email().required(),
  venueId: yup.string().required(),
  startDate: yup.string().required(),
  endDate: yup.string().required(),
  dayOfTheWeek: yup.number().required().oneOf([1, 2, 3, 4, 5, 6, 7]),
  timingSlots: yup.array().of(yup.number().required()).required(),
  notes: yup.string(),
  cca: yup.string().notRequired().oneOf(CCAList),
});

module.exports = { createRecurringBookingSchema };
