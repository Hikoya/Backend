const { Router, json } = require("express");
const { loginController } = require("../controllers/auth/login.controller");
const {
  registerController,
} = require("../controllers/auth/register.controller");
const { loginSchema, signupSchema } = require("../schema/authSchema");
const { validationHelper } = require("../utils/requestValidationTool");

const router = Router();

router.use(json());

router.get("/ping", (req, res, next) => {
  return res.send("Successfully inside auth routes");
});

router.post("/login", validationHelper(loginSchema, "body"), loginController);
router.post(
  "/register",
  validationHelper(signupSchema, "body"),
  registerController
);

module.exports = router;
