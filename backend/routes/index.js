const candidateRouter = require("./candidate.route");
const interviewRouter = require("./interview.route");
const jobRouter = require("./job.route");
const offerRouter = require("./offer.route");
const userRouter = require("./user.route");
const statsRouter = require("./stats.route");

module.exports = {
  candidateRouter,
  interviewRouter,
  jobRouter,
  offerRouter,
  userRouter,
  statsRouter
};
