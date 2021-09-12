/* eslint-disable no-console */
const {
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  ACCEPTED,
} = require("http-status");
const jwt = require("jsonwebtoken");
const {
  JWT_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRES,
} = require("../../config/config.development");
const { authenticateUser } = require("../../services/users.service");
const { errorFormatter } = require("../../utils/errorFormatter");

const loginController = async (req, res, next) => {
  const { body } = req.body;

  const { username, password } = body.username;

  console.log("INFO - Finding user with username", username);

  console.log("INFO - Checking if password is correct");
  let validUser = false;
  try {
    validUser = await authenticateUser(username, password);
  } catch (err) {
    return next(err);
  }

  if (!validUser) {
    console.log("ERROR - Invalid password provided for username", username);
    const message = "Incorrect Username or Password";
    const err = errorFormatter(message, UNAUTHORIZED);
    return next(err);
  }

  console.log("INFO - Pasword correct");

  const user = validUser;

  console.log("INFO - Creating jwt token");
  let token;
  try {
    token = jwt.sign(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      },
      JWT_SECRET_KEY,
      { expiresIn: JWT_ACCESS_TOKEN_EXPIRES }
    );
  } catch (err) {
    console.log("Error occured when creating jwt token", err);
    err.status = INTERNAL_SERVER_ERROR;
    return next(err);
  }

  return res.status(ACCEPTED).json({ token, user });
};

module.exports = { loginController };
