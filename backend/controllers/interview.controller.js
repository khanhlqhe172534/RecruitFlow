const Interview = require("../models/interview.model");
const mongoose = require("mongoose");
// get all categories
async function getAllInterview(req, res, next) {
}

async function getInterviewByInterviewerId(req, res, next) {
  
}

async function createInterview(req, res, next) {
 
}

async function updateInterview(req, res, next) {
 
}

async function getInterviewById(req, res, next) {
  
}

async function markAsPass(req, res, next) {
 
}

async function markAsFail(req, res, next) {
  
}

const interviewController = {
  getAllInterview,
  createInterview,
  updateInterview,
  getInterviewById,
  markAsPass,
  markAsFail,
  getInterviewByInterviewerId,
};

module.exports = interviewController;
