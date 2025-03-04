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

    // Validate required fields
    if (!interview || !offerType || !offerFrom || !offerTo || !createdBy) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isNaN(salary) || salary < 0) {
      return res
        .status(400)
        .json({ message: "Salary must be a valid positive number." });
    }

    // Check if interview exists
    const interviewData = await Interview.findById(interview)
      .populate("candidate job")
      .lean();
    if (!interviewData) {
      return res.status(404).json({ message: "Interview not found." });
    }

    // Use fixed status IDs
    const ACTIVATED_STATUS_ID = "67bc5a667ddc08921b739697";
    const OFFERED_STATUS_ID = "67bc5a667ddc08921b73969b";
    const CLOSED_STATUS_ID = "67bc5a667ddc08921b739698";

    // Create and save the new offer
    const offer = new Offer({
      interview,
      offerType,
      offerFrom,
      offerTo,
      salary,
      createdBy,
      status: ACTIVATED_STATUS_ID, // Assign the activated status directly
    });

    await offer.save();

    // Prepare update queries
    const updateQueries = [
      Interview.findByIdAndUpdate(interview, { status: OFFERED_STATUS_ID }),
    ];

    // Update candidate status
    if (interviewData.candidate?._id) {
      updateQueries.push(
        Candidate.findByIdAndUpdate(interviewData.candidate._id, {
          status: OFFERED_STATUS_ID,
        })
      );
    }

    // Update job vacancies
    if (interviewData.job?._id) {
      const job = await Job.findById(interviewData.job._id);
      if (job) {
        job.number_of_vacancies = Math.max(0, job.number_of_vacancies - 1);
        if (job.number_of_vacancies === 0) {
          job.status = CLOSED_STATUS_ID;
        }
        updateQueries.push(job.save());
      }
    }

    // Execute all updates
    await Promise.all(updateQueries);

    // Populate the offer before sending response
    const populatedOffer = await Offer.findById(offer._id)
      .populate("interview createdBy status")
      .populate({
        path: "interview",
        populate: { path: "candidate job" },
      });

    res.status(201).json(populatedOffer);
  } catch (err) {
    console.error("Error creating offer:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
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
          {
            path: "job",
            select:
              "job_name levels experience working_type salary_min salary_max benefits skills",
          },
          {
            path: "candidate",
            select: "fullname email phoneNumber address dob cv_url",
          },
          { path: "interviewer", select: "fullname" },
        ],
      })
      .populate("status", "name")
      .populate("createdBy", "fullname email") // Get creator details
      .populate("updatedBy", "fullname email"); // Get last updater details

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const currentDate = new Date();
    const offerEndDate = new Date(offer.offerTo);

    // Check if the offer is expired (if it's not already canceled)
    if (offer.status.name !== "cancel") {
      if (offerEndDate < currentDate) {
        // Nếu offer hết hạn, cập nhật thành "Close"
        offer.status = { _id: "67bc5a667ddc08921b739698", name: "Close" };

        // Nếu offer có ứng viên, cập nhật trạng thái ứng viên thành "Activated"
        if (offer.interview?.candidate?._id) {
          await Candidate.findByIdAndUpdate(offer.interview.candidate._id, {
            status: "67bc5a667ddc08921b739694", // Activated candidate status ID
          });
        }
      } else {
        // Nếu offer vẫn còn hạn, cập nhật thành "Open"
        offer.status = { _id: "67bc5a667ddc08921b739697", name: "Open" };
      }
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
    const { salary, updatedBy } = req.body; // Removed 'status'

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID." });
    }

    if (!mongoose.Types.ObjectId.isValid(updatedBy)) {
      return res.status(400).json({ message: "Invalid updatedBy user ID." });
    }

    // Validate salary
    if (salary !== undefined && (isNaN(salary) || salary < 0)) {
      return res
        .status(400)
        .json({ message: "Salary must be a valid positive number." });
    }

    // Find existing offer
    const existingOffer = await Offer.findById(id).lean();
    if (!existingOffer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    // Prepare update object (without modifying status)
    const updateData = { ...req.body, updatedBy };

    // Update offer in database
    const updatedOffer = await Offer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("interview createdBy updatedBy")
      .lean(); // Convert to plain object to avoid Mongoose issues

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found after update." });
    }

    res.status(200).json(updatedOffer);
  } catch (err) {
    console.error("Error in updateOfferById:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
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

async function cancelOffer(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Người thực hiện cancel

    // Tìm offer và populate thông tin phỏng vấn
    const offer = await Offer.findById(id).populate({
      path: "interview",
      populate: { path: "candidate" }, // Lấy thông tin ứng viên từ phỏng vấn
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Cập nhật trạng thái offer thành "Canceled"
    offer.status = "67bc5a667ddc08921b739696"; // Canceled status ID
    offer.updatedBy = userId;

    const updateQueries = [offer.save()]; // Lưu offer trước

    //  Update candidate status to activated
    if (offer.interview?.candidate?._id) {
      updateQueries.push(
        Candidate.findByIdAndUpdate(offer.interview.candidate._id, {
          status: "67bc5a667ddc08921b739694", // update to activated
        })
      );
    }

    // Thực hiện cập nhật song song
    await Promise.all(updateQueries);

    res.status(200).json({ message: "Offer cancelled successfully" });
  } catch (err) {
    console.error("Error canceling offer:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

const offerController = {
  getAllOffer,
  createOffer,
  getOfferById,
  updateOfferById,
  deleteOfferById,
  cancelOffer,
};

module.exports = offerController;
