const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");

router.get("/candidate-trend", statsController.getCandidateTrend);
router.get("/avg-hiring-time-trend", statsController.getAvgHiringTimeTrend);
router.get("/offer-status-trend", statsController.getOfferStatusTrend);
router.get("/candidate-status", statsController.getCandidateStatusStats);

router.get("/candidate-count", statsController.getCandidateCount); // API đếm ứng viên
router.get("/job-count", statsController.getJobCount); // API đếm job
router.get("/offer-acceptance-rate", statsController.getOfferAcceptanceRate); // API tính tỷ lệ chấp nhận offer

module.exports = router;
