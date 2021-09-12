module.exports = {
  PORT: process.env.PORT || 8080,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRES: process.env.JWT_ACCESS_TOKEN_EXPIRES,
  DB_URL: process.env.DB_URL,
};
