const { UNAUTHORIZED } = require("http-status");
const { DUMMY_AUTH } = require("../config");
const { errorFormatter } = require("../utils/errorFormatter");

const dummyAuthMiddleware = (req, res, next) => {
  const secretKey = req.headers.authorization;

  if (!secretKey) {
    const err = errorFormatter("Invalid", UNAUTHORIZED);
    return next(err);
  }

  if (secretKey !== DUMMY_AUTH) {
    const err = errorFormatter("Invalid", UNAUTHORIZED);
    return next(err);
  }

  // eslint-disable-next-line no-console
  console.log("INFO - User is admin hack");
  return next();
};

module.exports = { dummyAuthMiddleware };
