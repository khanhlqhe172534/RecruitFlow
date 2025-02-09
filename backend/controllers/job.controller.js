const Job = require("../models/job.model");
const Status = require("../models/status.model");
const mongoose = require("mongoose");
const cron = require("node-cron");

// Get all jobs
async function getAllIJob(req, res, next) {
  
}

async function getJobList(req, res, next) {
 
}

// get job by role

async function getJobs(req, res, next) {
  
}

// Add new job
async function addJob(req, res, next) {
  
  
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
 
}


const jobController = {
  getAllIJob,
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
