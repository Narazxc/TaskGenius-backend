const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNHANDLED EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" }); // read variables from the file & save them to nodejs environment variable

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});

const port = process.env.PORT || 3030;
const server = app.listen(port, () =>
  console.log(`server is running on port ${port}`)
);

// subcribe to unhandledRejection event
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  // if db couldn't be connected, our app won't run
  // shutdown the application
  // server.close give server time to finish all the request that are still pending or being handle at the time
  server.close(() => {
    // after all that, shut down the app
    process.exit(1);
  });
});
