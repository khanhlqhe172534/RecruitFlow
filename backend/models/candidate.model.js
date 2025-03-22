const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const candidateSchema = new Schema(
  {
    fullname: {
      type: String
    },
    email: {
      type: String,
      required: [true, "Email is required"]
    },
    phoneNumber: {
      type: String
    },
    isMale: {
      type: Boolean
    },
    dob: {
      type: Date
    },
    address: {
      type: String
    },
    cv_url: {
      type: String
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status"
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role"
    },

  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
