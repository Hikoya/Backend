const { Router, json } = require("express");

const authRouter = require("./auth.routes");
const venueRouter = require("./venue.routes");
const bookingRequestRouter = require("./bookingRequest.routes");
const bookingRouter = require("./booking.routes");
const recurringBookingRouter = require("./recurringBooking.routes");
const imageRouter = require("./image.routes");

const router = Router();
router.use(json());

router.get("/ping", (req, res) => res.send("Successfully inside routes"));

router.use("/auth", authRouter);
router.use("/venue", venueRouter);
router.use("/bookingreq", bookingRequestRouter);
router.use("/booking", bookingRouter);
router.use("/recurringbooking", recurringBookingRouter);
router.use("/image", imageRouter);

module.exports = router;
