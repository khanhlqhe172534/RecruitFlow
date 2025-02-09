const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phoneNumber: {
    type: String,
  },
  isMale: {
    type: Boolean,
  },
  dob: {
    type: Date,
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: "Status",
  },

  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;


