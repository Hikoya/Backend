const yup = require("yup");

const loginSchema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
});

const signupSchema = yup.object().shape({
  email: yup.string().email().required(),
  username: yup.string().required(),
  password: yup.string().required(),
});

module.exports = { loginSchema, signupSchema };
