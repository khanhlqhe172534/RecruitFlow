const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const interviewSchema = new Schema(
  {
    interviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rm: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    interview_date: {
      type: Date,
    },
    meeting_link: {
      type: String,
    },
    result: {
      type: String,
    },
    note: {
      type: String,
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;
