import mysql from "mysql";
import "dotenv/config";

/**
 * Function that creates a pool of database connections
 * @author   Chung Loong
 * @return   MySQL Pool
 */
export const pool = mysql.createPool({
  connectionLimit: 30,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  timezone: "+08:00",
  waitForConnections: true,
});

/**
 * Function that checks for connection to database
 * Throws critical error when connection fails
 * @author   Chung Loong
 * @return   void
 */
const checkConnection = () => {
  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!

    connection.ping(function (err) {
      if (err) throw err;
      console.log("Server responded to ping");
    });

    connection.release();
  });
};

/**
 * Function that query the database with the specific query.
 * Throws critical error when connection fails
 * @author   Chung Loong
 * @param    {String} query
 * @return   MySQL Object
 */
export const queryDatabase = (query) => {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      // Use the connection
      connection.query(query, function (error, results, fields) {
        if (error) {
          console.error(error.sqlMessage);
          return reject(new Error(error));
        }

        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) throw error;

        resolve(results);

        // Don't use the connection here, it has been returned to the pool.
      });
    });
  });
};

checkConnection();
