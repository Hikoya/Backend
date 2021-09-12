const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");

const tokenVerification = (token) => {
  let verified = false;
  try {
    verified = jwt.verify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("Invalid token");
    return false;
  }

  return verified;
};

module.exports = { tokenVerification };
