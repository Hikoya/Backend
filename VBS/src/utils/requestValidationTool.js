const { BAD_REQUEST } = require("http-status");

// Description
// Schema - yup schema used to validate
// Key - key in the request you want to validate (e.g. body, params, query)
//
// Returns - a middleware function with the validation done.
const validationHelper = (schema, key) => {
  const returnFunc = async (req, res, next) => {
    const value = req[key];
    try {
      await schema.validate(value);
    } catch (err) {
      err.status = BAD_REQUEST;
      return next(err);
    }

    req[key] = schema.cast(value);
    return next();
  };

  return returnFunc;
};

module.exports = { validationHelper };
