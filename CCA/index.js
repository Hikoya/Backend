import "dotenv/config";
import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { pool, queryDatabase } from "./connection.js";

/**
 * Express backend setup
 */
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

/**
 * Config table setup. This is where all the table names for
 * the SQL database can be found.
 */
const config = {
  TABLE_USERS: process.env.TABLE_USERS,
};

/**
 * Testing function for backend
 * Default HTTP GET function to edit on
 * @author   Chung Loong
 * @return   void
 */
app.get("/api/get", function (request, response) {
  /**
   *  Use mysql.format() to format strings nicely
   *  Returns a valid, escaped query
   */
  var sql = mysql.format("SELECT * FROM ?? ", [config["TABLE_USERS"]]);
  console.log(sql);

  /**
   *  Use given queryDatabase function to query the database
   *  Returns the results gathered from the database
   */
  queryDatabase(sql)
    .then((data) => {
      /**
       * Do all the logic here
       * eg. sending HTTP response back to the user
       */

      // `data` variable now contains results from database
      console.log(data);

      /**
       *  Always send a response regardless of success or failure
       *  Failed responses can be accompanied with a Error code eg. 404, 500
       *  response.status(401).send('Failed')
       *
       *  Successful responses can be either a string, JSON object or others
       *  Example:
       *  data = {'page' : content.length , 'content' : content};
       *  response.send(data);
       *
       *  response.end() ends the HTTP request.
       */
      response.send("Success");
      response.end();
    })
    .catch((err) => {
      console.log(err);
      response.end();
    });
});

/**
 * Testing function for backend
 * Default HTTP POST function to edit on
 * @author   Chung Loong
 * @return   void
 */
app.post("/api/post", function (request, response) {
  // Get all the data from the HTTP Post form
  const body = request.body;

  /**
   *  Use mysql.format() to format strings nicely
   *  Returns a valid, escaped query
   *  Replace with your own SQL query
   */
  var sql = mysql.format("SELECT * FROM ?? ", [config["TABLE_USERS"]]);
  console.log(sql);

  /**
   *  Use given queryDatabase function to query the database
   *  Returns the results gathered from the database
   */
  queryDatabase(sql)
    .then((data) => {
      /**
       * Do all the logic here
       * eg. sending HTTP response back to the user
       */

      // `data` variable now contains results from database
      console.log(data);

      /**
       *  Always send a response regardless of success or failure
       *  Failed responses can be accompanied with a Error code eg. 404, 500
       *  response.status(401).send('Failed')
       *
       *  Successful responses can be either a string, JSON object or others
       *  Example:
       *  data = {'page' : content.length , 'content' : content};
       *  response.send(data);
       *
       *  response.end() ends the HTTP request.
       */
      response.send("Success");
      response.end();
    })
    .catch((err) => {
      console.log(err);
      response.end();
    });
});

var port = process.env.NODE_PORT;
app.listen(port, () => console.log(`CCA app listening on port ${port}!`));
process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  pool.end(function (err) {
    console.log("\nClosing all database connection.. (Ctrl-C)");
  });
  process.exit();
});
