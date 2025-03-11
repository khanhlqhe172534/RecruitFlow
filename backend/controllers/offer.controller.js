const { json } = require("body-parser");
const Offer = require("../models/offer.model");
const mongoose = require("mongoose");
const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");
const nodemailer = require("nodemailer");

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

//============ Create new offer ===============================================================
async function createOffer(req, res, next) {
  try {
    const { interview, offerType, offerFrom, offerTo, salary, createdBy } =
      req.body;

    if (!interview || !offerType || !offerFrom || !offerTo || !createdBy) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isNaN(salary) || salary < 0) {
      return res
        .status(400)
        .json({ message: "Salary must be a valid positive number." });
    }

    const interviewData = await Interview.findById(interview)
      .populate("candidate job")
      .lean();
    if (!interviewData) {
      return res.status(404).json({ message: "Interview not found." });
    }

    const WATTING_FOR_APPROVED_ID = "67bc5a667ddc08921b739695";
    const OFFERED_STATUS_ID = "67bc5a667ddc08921b73969b";

    const offer = new Offer({
      interview,
      offerType,
      offerFrom,
      offerTo,
      salary,
      createdBy,
      //change offer status to "waiting for approved"
      status: WATTING_FOR_APPROVED_ID,
    });

    await offer.save();

    // change interview status to "offered"
    const updateQueries = [
      Interview.findByIdAndUpdate(interview, { status: OFFERED_STATUS_ID }),
    ];

    await Promise.all(updateQueries);

    const populatedOffer = await Offer.findById(offer._id)
      .populate("interview createdBy status")
      .populate({
        path: "interview",
        populate: { path: "candidate job" },
      });

    // Gửi email cho ứng viên về thông tin offer
    await sendOfferNotificationEmail(populatedOffer);

    res.status(201).json(populatedOffer);
  } catch (err) {
    console.error("Error creating offer:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
  }
}

async function sendOfferNotificationEmail(offer) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: offer.interview.candidate.email,
    subject: "Job Offer: Congratulations on Your Offer!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Job Offer Details</h2>
        <p>Dear ${offer.interview.candidate.fullname || "Candidate"},</p>

        <div style="background-color: #e6f3e6; padding: 20px; border-radius: 10px; border: 1px solid #4CAF50;">
          <h3 style="color: #4CAF50;">Great News! 🎉</h3>
          <p>We are pleased to extend an official offer for the position of <strong>${
            offer.interview.job?.title || "the role"
          }</strong>.</p>
        </div>

        <div style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
          <strong>Offer Details:</strong>
          <ul>
            <li><strong>Offer Type:</strong> ${offer.offerType}</li>
            <li><strong>Salary:</strong> $${offer.salary.toLocaleString()}</li>
            <li><strong>Start Date:</strong> ${offer.offerFrom}</li>
            <li><strong>End Date:</strong> ${offer.offerTo}</li>
          </ul>
        </div>

        <p>Please review the details and let us know if you have any questions. We look forward to having you on board!</p>

        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(emailContent);
    console.log(
      `Offer notification email sent to ${offer.interview.candidate.email}. MessageId: ${info.messageId}`
    );
  } catch (error) {
    console.error("Error sending offer notification email:", error);
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
    if (offer.status.name == "open") {
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
        offer.status = { _id: "67bc5a667ddc08921b739697", name: "open" };
      }
    }

    res.status(200).json(offer);
  } catch (error) {
    next(error);
  }
};

//  update offer status
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

// ============Update an offer by ID===============================================================
async function updateOfferById(req, res, next) {
  try {
    const { id } = req.params;
    const { salary, updatedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID." });
    }

    if (!mongoose.Types.ObjectId.isValid(updatedBy)) {
      return res.status(400).json({ message: "Invalid updatedBy user ID." });
    }

    if (salary !== undefined && (isNaN(salary) || salary < 0)) {
      return res
        .status(400)
        .json({ message: "Salary must be a valid positive number." });
    }

    const existingOffer = await Offer.findById(id).populate("interview");
    if (!existingOffer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    const updateData = { ...req.body, updatedBy };

    const updatedOffer = await Offer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("interview createdBy updatedBy")
      .populate({
        path: "interview",
        populate: { path: "candidate job" },
      })
      .lean();

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found after update." });
    }

    // Gửi email thông báo cập nhật offer
    await sendOfferUpdateEmail(updatedOffer);

    res.status(200).json(updatedOffer);
  } catch (err) {
    console.error("Error in updateOfferById:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
  }
}

async function sendOfferUpdateEmail(updatedOffer) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: updatedOffer.interview.candidate.email,
    subject: "Updated Job Offer Details",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Job Offer Updated</h2>
        <p>Dear ${updatedOffer.interview.candidate.fullname || "Candidate"},</p>

        <div style="background-color: #ffecb3; padding: 20px; border-radius: 10px; border: 1px solid #ff9800;">
          <h3 style="color: #ff9800;">Important Update 📢</h3>
          <p>Your job offer for the position of <strong>${
            updatedOffer.interview.job?.title || "the role"
          }</strong> has been updated.</p>
        </div>

        <div style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
          <strong>Updated Offer Details:</strong>
          <ul>
            <li><strong>Offer Type:</strong> ${updatedOffer.offerType}</li>
            <li><strong>Updated Salary:</strong> $${updatedOffer.salary.toLocaleString()}</li>
            <li><strong>Start Date:</strong> ${updatedOffer.offerFrom}</li>
            <li><strong>End Date:</strong> ${updatedOffer.offerTo}</li>
          </ul>
        </div>

        <p>Please review the new details and let us know if you have any concerns.</p>

        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(emailContent);
    console.log(
      `Offer update email sent to ${updatedOffer.interview.candidate.email}. MessageId: ${info.messageId}`
    );
  } catch (error) {
    console.error("Error sending offer update email:", error);
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
//====================Cancel Offer===============================================================
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

//====================Accept Offer===============================================================

async function acceptOffer(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Người thực hiện accept

    // Tìm offer và populate thông tin phỏng vấn + job + candidate liên quan
    const offer = await Offer.findById(id).populate({
      path: "interview",
      populate: { path: "candidate job" }, // Lấy thông tin ứng viên và job
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Cập nhật trạng thái offer thành "Accepted"
    offer.status = "67c7f361e825bf941d636e07"; // Accept status ID
    offer.updatedBy = userId;

    const updateQueries = [offer.save()]; // Lưu offer trước

    // Nếu có job liên quan, cập nhật số lượng tuyển
    if (offer.interview?.job?._id) {
      const job = await Job.findById(offer.interview.job._id);

      if (job) {
        job.number_of_vacancies = Math.max(0, job.number_of_vacancies - 1); // Giảm số lượng cần tuyển đi 1

        // Nếu không còn vị trí tuyển dụng, cập nhật trạng thái job thành "Closed" và cập nhật thời gian cho fullAt
        if (job.number_of_vacancies === 0) {
          job.status = "67bc5a667ddc08921b739698"; // Closed status ID
          job.fullAt = new Date();
        }

        updateQueries.push(job.save());
      }
    }

    // Nếu có candidate, cập nhật trạng thái thành "offered"
    if (offer.interview) {
      // Populate interview để lấy candidate ID
      const interview = await Interview.findById(offer.interview).select(
        "candidate"
      );

      if (interview?.candidate) {
        const candidate = await Candidate.findById(interview.candidate);

        if (candidate) {
          candidate.status = "67bc5a667ddc08921b73969b"; // Offered status ID
          updateQueries.push(candidate.save());

          // Tìm tất cả offer khác của candidate với trạng thái "waiting for approve" và reject chúng
          const otherOffers = await Offer.find({
            _id: { $ne: offer._id },
            interview: {
              $in: await Interview.find({ candidate: candidate._id }).distinct(
                "_id"
              ),
            }, // Lấy tất cả interview của candidate
            status: "67bc5a667ddc08921b739695", // Waiting for approve status ID
          });

          console.log(
            "Other offers found:",
            otherOffers.map((o) => o._id)
          );

          for (let o of otherOffers) {
            o.status = "67c7f374e825bf941d636e09"; // Reject status ID
            o.updatedBy = new mongoose.Types.ObjectId(userId); // Đảm bảo ObjectId hợp lệ
            updateQueries.push(o.save());
          }
        }
      }
    }

    // Chờ tất cả các cập nhật hoàn thành
    await Promise.all(updateQueries);
    console.log("All updates applied successfully");

    // Gửi email xác nhận offer
    await sendOfferAcceptanceEmail(offer);

    res.status(200).json({ message: "Offer accepted successfully" });
  } catch (err) {
    console.error("Error accepting offer:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function sendOfferAcceptanceEmail(offer) {
  // Kiểm tra thông tin ứng viên
  if (!offer.interview?.candidate?.email) {
    console.error("Candidate email not found, skipping email notification.");
    return;
  }

  // Cấu hình email transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Nội dung email
  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: offer.interview.candidate.email,
    subject: "Thank You for Accepting Our Offer!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Offer Acceptance Confirmation</h2>
        <p>Dear ${offer.interview.candidate.fullname || "Candidate"},</p>
        
        <div style="background-color: #e6f3e6; padding: 20px; border-radius: 10px; border: 1px solid #4CAF50;">
          <h3 style="color: #4CAF50;">Thank You! 🎉</h3>
          <p>We are delighted that you have accepted our offer for the <strong>${
            offer.job?.title || "position"
          }</strong>.</p>
          <p>We are excited to have you on board and look forward to working with you.</p>
        </div>
        
        <p>Our HR team will reach out to you soon with the next steps.</p>
        
        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  // Gửi email
  const info = await transporter.sendMail(emailContent);
  console.log(
    `Offer acceptance email sent to ${offer.interview.candidate.email}. MessageId: ${info.messageId}`
  );
}
//===============Reject Offer===============================================================

async function rejectOffer(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Người thực hiện reject

    // Tìm offer và populate thông tin phỏng vấn
    const offer = await Offer.findById(id).populate({
      path: "interview",
      populate: { path: "candidate" }, // Lấy thông tin ứng viên từ phỏng vấn
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const updateQueries = [];

    // Nếu có ứng viên liên quan, cập nhật trạng thái thành "Activated"
    if (offer.interview?.candidate?._id) {
      updateQueries.push(
        Candidate.findByIdAndUpdate(offer.interview.candidate._id, {
          status: "67bc5a667ddc08921b739694", // Activated status ID
        })
      );
    }

    // Cập nhật trạng thái của offer thành "Rejected"
    offer.status = "67c7f374e825bf941d636e09"; // Rejected status ID
    offer.updatedBy = userId;
    updateQueries.push(offer.save());

    // Thực hiện cập nhật song song
    await Promise.all(updateQueries);

    // Gửi email thông báo reject
    await sendOfferRejectionEmail(offer);

    res
      .status(200)
      .json({ message: "Offer rejected and updated successfully" });
  } catch (err) {
    console.error("Error rejecting offer:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function sendOfferRejectionEmail(offer) {
  // Kiểm tra thông tin ứng viên
  if (!offer.interview?.candidate?.email) {
    console.error("Candidate email not found, skipping email notification.");
    return;
  }

  // Cấu hình email transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Nội dung email
  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: offer.interview.candidate.email,
    subject: "Update on Your Offer",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Regarding Your Offer</h2>
        <p>Dear ${offer.interview.candidate.fullname || "Candidate"},</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 10px; border: 1px solid #dc3545;">
          <h3 style="color: #dc3545;">Offer Update</h3>
          <p>After careful consideration, we regret to inform you that we have decided not to proceed with the offer for the <strong>${
            offer.job?.title || "position"
          }</strong>.</p>
          <p>We sincerely appreciate the time you spent throughout this process and the opportunity to connect with you.</p>
        </div>
        
        <p>We hope to have the chance to work together in another project or position in the future.</p>
        
        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  // Gửi email
  const info = await transporter.sendMail(emailContent);
  console.log(
    `Offer rejection email sent to ${offer.interview.candidate.email}. MessageId: ${info.messageId}`
  );
}

const offerController = {
  getAllOffer,
  createOffer,
  getOfferById,
  updateOfferById,
  deleteOfferById,
  cancelOffer,
  acceptOffer,
  rejectOffer,
};

module.exports = offerController;
