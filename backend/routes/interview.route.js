const bodyParser = require("body-parser");
const express = require("express");
const { interviewController } = require("../controllers");

const interviewRouter = express.Router();
interviewRouter.use(bodyParser.json());

interviewRouter.get("/", interviewController.getAllInterview);
interviewRouter.get("/:id", interviewController.getInterviewById);
interviewRouter.get(
  "/interviewer/:interviewrId",
  interviewController.getInterviewByInterviewerId
);
interviewRouter.post("/", interviewController.createInterview);
interviewRouter.put("/:id", interviewController.updateInterview);
interviewRouter.put("/:id/pass", interviewController.markAsPass);
interviewRouter.put("/:id/fail", interviewController.markAsFail);
interviewRouter.put("/:id/cancel", interviewController.cancelInterview);

module.exports = interviewRouter;
