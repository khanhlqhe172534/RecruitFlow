const candidateController = require("./candidate.controller");
const interviewController = require("./interview.controller");
const jobController = require("./job.controller");
const offerController = require("./offer.controller");
const statsController = require("./stats.controller");
const userController = require("./user.controller");
module.exports = {
  interviewController,
  userController,
  offerController,
  candidateController,
  jobController,
  statsController
};
