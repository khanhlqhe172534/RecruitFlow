const mongoose = require("mongoose");

const User = require("./user.model");
const Candidate = require("./candidate.model");
const Job = require("./job.model");
const Interview = require("./interview.model");
const Offer = require("./offer.model");
const Role = require("./role.model");
const Status = require("./status.model");
const Db = {};

// Noi cac model voi default module  de sau nay su dung
Db.User = User;
Db.Candidate = Candidate;
Db.Job = Job;
Db.Interview = Interview;
Db.Offer = Offer;
Db.Role = Role;
Db.Status = Status;

Db.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully to the database");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit with failure code.
  }
};

module.exports = Db;

// Db.connectDB();
