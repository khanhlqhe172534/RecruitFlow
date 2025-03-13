const bcrypt = require("bcrypt");
const saltRounds = 10;
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
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log(this.password);
  this.password = await bcrypt.hash(this.password, saltRounds);
  console.log(this.password);
  next();
});
userSchema.methods.correctPassword = async function (userPassword) {
  const correct = await bcrypt.compare(userPassword, this.password);
  return correct;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
