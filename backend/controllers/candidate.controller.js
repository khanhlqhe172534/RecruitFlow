const Candidate = require("../models/candidate.model");
const nodemailer = require("nodemailer");
const multer = require("multer");
const xlsx = require("xlsx");
const mongoose = require("mongoose");

// Cấu hình multer để upload file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API xử lý import ứng viên từ file Excel
async function importCandidates(req, res, next) {
  const session = await mongoose.startSession(); // Bắt đầu session cho transaction

  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Kiểm tra kiểu file
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      errorMessages.push(
        "Invalid file type. Only .xlsx or .xls files are allowed."
      );
      return res.status(400).json({
        message: "Invalid file type. Only .xlsx or .xls files are allowed."
      });
    }

    console.log("File uploaded:", file.originalname);
    // Đọc file Excel
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    console.log("Sheets in file:", workbook.SheetNames);
    const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
    const sheet = workbook.Sheets[sheetName];

    console.log("Sheet name:", sheetName);
    // Chuyển đổi sheet thành JSON
    const candidatesData = xlsx.utils.sheet_to_json(sheet);

    // Lặp qua từng ứng viên và thêm vào cơ sở dữ liệu
    const addedCandidates = [];
    const errorMessages = [];

     // Bắt đầu transaction
     session.startTransaction();

    for (const candidate of candidatesData) {
      // Kiểm tra trùng email và số điện thoại cùng lúc
      const existingCandidateEmail = await Candidate.findOne({
        email: candidate["Email"]
      }).session(session);
      const existingCandidatePhone = await Candidate.findOne({
        phoneNumber: candidate["Phone Number"]
      }).session(session);

      // Báo lỗi nếu trùng email
      if (existingCandidateEmail) {
        errorMessages.push(`Email "${candidate["Email"]}" already exists.`);
      }

      // Báo lỗi nếu trùng số điện thoại
      if (existingCandidatePhone) {
        errorMessages.push(
          `Phone number "${candidate["Phone Number"]}" already exists.`
        );
      }

      // Nếu có lỗi, tiếp tục với ứng viên tiếp theo
      if (existingCandidateEmail || existingCandidatePhone) {
        continue;
      }

      // Validate skills - kiểm tra kỹ năng
      const skills = candidate["Skills"]
        ? candidate["Skills"].split(",").map((skill) => skill.trim()) // Chuyển thành mảng kỹ năng
        : [];

      // Nếu kỹ năng không phải là mảng chuỗi, báo lỗi
      if (
        !Array.isArray(skills) ||
        skills.some((skill) => typeof skill !== "string")
      ) {
        errorMessages.push(
          `Invalid skills for candidate "${candidate["Full Name"]}"`
        );
        continue; // Bỏ qua ứng viên này
      }

      const password = generateRandomPassword();

      const newCandidate = new Candidate({
        fullname: candidate["Full Name"],
        email: candidate["Email"],
        password,
        phoneNumber: candidate["Phone Number"],
        isMale: candidate["Gender"].toLowerCase() === "male",
        dob: new Date(candidate["Date of Birth"]),
        address: candidate["Address"],
        cv_url: candidate["CV URL"],
        skills,
        status: "67bc5a667ddc08921b739694", // default status = activated
        role: "67bc59b77ddc08921b73968f" // default role = candidate
      });

      const newCandidateForEmail = new Candidate({
        fullname: candidate["Full Name"],
        email: candidate["Email"],
        password,
        phoneNumber: candidate["Phone Number"],
        isMale: candidate["Gender"].toLowerCase() === "male",
        dob: new Date(candidate["Date of Birth"]),
        address: candidate["Address"],
        cv_url: candidate["CV URL"],
        skills,
        status: "67bc5a667ddc08921b739694", // default status = activated
        role: "67bc59b77ddc08921b73968f" // default role = candidate
      });

      addedCandidates.push(newCandidateForEmail);

      await newCandidate.save({ session });
    }

    if (errorMessages.length > 0) {
      // Nếu có lỗi, rollback transaction
      await session.abortTransaction();
      session.endSession();
      console.log("Import failed", errorMessages);
      return res
        .status(400)
        .json({ message: "Import failed", errors: errorMessages });
    }

    // Commit transaction nếu không có lỗi
    await session.commitTransaction();
    session.endSession();

    // Trả về phản hồi trước khi gửi email
    res.status(201).json({
      message: "Candidates imported successfully",
      data: addedCandidates
    });

    // Gửi email sau khi phản hồi đã được gửi
    for (const candidate of addedCandidates) {
      await sendCandidateNotificationEmail(candidate, candidate.password);
    }

    console.log("Emails sent to all candidates");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

// Hàm generate password
const generateRandomPassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};

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
  console.log("Creating new candidate");
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
      role,
      skills
    } = req.body;

    // Generate a random password
    const generateRandomPassword = (length = 8) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      let password = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
      }
      return password;
    };

    const password = generateRandomPassword();

    const newCandidate = new Candidate({
      fullname,
      email,
      password,
      phoneNumber,
      isMale,
      dob,
      address,
      cv_url,
      status,
      role,
      skills
    });

    await newCandidate.save().then(async (newDoc) => {
      // Send email notification
      console.log("Candidate created successfully", newDoc);
      await sendCandidateNotificationEmail(newDoc, password);
      res.status(201).json(newDoc);
    });
  } catch (error) {
    next(error);
  }
}

async function sendCandidateNotificationEmail(candidate, password) {
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
          <p>Your account details:</p>
          <ul>
            <li>Email: ${candidate.email}</li>
            <li>Password: ${password}</li>
          </ul>
          <p>Please keep your password secure.</p>
          <p>You can log in to our system to update your profile, view job listings, and apply for jobs.</p>
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
  updateCandidate,
  importCandidates
};

module.exports = candidateController;
