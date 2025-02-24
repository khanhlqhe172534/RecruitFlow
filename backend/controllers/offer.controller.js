const { json } = require("body-parser");
const Offer = require("../models/offer.model");
const mongoose = require("mongoose");
const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");



// Get all offers with populated fields
async function getAllOffer(req, res, next) {
  try {
    const offers = await Offer.find()
      .populate({
        path: "interview",
        populate: [
          { path: "job", select: "" },
          { path: "candidate", select: "fullname" },
        ],
      })
      .populate("createdBy", "fullname");

    if (!offers || offers.length === 0) {
      return res.status(404).json({ message: "No offers found" });
    }

    res.status(200).json({ offers });
  } catch (err) {
    next(err);
  }
}

// Create new offer without `status`
async function createOffer(req, res, next) {
  try {
    const { interview, offerType, offerFrom, offerTo, salary, createdBy } =
      req.body;

    if (!interview || !offerType || !offerFrom || !offerTo || !createdBy) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create and save the new offer
    const offer = new Offer({
      interview,
      offerType,
      offerFrom,
      offerTo,
      salary,
      createdBy,
    });

    await offer.save();

    // Update interview status
    await Interview.findByIdAndUpdate(interview, {
      status: "67bc5a667ddc08921b73969b", // offered
    });

    // Update candidate status if candidate exists
    const interviewData = await Interview.findById(interview).populate(
      "candidate job"
    );
    if (interviewData?.candidate?._id) {
      await Candidate.findByIdAndUpdate(interviewData.candidate._id, {
        status: "67bc5a667ddc08921b73969b", //offered
      });
    }

    // Decrease job's number_of_vacancies by 1 if job exists
    if (interviewData?.job?._id) {
      const job = await Job.findById(interviewData.job._id);
      if (job) {
        job.number_of_vacancies -= 1;

        // If vacancies are 0, change job status to 'closed'
        if (job.number_of_vacancies === 0) {
          job.status = "67bc5a667ddc08921b739698"; // closed
        }

        await job.save();
      }
    }

    // Populate the offer object
    const populatedOffer = await Offer.findById(offer._id)
      .populate("interview")
      .populate("createdBy")
      .populate({
        path: "interview",
        populate: { path: "candidate job" },
      });

    res.status(201).json(populatedOffer);
  } catch (err) {
    next(err);
  }
}

// Get an offer by ID
const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const offer = await Offer.findById(id)
      .populate({
        path: "interview",
        populate: [
          { path: "job", select: "job_name levels experience working_type salary_min salary_max benefits skills" },
          { path: "candidate", select: "fullname email phoneNumber address dob cv_url" },
          { path: "interviewer", select: "fullname" }
        ]
      })
      .populate("status", "name");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const currentDate = new Date();
    const offerEndDate = new Date(offer.offerTo);

    // Check if the offer is expired
    if (offerEndDate < currentDate) {
      offer.status = { _id: "67bc5a667ddc08921b739698", name: "Close" };
    } else {
      offer.status = { _id: "67bc5a667ddc08921b739697", name: "Open" };
    }

    res.status(200).json(offer);
  } catch (error) {
    next(error);
  }
};


// Backend API to update offer status
const updateOfferStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const offer = await Offer.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: "Failed to update offer status" });
  }
};




// Update an offer by ID
async function updateOfferById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const updateData = req.body;
    const updatedOffer = await Offer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("interview")
      .populate("createdBy");

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json(updatedOffer);
  } catch (err) {
    next(err);
  }
}

// Delete an offer by ID
async function deleteOfferById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const deletedOffer = await Offer.findByIdAndDelete(id);
    if (!deletedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (err) {
    next(err);
  }
}

const offerController = {
  getAllOffer,
  createOffer,
  getOfferById,
  updateOfferById,
  deleteOfferById,
};

module.exports = offerController;
