const mongoose = require("mongoose");
const { create } = require("./user.model");
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  interview: {
    type: Schema.Types.ObjectId,
    ref: "Interview",
  },
  offerType: {
    //Trainee 3 months, 6 months, 12 months
    type: String,
  },
  offerFrom: {
    type: Date,
  },
  offerTo: {
    type: Date,
  },
  salary: {
    //$1000, $2000, $3000
    type: Number,
  },
  createdBy: {
    // interviewer who created offer
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: "Status",
  },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
