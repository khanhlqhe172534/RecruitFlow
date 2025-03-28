const ChangeRequest = require("../models/changeRequest.model");
const User = require("../models/user.model");
const Candidate = require("../models/candidate.model");
const { sendNotification } = require("../server");

// Employee submits a change request
const submitChangeRequest = async (req, res) => {
  try {
    const { userId, requestedChanges } = req.body;

    const existingRequest = await ChangeRequest.findOne({
      user: userId,
      status: "Pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending request." });
    }
    const user = await User.findById(userId);
    console.log(user);

    let userType = "User";
    if (!user) {
      userType = "Candidate";
    }
    const newRequest = new ChangeRequest({
      user: userId,
      userType: userType,
      requestedChanges,
    });
    // sendNotification(
    //   { role: "ADMIN" },
    //   {
    //     resourceId: "RESOURCE_ID",
    //     notifType: "communityNewPost",
    //     title: "New Post in Your Community",
    //     description: "Someone posted in your community.",
    //   }
    // );
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin reviews and updates request status
const approveOrRejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminResponse } = req.body;
    console.log(status);

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const request = await ChangeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.status = status;
    request.adminResponse = adminResponse || "";
    if (status === "Approved") {
      // Apply the changes to the user's profile
      if (request.userType == "User") {
        await User.findByIdAndUpdate(request.user, request.requestedChanges);
      } else {
        await Candidate.findByIdAndUpdate(
          request.user,
          request.requestedChanges
        );
      }
    }

    await request.save();
    res.json({ message: `Request ${status.toLowerCase()} successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin gets all pending requests
const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await ChangeRequest.find({
      status: "Pending",
    }).populate("user", "fullname email");
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find requests made by this user
    const userRequests = await ChangeRequest.find({ user: userId });

    if (!userRequests.length) {
      return res.status(200).json([]);
    }

    res.json(userRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const deleteUserRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find and delete the request
    const deletedRequest = await ChangeRequest.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found." });
    }

    res.status(200).json({ message: "Request deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const changeRequestController = {
  submitChangeRequest,
  approveOrRejectRequest,
  getPendingRequests,
  getUserRequests,
  deleteUserRequest,
};

module.exports = changeRequestController;
