const { UNAUTHORIZED } = require("http-status");
const { errorFormatter } = require("../utils/errorFormatter");

const isAdminMiddleware = (req, res, next) => {
  const isAdmin = req.user.isAdmin;

  if (!isAdmin) {
    const message = "You are not authorized for this route";
    const err = errorFormatter(message, UNAUTHORIZED);
    return next(err);
  }

  console.log("INFO - User is admin");
  return next();
};

module.exports = { isAdminMiddleware };
