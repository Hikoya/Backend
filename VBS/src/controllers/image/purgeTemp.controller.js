const fs = require("fs/promises");
const { OK } = require("http-status");

const purgeTempController = async (req, res, next) => {
  // relative to this file. should be moved to a constants file
  try {
    await fs.rmdir(`${__dirname}/../../temp`, { recursive: true });
  } catch (err) {
    return next(err);
  }

  try {
    await fs.mkdir(`${__dirname}/../../temp`);
  } catch (err) {
    return next(err);
  }

  return res.status(OK).json({ message: "purge succeeded" });
};

module.exports = { purgeTempController };
