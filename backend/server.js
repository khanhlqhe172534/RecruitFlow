const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const createHttpError = require("http-errors");
const {
  candidateRouter,
  interviewRouter,
  jobRouter,
  offerRouter,
  userRouter,
} = require("./routes");
const Db = require("./models");


require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Register routers
app.use("/candidate", candidateRouter);
app.use("/interview", interviewRouter);
app.use("/job", jobRouter);
app.use("/offer", offerRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  next(createHttpError(404, "Not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    },
  });
});

const HOST = process.env.HOST_NAME || "localhost";
const PORT = process.env.PORT_NUMBER || 9999;

app.listen(PORT, HOST, async () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);

  try {
    // Connect to database
    await Db.connectDB();
    console.log("Connected to the database successfully!");

    
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
});