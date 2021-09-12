const env = process.env.NODE_ENV || "development";

let envVariables;

if (env === "production") {
  // eslint-disable-next-line global-require
  envVariables = require("./config.production");
} else {
  // eslint-disable-next-line global-require
  envVariables = require("./config.development");
}

module.exports = {
  DB_URL: process.env.DB_URL,
  ...envVariables,
  DUMMY_AUTH: process.env.DUMMY_AUTH,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};
