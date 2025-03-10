const Interview = require("../models/interview.model");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// get all categories
async function getAllInterview(req, res, next) {
  try {
    const interviews = await Interview.find()
      .populate("interviewer")
      .populate("candidate")
      .populate("job")
      .populate("status");
    if (!interviews) {
      return res.status(404).json({ message: "interviews not found" });
    }
    res.status(200).json(interviews);
  } catch (err) {
    next(err);
  }
}

async function getInterviewByInterviewerId(req, res, next) {
  try {
    const { interviewrId } = req.params;

    // Chuyển đổi id thành ObjectId để đảm bảo kiểu dữ liệu khớp
    const objectId = new mongoose.Types.ObjectId(interviewrId);

    const interviews = await Interview.find({ interviewer: objectId })
      .populate("interviewer")
      .populate("candidate")
      .populate("job")
      .populate("status");

    if (!interviews || interviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No interviews found for this interviewer" });
    }

    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    next(error); // Pass error to Express error handler
  }
}

async function createInterview(req, res, next) {
  try {
    const { interviewer, candidate, job, interview_date, meeting_link, note } =
      req.body;

    // // Validate required fields
    // if (!interviewer || !candidate || !job || !interview_date) {
    //   return res.status(400).json({ message: "All fields are required." });
    // }

    // Create a new interview document
    const interview = new Interview({
      interviewer,
      candidate,
      job,
      interview_date,
      meeting_link,
      result: "N/A",
      note,
      status: "67bc5a667ddc08921b739697", // open
    });

    await interview.save();
    try {
      await sendCandidateInterviewInvitation(interview);
    } catch (emailError) {
      console.error("Failed to send interview invitation email:", emailError);
      // Log the error but don't block the interview creation
    }
    res.status(201).json(interview);
  } catch (err) {
    next(err);
  }
}

async function sendCandidateInterviewInvitation(interview) {
  // Populate necessary fields if not already populated
  await interview.populate("candidate interviewer job");

  // Validate candidate email
  if (!interview.candidate?.email) {
    throw new Error("No email found for candidate");
  }

  // Create email transporter (ensure this is configured in your email service)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Prepare email content
  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: interview.candidate.email,
    subject: "Interview Invitation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Invitation</h2>
        <p>Dear ${interview.candidate.fullname || "Candidate"},</p>
        
        <p>We are pleased to invite you to an interview for the position of <strong>${
          interview.job?.title || "Open Position"
        }</strong>.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
          <h3>Interview Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${new Date(
              interview.interview_date
            ).toLocaleString()}</li>
            <li><strong>Interviewer:</strong> ${
              interview.interviewer?.fullname || "HR Representative"
            }</li>
            ${
              interview.meeting_link
                ? `<li><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">Join Interview</a></li>`
                : ""
            }
          </ul>
        </div>
        
        ${
          interview.note
            ? `
        <div style="margin-top: 15px;">
          <strong>Additional Notes:</strong>
          <p>${interview.note}</p>
        </div>
        `
            : ""
        }
        
        <p>Please confirm your attendance by replying to this email or contacting our HR team.</p>
        
        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  // Send email
  const info = await transporter.sendMail(emailContent);
  console.log(
    `Interview invitation email sent to ${interview.candidate.email}. MessageId: ${info.messageId}`
  );

  return info;
}

async function updateInterview(req, res, next) {
  try {
    const { id } = req.params;
    const { interview_date, meeting_link } = req.body;

    // Kiểm tra nếu không có trường nào được gửi
    if (!interview_date && !meeting_link) {
      return res
        .status(400)
        .json({ message: "Only date and meeting link can be updated." });
    }

    // Lấy thông tin phỏng vấn hiện tại
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview_date) {
      const newInterviewDate = new Date(interview_date);
      const now = new Date();

      // Không cho phép đặt lịch ở quá khứ
      if (newInterviewDate < now) {
        return res
          .status(400)
          .json({ message: "Interview date cannot be in the past." });
      }

      // Kiểm tra trùng lịch với các cuộc phỏng vấn khác
      const twoHours = 2 * 60 * 60 * 1000; // 2 giờ tính bằng milliseconds
      const existingInterview = await Interview.findOne({
        interviewer: interview.interviewer,
        _id: { $ne: id }, // Không tính cuộc phỏng vấn hiện tại
        interview_date: {
          $gte: new Date(newInterviewDate.getTime() - twoHours),
          $lte: new Date(newInterviewDate.getTime() + twoHours),
        },
      });

      if (existingInterview) {
        return res
          .status(400)
          .json({
            message: "Interviewer already has an interview during this time.",
          });
      }

      interview.interview_date = newInterviewDate;
    }

    if (meeting_link) {
      interview.meeting_link = meeting_link;
    }

    await interview.save();
    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

async function getInterviewById(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id)
      .populate("interviewer")
      .populate("candidate")
      .populate("job")
      .populate("status");
    if (!interview) {
      return res.status(404).json({ message: "interview not found" });
    }
    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

async function markAsPass(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    // Find and populate the interview with candidate and job details
    const interview = await Interview.findById(id)
      .populate("candidate")
      .populate("job");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Validate candidate email
    if (!interview.candidate?.email) {
      return res.status(400).json({ message: "No candidate email found" });
    }

    // Update interview status
    interview.result = "Pass";
    interview.status = "67bc5a667ddc08921b739699"; // "done"
    interview.note = feedback;

    await interview.save();

    // Send pass notification email
    try {
      await sendPassNotificationEmail(interview);
    } catch (emailError) {
      console.error("Failed to send pass notification email:", emailError);
      // Log the error but don't block the status update
    }

    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

// Email sending function
async function sendPassNotificationEmail(interview) {
  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Prepare email content
  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: interview.candidate.email,
    subject: "Congratulations! Interview Result",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Result</h2>
        <p>Dear ${interview.candidate.fullname || "Candidate"},</p>
        
        <div style="background-color: #e6f3e6; padding: 20px; border-radius: 10px; border: 1px solid #4CAF50;">
          <h3 style="color: #4CAF50;">Congratulations! 🎉</h3>
          <p>We are pleased to inform you that you have <strong>PASSED</strong> the interview for the position of <strong>${
            interview.job?.title || "the role"
          }</strong>.</p>
        </div>
        
        ${
          interview.note
            ? `
        <div style="margin-top: 15px;">
          <strong>Interviewer's Feedback:</strong>
          <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
            ${interview.note}
          </p>
        </div>
        `
            : ""
        }
        
        <p>Next steps will be communicated to you shortly. Thank you for your interest in our company.</p>
        
        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  // Send email
  const info = await transporter.sendMail(emailContent);
  console.log(
    `Pass notification email sent to ${interview.candidate.email}. MessageId: ${info.messageId}`
  );

  return info;
}

async function markAsFail(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    // Find and populate the interview with candidate and job details
    const interview = await Interview.findById(id)
      .populate("candidate")
      .populate("job");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Validate candidate email
    if (!interview.candidate?.email) {
      return res.status(400).json({ message: "No candidate email found" });
    }

    // Update interview status
    interview.result = "Fail";
    interview.status = "67bc5a667ddc08921b739699"; // "done"
    interview.note = feedback;

    await interview.save();

    // Send fail notification email
    try {
      await sendFailNotificationEmail(interview);
    } catch (emailError) {
      console.error("Failed to send fail notification email:", emailError);
      // Log the error but don't block the status update
    }

    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

async function sendFailNotificationEmail(interview) {
  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Prepare email content
  const emailContent = {
    from: {
      name: "HR Recruitment Team",
      address: process.env.EMAIL_USER,
    },
    to: interview.candidate.email,
    subject: "Interview Result Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Result</h2>
        <p>Dear ${interview.candidate.fullname || "Candidate"},</p>
        
        <div style="background-color: #f8e6e6; padding: 20px; border-radius: 10px; border: 1px solid #FF6347;">
          <h3 style="color: #FF6347;">Interview Result Notification</h3>
          <p>We regret to inform you that you were not selected to proceed to the next stage for the position of <strong>${
            interview.job?.title || "the role"
          }</strong>.</p>
        </div>
        
        ${
          interview.note
            ? `
        <div style="margin-top: 15px;">
          <strong>Feedback:</strong>
          <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
            ${interview.note}
          </p>
        </div>
        `
            : ""
        }
        
        <div style="margin-top: 20px; background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
          <h4>We Appreciate Your Effort</h4>
          <p>Thank you for taking the time to interview with us. We encourage you to continue developing your skills and exploring opportunities that align with your career goals.</p>
          <p>We appreciate your interest in our company and wish you the best in your future endeavors.</p>
        </div>
        
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
          If you have any questions about the interview process, please feel free to contact our HR department.
        </p>
        
        <p>Best regards,<br>HR Recruitment Team</p>
      </div>
    `,
  };

  // Send email
  const info = await transporter.sendMail(emailContent);
  console.log(
    `Fail notification email sent to ${interview.candidate.email}. MessageId: ${info.messageId}`
  );

  return info;
}

async function cancelInterview(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Người thực hiện cancel

    // Tìm offer và populate thông tin phỏng vấn
    const interview = await Interview.findById(id).populate({
      path: "interview",
    });

    if (!interview) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Cập nhật trạng thái offer thành "Canceled"
    interview.status = "67bc5a667ddc08921b739696"; // Canceled status ID

    const updateQueries = [interview.save()]; // Lưu offer trước

    // Thực hiện cập nhật song song
    await Promise.all(updateQueries);

    // Gửi email cho ứng viên
    if (interview.candidate?.email) {
      try {
        await sendInterviewCancellationEmail(
          interview.candidate.email,
          interview
        );
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    }

    res.status(200).json({ message: "Interview cancelled successfully" });
  } catch (err) {
    console.error("Error canceling interview:", err);
    res.status(500).json({ message: "Internal server error." });
  }

  async function sendInterviewCancellationEmail(candidateEmail, interview) {
    const subject = "Interview Cancellation Notice";
    const text = `Dear Candidate,
  
  We regret to inform you that your interview scheduled on ${new Date(
    interview.interview_date
  ).toLocaleString()} has been canceled.
  
  If you have any questions, please contact us.
  
  Best regards,
  HR Team`;

    await sendEmail(candidateEmail, subject, text);
  }
}

const interviewController = {
  getAllInterview,
  createInterview,
  updateInterview,
  getInterviewById,
  markAsPass,
  markAsFail,
  getInterviewByInterviewerId,
  cancelInterview,
};

module.exports = interviewController;
