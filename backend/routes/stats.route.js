const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");

router.get("/candidate-trend", statsController.getCandidateTrend);
router.get("/avg-hiring-time-trend", statsController.getAvgHiringTimeTrend);
router.get("/offer-status-trend", statsController.getOfferStatusTrend);
router.get("/candidate-status", statsController.getCandidateStatusStats);

module.exports = router;
