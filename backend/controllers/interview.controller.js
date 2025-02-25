const Interview = require("../models/interview.model");
const mongoose = require("mongoose");
// get all categories
async function getAllInterview(req, res, next) {
  try {
    const interviews = await Interview.find()
      .populate("interviewer")
      .populate("candidate")
      .populate("job")
      .populate("status");
    if (!interviews) {
      return res.status(404).json({ message: "interviews not found" });
    }
    res.status(200).json(interviews);
  } catch (err) {
    next(err);
  }
}

async function getInterviewByInterviewerId(req, res, next) {
  try {
    const { interviewrId } = req.params;

    // Chuyển đổi id thành ObjectId để đảm bảo kiểu dữ liệu khớp
    const objectId = new mongoose.Types.ObjectId(interviewrId);

    const interviews = await Interview.find({ interviewer: objectId })
      .populate("interviewer")
      .populate("candidate")
      .populate("job")
      .populate("status");

    if (!interviews || interviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No interviews found for this interviewer" });
    }

    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    next(error); // Pass error to Express error handler
  }
}

async function createInterview(req, res, next) {
  try {
    const { interviewer, candidate, job, interview_date, meeting_link, note } =
      req.body;

    // // Validate required fields
    // if (!interviewer || !candidate || !job || !interview_date) {
    //   return res.status(400).json({ message: "All fields are required." });
    // }

    // Create a new interview document
    const interview = new Interview({
      interviewer,
      candidate,
      job,
      interview_date,
      meeting_link,
      result: "N/A",
      note,
      status: "67bc5a667ddc08921b739697", // open
    });

    await interview.save();

    res.status(201).json(interview);
  } catch (err) {
    next(err);
  }
}

async function updateInterview(req, res, next) {
  try {
    const { id } = req.params;
    const {
      interviewer,
      candidate,
      job,
      interview_date,
      meeting_link,
      result,
      note,
    } = req.body;

    // Validate required fields
    if (!interviewer || !candidate || !job || !interview_date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Update the interview document
    const interview = await Interview.findByIdAndUpdate(
      id,
      {
        interviewer,
        candidate,
        job,
        interview_date,
        meeting_link,
        result,
        note,
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: "interview not found" });
    }

    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

async function getInterviewById(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id)
      .populate("interviewer")
      .populate("candidate")
      .populate("job")
      .populate("status");
    if (!interview) {
      return res.status(404).json({ message: "interview not found" });
    }
    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

async function markAsPass(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Append "Pass feedback" to existing note, if any
    interview.result = "Pass";
    interview.status = "67bc5a667ddc08921b739699"; // "done"
    interview.note = feedback;

    await interview.save();

    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
}

async function markAsFail(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Append "Fail feedback" to existing note, if any
    interview.result = "Fail";
    interview.status = "67bc5a667ddc08921b739699"; //"done"
    interview.note = feedback;

    await interview.save();

    res.status(200).json(interview);
  } catch (err) {
    next(err);
  }
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
