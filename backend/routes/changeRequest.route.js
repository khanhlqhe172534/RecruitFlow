const express = require("express");
const {
  submitChangeRequest,
  approveOrRejectRequest,
  getPendingRequests,
  getUserRequests,
  deleteUserRequest,
} = require("../controllers/changeRequest.controller");

const changeRequestRouter = express.Router();

// Employee submits a change request
changeRequestRouter.post("/request-change", submitChangeRequest);

// Admin approves/rejects a request
changeRequestRouter.put("/approve-request/:requestId", approveOrRejectRequest);

// Admin gets all pending requests
changeRequestRouter.get("/pending-requests", getPendingRequests);

changeRequestRouter.get("/user/:userId", getUserRequests);
changeRequestRouter.delete("/:requestId", deleteUserRequest);

module.exports = changeRequestRouter;
