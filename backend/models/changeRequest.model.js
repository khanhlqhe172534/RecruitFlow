const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const changeRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedChanges: {
      fullname: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phoneNumber: { type: String, trim: true },
      isMale: { type: Boolean },
      dob: { type: Date },
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminResponse: {
      type: String, // Optional field for admin feedback
      trim: true,
    },
  },
  { timestamps: true }
);

const ChangeRequest = mongoose.model("ChangeRequest", changeRequestSchema);

module.exports = ChangeRequest;
