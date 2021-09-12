const { UNAUTHORIZED } = require("http-status");
const { errorFormatter } = require("../utils/errorFormatter");
const { tokenVerification } = require("../utils/tokenVerification");

const tokenValidationMiddleware = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    const err = errorFormatter("Please login", UNAUTHORIZED);
    return next(err);
  }

  const token = authToken.split(" ")[1];

  if (!token) {
    const err = errorFormatter("Please login", UNAUTHORIZED);
    return next(err);
  }

  const user = tokenVerification(token);

  if (!user) {
    const err = errorFormatter("Please login", UNAUTHORIZED);
    return next(err);
  }

  req.user = user.user;
  return next();
};

module.exports = { tokenValidationMiddleware };
