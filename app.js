const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const taskRouter = require("./routes/taskRoutes");
const userRouter = require("./routes/userRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const activityRouter = require("./routes/activityRoutes");
const preferenceRouter = require("./routes/preferenceRoutes");

const app = express();

// 1) GLOBAL MIDDLEWARES
// Security HTTP headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit request from same IP
const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // 1h
  message: "Too many request from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Attach request body to req object
// Body parser, reading data from body into req.body
app.use(express.json());
// Set cookie on to req obj
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Prevent parameter pollution
app.use(hpp());

// cors
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials
  })
);

// for testing purposes
// Test middleware
app.use((req, res, next) => {
  // console.log(req.headers);
  console.log(req.body);
  // console.log(req.cookies);
  // console.log(req.cookies.jwt);
  next();
});

// 3) ROUTES
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Hello TaskGenius" });
});

app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/activities", activityRouter);
app.use("/api/v1/preferences", preferenceRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4) START SERVER
module.exports = app;
