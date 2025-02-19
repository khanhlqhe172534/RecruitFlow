const Job = require("../models/job.model");
const Status = require("../models/status.model");
const mongoose = require("mongoose");
const cron = require("node-cron");

// Get all jobs
async function getAllJob(req, res, next) {
  
}

async function getJobList(req, res, next) {
 
}

// get job by role

async function getJobs(req, res, next) {
  try {
    const { workingType, search, page = 1, limit = 5 } = req.query;

    let filter = {};

    if (workingType) {
      filter.working_type = workingType;
    }

    if (search) {
      filter.job_name = { $regex: search, $options: "i" };
    }

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

    const waitingStatus = await Status.findById("671c7ab3265bb9e80b7d4726");
    if (!waitingStatus) {
      return res.status(500).json({ message: "Waiting for approved status not found" });
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

    // Kiểm tra trường bắt buộc
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
      if (!req.body[key] || (Array.isArray(req.body[key]) && req.body[key].length === 0)) {
        errors[key] = message;
      }
    });

    // Kiểm tra điều kiện hợp lệ của dữ liệu
    if (salary_min && salary_max && Number(salary_min) > Number(salary_max)) {
      errors.salary_max = "Max Salary should be greater than Min Salary";
    }

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      errors.end_date = "End Date should be after Start Date";
    }

    if (experience && !/(\byear\b|\bmonth\b|\byears\b|\bmonths\b)/i.test(experience)) {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newJob = new Job(jobData);
    await newJob.save();

    res.status(201).json({
      message: "Job created and set to 'waiting for approval'",
      job: newJob,
    });
  } catch (err) {
    console.error("Error in addJob:", err);
    next(err);
  }
}


async function openJob(req, res, next) {

}
// Close job
async function closeJob(req, res, next) {
 
}

// Update a job
async function updateJob(req, res, next) {
  
  
}

// Delete job
async function deleteJob(req, res, next) {
  
}

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


const jobController = {
  getAllJob,
  getJobs,
  addJob,
  openJob,
  closeJob,
  updateJob,
  deleteJob,
  getJobById,
  getJobList,
};

module.exports = jobController;
