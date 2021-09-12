const { Router, json } = require("express");
const {
  getVenueBookingsController,
} = require("../controllers/booking/getVenueBookings.controller");
const { bookingSchema } = require("../schema/bookingSchema");
const { validationHelper } = require("../utils/requestValidationTool");

const router = Router();

router.use(json());

router.get("/ping", (req, res) =>
  res.send("Successfully inside booking routes")
);

router.get(
  "/get",
  validationHelper(bookingSchema, "query"),
  getVenueBookingsController
);

module.exports = router;
