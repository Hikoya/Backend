const { Router, json } = require("express");
const {
  approveBookingRequestController,
} = require("../controllers/bookingRequest/approveBookingRequest.controller");
const {
  createBookingRequestController,
} = require("../controllers/bookingRequest/createBookingRequest.controller");
const { dummyAuthMiddleware } = require("../middlewares/dummyAuth.middleware");
const {
  getBookingRequestInfo,
} = require("../controllers/bookingRequest/getBookingRequestInfo.controller");
const {
  bookingRequestSchema,
  approveBookingRequestSchema,
  getBookingRequestSchema,
  rejectBookingRequestSchema,
} = require("../schema/bookingRequestSchema");
const { validationHelper } = require("../utils/requestValidationTool");
const {
  getAllBookingRequestController,
} = require("../controllers/bookingRequest/getAllBookingRequest.controller");
const {
  rejectBookingRequestController,
} = require("../controllers/bookingRequest/rejectBookingRequest.controller");

const router = Router();

router.use(json());

router.get("/ping", (req, res, next) => {
  return res.send("Successfully inside booking request routes");
});

router.post(
  "/",
  validationHelper(bookingRequestSchema, "body"),
  createBookingRequestController
);

router.get(
  "/",
  validationHelper(getBookingRequestSchema, "query"),
  getBookingRequestInfo
);

router.get("/all", dummyAuthMiddleware, getAllBookingRequestController);

router.post(
  "/approve",
  dummyAuthMiddleware,
  validationHelper(approveBookingRequestSchema, "body"),
  approveBookingRequestController
);

router.post(
  "/reject",
  dummyAuthMiddleware,
  validationHelper(rejectBookingRequestSchema, "body"),
  rejectBookingRequestController
);

module.exports = router;
