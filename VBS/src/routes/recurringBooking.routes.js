const { Router, json } = require("express");
const {
  createRecurringBookingController,
} = require("../controllers/recurringBooking/createRecurringBooking.controller");
const {
  getAllRecurringBookingController,
} = require("../controllers/recurringBooking/getAllRecurringBoookings.controller");
const { dummyAuthMiddleware } = require("../middlewares/dummyAuth.middleware");
const {
  createRecurringBookingSchema,
} = require("../schema/recurringBookingSchema");
const { validationHelper } = require("../utils/requestValidationTool");

const router = Router();

router.use(json());

router.get("/ping", (req, res) =>
  res.send("Successfully inside recurring booking routes")
);

router.get("/search", dummyAuthMiddleware, getAllRecurringBookingController);

router.post(
  "/create",
  dummyAuthMiddleware,
  validationHelper(createRecurringBookingSchema, "body"),
  createRecurringBookingController
);

module.exports = router;
