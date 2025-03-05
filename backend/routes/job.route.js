const bodyParser = require("body-parser");
const express = require("express");
const { jobController } = require("../controllers");

const jobRouter = express.Router();
jobRouter.use(bodyParser.json());

jobRouter.get("/", jobController.getJobs);
jobRouter.get("/list/", jobController.getJobList);
jobRouter.post("/", jobController.addJob);
jobRouter.get("/:jobId", jobController.getJobById);
jobRouter.put("/:jobId", jobController.updateJob);
jobRouter.put("/:jobId/benefit-check", jobController.updateBenefitCheck);
jobRouter.put("/:jobId/salary-check", jobController.updateSalaryCheck);
jobRouter.put("/:jobId/close", jobController.closeJob);
module.exports = jobRouter;
