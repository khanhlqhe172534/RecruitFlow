const Candidate = require("../models/candidate.model");
const nodemailer = require("nodemailer");

// Get all candidate
async function getAllCandidate(req, res, next) {
  try {
    const candidates = await Candidate.find({})
      .populate("status")
      .populate("role")
      .exec();
    if (candidates) {
      res.status(200).json(candidates);
    }
  } catch (err) {
    next(err);
  }
}

// Get one candidate
async function getOneCandidate(req, res, next) {
  try {
    const candidateId = req.params.id;
    const candidates = await Candidate.findById(candidateId)
      .populate("status")
      .populate("role")
      .exec();
    if (candidates) {
      res.status(200).json(candidates);
    }
  } catch (err) {
    next(err);
  }
}
// Create new candidate
async function createCandidate(req, res, next) {
  try {
    const {
      fullname,
      email,
      phoneNumber,
      isMale,
      dob,
      address,
      cv_url,
      status,
      role
    } = req.body;
    const newCandidate = new Candidate({
      fullname,
      email,
      phoneNumber,
      isMale,
      dob,
      address,
      cv_url,
      status,
      role
    });
    await newCandidate.save().then(async (newDoc) => {
      // Send email notification
      await sendCandidateNotificationEmail(newDoc);
      res.status(201).json(newDoc);
    });
  } catch (error) {
    next(error);
  }
}

async function sendCandidateNotificationEmail(candidate) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailContent = {
    from: {
      name: "HR RecruitFlow Team",
      address: process.env.EMAIL_USER
    },
    to: candidate.email,
    subject: "Welcome to Our Recruitment System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>RecruitFlow System</h2>
        <p>Dear ${candidate.fullname || "Candidate"},</p>
  
        <div style="background-color: #e6f3e6; padding: 20px; border-radius: 10px; border: 1px solid #4CAF50;">
          <h3 style="color: #4CAF50;">Welcome to Our System! 🎉</h3>
          <p>You have been successfully added to recruitment system as a Candidate.</p>
          <p>To help us find the best match for you, please send your CV to our HR team as soon as possible. This will allow us to review your profile and suggest suitable positions for you.</p>
        </div>
  
        <p>If you have any questions, feel free to reach out to us.</p>
  
        <p>Best regards,<br>HR RecruitFlow Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(emailContent);
    console.log(
      `Notification email sent to ${candidate.email}. MessageId: ${info.messageId}`
    );
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
}

// Update an existing candidate by ID
async function updateCandidate(req, res, next) {
  try {
    const { id } = req.params;
    const updatedCandidate = await Candidate.findByIdAndUpdate(id, req.body, {
      new: true
    })
      .populate("status")
      .populate("role");

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(updatedCandidate);
  } catch (err) {
    next(err);
  }
}
const candidateController = {
  getAllCandidate,
  getOneCandidate,
  createCandidate,
  updateCandidate
};

module.exports = candidateController;
