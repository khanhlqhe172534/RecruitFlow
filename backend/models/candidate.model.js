const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
    password: {
      type: String,
      required: [true, "Password is required"]
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
    skills: [
      {
        //java, python
        type: String,
        // enum:"Java","Nodejs","C++",".Net","Python","JavaScript","PHP", "Ruby","Go","Rust",
        required: true,
      },
    ],

  },
  { timestamps: true }
);


candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log(this.password);
  this.password = await bcrypt.hash(this.password, saltRounds);
  console.log(this.password);
  next();
});
candidateSchema.methods.correctPassword = async function (userPassword) {
  const correct = await bcrypt.compare(userPassword, this.password);
  return correct;
};


const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
