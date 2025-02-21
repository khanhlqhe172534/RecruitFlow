const Candidate = require("../models/candidate.model");

// Get all candidate
async function getAllCandidate(req, res, next) {
  try {
    const candidates = await Candidate.find({}).populate('status').populate('role').exec();
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
    const candidates = await Candidate.findById(candidateId).populate('status').populate('role').exec();
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
    const { fullname, email, phoneNumber, isMale, dob, address, cv_url, status, role } = req.body;
    const newCandidate = new Candidate({ fullname, email, phoneNumber, isMale, dob, address, cv_url, status, role });
    await newCandidate.save()
      .then(newDoc => {
        res.status(201).json(newDoc)
      })
  } catch (error) {
    next(error)
  }
}

// Update an existing candidate by ID
async function updateCandidate(req, res, next) {
  try {
    const { id } = req.params;
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate('status').populate('role');

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
};

module.exports = candidateController;
