require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require("http-status");

const routes = require("./src/routes");

const app = express();

app.use(helmet());
app.use(cors());

// const options = {
//   dotfiles: "ignore",
//   etag: true,
// }

app.use(express.static("public"));

app.get("/ping", (req, res) =>
  res.send("You have successfully connected to the server")
);

app.use("/api/v1", routes);

app.use((req, res, next) => {
  const err = new Error("Route not found");
  err.status = NOT_FOUND;
  return next(err);
});

app.use((err, req, res) => {
  const status = err.status || INTERNAL_SERVER_ERROR;

  // eslint-disable-next-line no-console
  console.log(err.message);
  return res.status(status).json({
    status: "error",
    message: err.message,
  });
});

module.exports = app;
