const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Status = require("./status.model");

const jobSchema = new Schema({
  job_name: {
    type: String,
    required: true,
  },
  salary_max: {
    type: Number,
    required: true,
  },
  salary_min: {
    type: Number,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  levels: {
    //junior, fresher, senior
    type: String,
    // enum: ["Junior", "Fresher", "Senior"], // Select options
    required: true,
  },
  skills: [
    {
      //java, python
      type: String,
      // enum: ["Java", "C++", ".Net", "NodeJs", "Business Analysis", "Communication"], // Checklist options
      required: true,
    },
  ],
  working_type: {
    //fulltime, parttime
    type: String,
    // enum: ["Fulltime", "Parttime"], // Select options
    required: true,
  },
  experience: {
    //1 year, 2 years
    type: String,
    required: true,
  },
  // number of needed employees
  number_of_vacancies: {
    type: Number,
    required: true,
  },
  benefits: [
    {
      //13th-month salary, 12 days of annual paid leaveFlexible working time, from Monday to Friday;....
      type: String,
      // enum: ["Lunch", "Hybrid working", "25-day leave", "travel", "healthcare insurance"], // Checklist options
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: "Status",
  },
  description: {
    type: String,
  },
  createdAt:
  {
    type: Date,
    default: Date.now,
  },
  updatedAt:
  {
    type: Date,
    default: Date.now,
  },
});

jobSchema.pre("save", async function (next) {
  const currentDate = new Date();

  if (this.end_date && currentDate > this.end_date) {
    const closedStatus = await Status.findOne({ name: "closed" });
    if (closedStatus) {
      this.status = closedStatus._id;
    }
  }
  next();
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
