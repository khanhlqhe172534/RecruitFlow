const { json } = require("body-parser");
const Offer = require("../models/offer.model");
const mongoose = require("mongoose");
const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");



// Get all offers with populated fields
async function getAllOffer(req, res, next) {
  
}

// Create new offer without `status`
async function createOffer(req, res, next) {
 
}

// Get an offer by ID
const getOfferById = async (req, res, next) => {
  
};


// Backend API to update offer status
const updateOfferStatus = async (req, res) => {
 
};




// Update an offer by ID
async function updateOfferById(req, res, next) {
 
}

// Delete an offer by ID
async function deleteOfferById(req, res, next) {
  
}

const offerController = {
  getAllOffer,
  createOffer,
  getOfferById,
  updateOfferById,
  deleteOfferById,
};

module.exports = offerController;
