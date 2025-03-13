const Job = require("../models/job.model");
const Status = require("../models/status.model");
const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Get all jobs
async function getAllJob(req, res, next) {}

async function getJobList(req, res, next) {
  try {
    const jobs = await Job.find().populate("createdBy").populate("status");
    res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
}

// get job by role

async function getJobs(req, res, next) {
  try {
    const {
      role,
      workingType,
      statusFilter,
      search,
      levelFilter,
      experienceFilter,
      page = 1,
      limit = 5,
    } = req.query;

    let filter = {};

    if (workingType) {
      filter.working_type = { $in: workingType.split(",") };
    }

    if (role === "Interviewer") {
      filter.status = {
        $in: ["67bc5a667ddc08921b739697", "67bc5a667ddc08921b739698"],
      };
      filter.salaryChecked = { $in: true };
      filter.benefitChecked = { $in: true };
    }

    if (statusFilter) {
      const statusMap = {
        opened: "67bc5a667ddc08921b739697",
        closed: "67bc5a667ddc08921b739698",
        waiting: "67bc5a667ddc08921b739695",
      };
      const statusIds = statusFilter
        .split(",")
        .map((status) => statusMap[status]);
      filter.status = { $in: statusIds };
    }

    if (search) {
      filter.job_name = { $regex: search, $options: "i" };
    }

    if (levelFilter) {
      filter.levels = { $in: levelFilter.split(",") };
    }

    if (experienceFilter) {
      const experienceValues = experienceFilter.split(",");
      const orConditions = [];

      experienceValues.forEach((value) => {
        if (value === "1year") {
          orConditions.push({
            experience: { $regex: /(?:\d+ months?)(?! years?)/i },
          });
        } else if (value === "13years") {
          orConditions.push({ experience: "1 year" });
          orConditions.push({ experience: "2 years" });
          orConditions.push({ experience: "3 years" });
        } else if (value === "3years") {
          orConditions.push({
            experience: { $regex: /^(?!1 year|2 years|3 years)\d+ years$/i },
          });
        }
      });

      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }
    }

    console.log("Filter:", filter);

    const jobs = await Job.find(filter)
      .populate("createdBy")
      .populate("status")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({ jobs, totalJobs });
  } catch (err) {
    next(err);
  }
}

// Add new job
async function addJob(req, res, next) {
  try {
    const waitingStatus = await Status.findById("67bc5a667ddc08921b739695");
    if (!waitingStatus) {
      return res
        .status(500)
        .json({ message: "Waiting for approved status not found" });
    }

    const {
      job_name,
      salary_max,
      salary_min,
      start_date,
      end_date,
      levels,
      skills,
      working_type,
      experience,
      number_of_vacancies,
      benefits,
      description,
      createdBy,
    } = req.body;

    const errors = {};

    const requiredFields = {
      job_name: "Job Title is required",
      salary_max: "Max Salary is required",
      salary_min: "Min Salary is required",
      start_date: "Start Date is required",
      end_date: "End Date is required",
      levels: "Level is required",
      skills: "At least one skill is required",
      working_type: "Working Type is required",
      experience: "Experience is required",
      number_of_vacancies: "Number of Vacancies is required",
      benefits: "At least one benefit is required",
    };

    Object.entries(requiredFields).forEach(([key, message]) => {
      if (
        !req.body[key] ||
        (Array.isArray(req.body[key]) && req.body[key].length === 0)
      ) {
        errors[key] = message;
      }
    });

    if (salary_min && salary_max && Number(salary_min) > Number(salary_max)) {
      errors.salary_max = "Max Salary should be greater than Min Salary";
    }

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      errors.end_date = "End Date should be after Start Date";
    }

    if (
      experience &&
      !/(\byear\b|\bmonth\b|\byears\b|\bmonths\b)/i.test(experience)
    ) {
      errors.experience = "Experience should include 'year' or 'month'";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start_date && new Date(start_date) < today) {
      errors.start_date = "Start Date should be today or later";
    }

    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      return res.status(400).json({ message: "Validation errors", errors });
    }

    const jobData = {
      job_name,
      salary_max,
      salary_min,
      start_date,
      end_date,
      levels,
      skills,
      working_type,
      experience,
      number_of_vacancies,
      benefits,
      description,
      createdBy,
      status: waitingStatus._id,
      benefitChecked: null,
      salaryChecked: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      fullAt: null,
    };

    const newJob = new Job(jobData);
    await newJob.save();

    const managers = await User.find({
      role: { $in: ["67b7d800a297fbf7bff8205a", "67b7d800a297fbf7bff8205b"] },
    }).select("email");

    const recipientEmails = managers.map((user) => user.email);

    if (recipientEmails.length > 0) {
      sendJobNotificationEmail(recipientEmails, newJob);
    }

    res.status(201).json({
      message: "Job created and set to 'waiting for approval'",
      job: newJob,
    });
  } catch (err) {
    console.error("Error in addJob:", err);
    next(err);
  }
}

async function sendJobNotificationEmail(recipients, job) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Job Management System"',
    to: recipients.join(","),
    subject: `New Job Approval Request: ${job.job_name}`,
    html: `
      <h2>New Job Approval Request</h2>
      <p>A new job has been created and is awaiting approval.</p>
      <h3>Job Details:</h3>
      <ul>
        <li><strong>Job Name:</strong> ${job.job_name}</li>
        <li><strong>Salary:</strong> ${job.salary_min} - ${job.salary_max}</li>
        <li><strong>Start Date:</strong> ${new Date(
          job.start_date
        ).toLocaleString()}</li>
        <li><strong>End Date:</strong> ${new Date(
          job.end_date
        ).toLocaleString()}</li>
        <li><strong>Level:</strong> ${job.levels}</li>
        <li><strong>Skills Required:</strong> ${job.skills.join(", ")}</li>
        <li><strong>Working Type:</strong> ${job.working_type}</li>
        <li><strong>Experience:</strong> ${job.experience}</li>
        <li><strong>Number of Vacancies:</strong> ${
          job.number_of_vacancies
        }</li>
        <li><strong>Benefits:</strong> ${job.benefits.join(", ")}</li>
      </ul>
      <p>Please review and approve this job.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Job notification email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Update a job
async function updateJob(req, res, next) {
  const { jobId } = req.params;
  const {
    job_name,
    salary_min,
    salary_max,
    start_date,
    end_date,
    levels,
    skills,
    working_type,
    experience,
    number_of_vacancies,
    benefits,
    description,
    createdBy,
  } = req.body;

  const errors = {};

  const requiredFields = {
    job_name: "Job Title is required",
    salary_max: "Max Salary is required",
    salary_min: "Min Salary is required",
    start_date: "Start Date is required",
    end_date: "End Date is required",
    levels: "Level is required",
    skills: "At least one skill is required",
    working_type: "Working Type is required",
    experience: "Experience is required",
    number_of_vacancies: "Number of Vacancies is required",
    benefits: "At least one benefit is required",
  };

  Object.entries(requiredFields).forEach(([key, message]) => {
    if (
      !req.body[key] ||
      (Array.isArray(req.body[key]) && req.body[key].length === 0)
    ) {
      errors[key] = message;
    }
  });

  if (salary_min && salary_max && Number(salary_min) > Number(salary_max)) {
    errors.salary_max = "Max Salary should be greater than Min Salary";
  }

  if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
    errors.end_date = "End Date should be after Start Date";
  }

  if (
    experience &&
    !/(\byear\b|\bmonth\b|\byears\b|\bmonths\b)/i.test(experience)
  ) {
    errors.experience = "Experience should include 'year' or 'month'";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start_date && new Date(start_date) < today) {
    errors.start_date = "Start Date should be today or later";
  }

  if (Object.keys(errors).length > 0) {
    console.log("Validation errors:", errors);
    return res.status(400).json({ message: "Validation errors", errors });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const waitingStatus = await Status.findById("67bc5a667ddc08921b739695");
    if (!waitingStatus)
      return res.status(500).json({ message: "Status not found" });

    if (
      job.status.toString() !== waitingStatus._id.toString() &&
      job.salaryChecked !== null &&
      job.benefitChecked !== null
    ) {
      return res.status(403).json({
        message:
          "Job can only be updated when status is 'waiting for approval' and benefit/salary check is not done",
      });
    }

    if (
      !job_name ||
      !salary_min ||
      !salary_max ||
      !start_date ||
      !end_date ||
      !levels ||
      !skills ||
      !working_type ||
      !experience ||
      !number_of_vacancies
      // !description ||
      // !createdBy
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const updatedJob = job.set({
      job_name,
      salary_min,
      salary_max,
      start_date,
      end_date,
      levels,
      skills,
      working_type,
      experience,
      number_of_vacancies,
      benefits,
      description,
      createdBy,
      updatedAt: new Date(),
      fullAt,
    });

    await job.save();

    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    next(err);
  }
}

// Delete job
async function deleteJob(req, res, next) {}

// Get job by ID
async function getJobById(req, res, next) {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId)
      .populate("createdBy")
      .populate("status");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
}

// Update benefit check status
async function updateBenefitCheck(req, res, next) {
  try {
    const { jobId } = req.params;
    const { benefitChecked, feedback } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.benefitChecked = benefitChecked;
    job.feedback = feedback || job.feedback;

    await updateJobStatus(job);

    res.status(200).json({ message: "Benefit check updated", job });
  } catch (error) {
    next(error);
  }
}
// Update salary check status
async function updateSalaryCheck(req, res, next) {
  try {
    const { jobId } = req.params;
    const { salaryChecked, feedback } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.salaryChecked = salaryChecked;
    job.feedback = feedback || job.feedback;

    await updateJobStatus(job);

    res.status(200).json({ message: "Salary check updated", job });
  } catch (error) {
    next(error);
  }
}

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Update job status when benefit or salary check is updated
const updateJobStatus = async (job) => {
  try {
    if (!job || !job._id) {
      throw new Error("Invalid job document");
    }

    const closedStatus = await Status.findOne({ name: "closed" });
    const openStatus = await Status.findOne({ name: "open" });

    let previousStatus = job.status;

    if (job.benefitChecked === false || job.salaryChecked === false) {
      job.status = closedStatus._id;
    } else if (job.benefitChecked === true && job.salaryChecked === true) {
      job.status = openStatus._id;
    }

    await job.save();

    if (previousStatus.toString() !== job.status.toString()) {
      const jobCreator = await User.findById(job.createdBy);
      if (jobCreator && jobCreator.email) {
        const subject = `Job Status Update: ${job.job_name}`;
        const text =
          job.status.toString() === openStatus._id.toString()
            ? `Your job "${job.job_name}" has been approved and is now Open.`
            : `Your job "${job.job_name}" has been Rejected. Please check the feedback.`;

        await sendEmail(jobCreator.email, subject, text);
      }
    }
  } catch (error) {
    console.error("Error updating job status:", error);
    throw error;
  }
};

// Close job
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function closeJob(req, res, next) {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId).populate("status");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const closedStatus = await Status.findOne({ name: "closed" });
    if (!closedStatus)
      return res.status(400).json({ message: "Closed status not found" });

    job.status = closedStatus._id;
    await job.save();

    res.status(200).json({ message: "Job closed successfully. Emails will be sent in the background.", job });

    sendJobClosureEmails(job);

  } catch (error) {
    console.error("Error closing job:", error);
    res.status(400).json({ message: "Failed to close job", error });
  }
}

// Function to send emails asynchronously
async function sendJobClosureEmails(job) {
  try {
    const targetRoles = [
      "67b7d800a297fbf7bff8205b", // Benefit Manager
      "67b7d800a297fbf7bff8205a", // Payroll Manager
      "67b7d800a297fbf7bff82059", // Admin
      "67b7d800a297fbf7bff8205d", // Interviewer
    ];

    const usersToNotify = await User.find({ role: { $in: targetRoles } }, "fullname email");

    if (usersToNotify.length === 0) {
      console.log("No users found with the specified roles.");
      return;
    }

    for (const user of usersToNotify) {
      if (!user.email) {
        console.warn(`Skipping user ${user.fullname} due to missing email.`);
        continue;
      }

      const emailContent = {
        from: { name: "HR Team", address: process.env.EMAIL_USER },
        to: user.email,
        subject: `Job Closed - ${job.job_name}`,
        html: `<h2>Job Closure Notification</h2>
          <p>Hello <strong>${user.fullname}</strong>,</p>
          <p>The job <strong>${job.job_name}</strong> has been officially closed.</p>
          <p><strong>Job Details:</strong></p>
          <ul>
            <li><strong>Title:</strong> ${job.job_name}</li>
            <li><strong>Closed On:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Please take any necessary actions.</p>
          <p>Best regards,<br>HR Team</p>`,
      };

      transporter.sendMail(emailContent)
        .then(info => console.log(`Email sent to ${user.email} (MessageId: ${info.messageId})`))
        .catch(err => console.error(`Failed to send email to ${user.email}:`, err));
    }

  } catch (error) {
    console.error("Error sending job closure emails:", error);
  }
}

const exportJobs = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    let errors = {};

    if (!startDate && !endDate) {
      startDate = new Date(0).toISOString().split("T")[0];
      endDate = new Date().toISOString().split("T")[0];
    }

    if (!startDate) {
      errors.startDate = "Start date is required.";
    } else if (isNaN(new Date(startDate).getTime())) {
      errors.startDate = "Invalid start date format.";
    }

    if (!endDate) {
      endDate = new Date().toISOString().split("T")[0]; 
    } else if (isNaN(new Date(endDate).getTime())) {
      errors.endDate = "Invalid end date format.";
    }

    if (new Date(startDate) > new Date(endDate)) {
      errors.endDate = "End date should be after start date.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const jobs = await Job.find({
      updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate("createdBy")
      .populate("status");

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found in the selected date range." });
    }

    const exportDir = path.join(__dirname, "../exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Job List");

    worksheet.columns = [
      { header: "Job Name", key: "job_name", width: 25 },
      { header: "Salary Range", key: "salaryRange", width: 20 },
      { header: "Start Date", key: "start_date", width: 15 },
      { header: "End Date", key: "end_date", width: 15 },
      { header: "Level", key: "levels", width: 10 },
      { header: "Skills", key: "skills", width: 30 },
      { header: "Working Type", key: "working_type", width: 15 },
      { header: "Experience", key: "experience", width: 15 },
      { header: "Vacancies", key: "number_of_vacancies", width: 10 },
      { header: "Benefits", key: "benefits", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Status", key: "status", width: 10 },
      { header: "Created At", key: "createdAt", width: 15 },
      { header: "Updated At", key: "updatedAt", width: 15 },
    ];

    jobs.forEach((job) => {
      worksheet.addRow({
        job_name: job.job_name,
        salaryRange: `${job.salary_min} - ${job.salary_max}`,
        start_date: job.start_date.toISOString().split("T")[0],
        end_date: job.end_date.toISOString().split("T")[0],
        levels: job.levels,
        skills: job.skills.join(", "),
        working_type: job.working_type,
        experience: job.experience,
        number_of_vacancies: job.number_of_vacancies,
        benefits: job.benefits.join(", "),
        description: job.description,
        status: job.status.name,
        createdAt: job.createdAt.toISOString().split("T")[0] || "",
        updatedAt: job.updatedAt.toISOString().split("T")[0] || "",
      });
    });

    const filePath = path.join(exportDir, `Job_List_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, "Job_List.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
      }
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error exporting jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const jobController = {
  getAllJob,
  getJobs,
  addJob,
  updateBenefitCheck,
  updateSalaryCheck,
  updateJobStatus,
  closeJob,
  updateJob,
  deleteJob,
  getJobById,
  getJobList,
  exportJobs,
};

module.exports = jobController;
