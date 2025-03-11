import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Modal from "react-bootstrap/Modal";
import ButtonBootstrap from "react-bootstrap/Button";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import "react-toastify/dist/ReactToastify.css";

function OfferDetail() {
  const navigate = useNavigate();
  const [openModalCancel, setOpenModalCancel] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModelAccept, setOpenModelAccept] = useState(false);
  const [openModelReject, setOpenModelReject] = useState(false);
  const [user, setUser] = useState({ email: "", id: "", role: "" });
  const [offer, setOffer] = useState(null);
  const { id } = useParams(); // Assuming ID comes from the URL

  // Load user info from localStorage when the component mounts
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || "";
    const userRole = localStorage.getItem("userRole") || "";
    const userId = localStorage.getItem("userId") || "no id";

    console.log(userEmail, userRole, userId);
    setUser({ email: userEmail, id: userId, role: userRole });
  }, []);

  // Fetch offer when ID is available
  useEffect(() => {
    if (!id) return; // Prevent fetching if ID is missing

    const fetchOffer = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/offer/${id}`);
        setOffer(response.data);
      } catch (error) {
        console.error("Error fetching offer:", error);
        toast.error("Failed to load offer details.");
      }
    };

    fetchOffer();
  }, [id, openModalCancel, openModalUpdate, openModelAccept, openModelReject]); // Only runs when ID changes

  // Cancel offer
  const handleOpenModalCancel = () => {
    setOpenModalCancel(true);
  };

  const handleCloseModalCancel = () => {
    setOpenModalCancel(false);
  };

  const handleCancelOffer = async () => {
    try {
      const response = await axios.put(
        `http://localhost:9999/offer/${id}/cancel`,
        {
          userId: user.id, // Gửi ID của người cancel
        }
      );

      // console.log("Offer canceled successfully:", response.data);
      toast.success("Offer canceled successfully");
      setOpenModalCancel(false); // Đóng modal
    } catch (error) {
      console.error("Error canceling offer:", error);
    }
  };
  // Update offer
  const handleOpenModalUpdate = () => {
    setOpenModalUpdate(true);
  };

  const handleCloseModalUpdate = () => {
    setOpenModalUpdate(false);
  };
  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOffer((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdateOffer = async () => {
    try {
      if (!user.id) {
        console.error("User ID is missing. Cannot update offer.");
        toast.error("User is not logged in. Please log in again.");
        return;
      }

      const updatedOffer = {
        ...offer,
        updatedBy: user.id, // Ensure user ID is valid
      };

      const response = await axios.put(
        `http://localhost:9999/offer/${id}`,
        updatedOffer
      );

      console.log("Offer updated successfully:", response.data);
      toast("Offer updated successfully");

      setTimeout(() => setOpenModalUpdate(false), 500); // Đóng modal sau 0.5s
    } catch (error) {
      console.error(
        "Error updating offer:",
        error.response?.data || error.message
      );
      toast.error("Failed to update offer. Please try again.");
    }
  };
  // Accept offer
  const handleOpenModelAccept = () => {
    setOpenModelAccept(true);
  };

  const handleCloseModelAccept = () => {
    setOpenModelAccept(false);
  };

  const handleAcceptOffer = async () => {
    try {
      const response = await axios.put(
        `http://localhost:9999/offer/${id}/accept`,
        {
          userId: user.id, // Gửi ID của người cancel
        }
      );

      // console.log("Offer canceled successfully:", response.data);
      toast.success("Offer accept successfully");
      setOpenModelAccept(false); // Đóng modal
    } catch (error) {
      console.error("Error canceling offer:", error);
    }
  };
  // Reject offer
  const handleOpenModelReject = () => {
    setOpenModelReject(true);
  };

  const handleCloseModelReject = () => {
    setOpenModelReject(false);
  };
  const handleRejectOffer = async () => {
    try {
      const response = await axios.put(
        `http://localhost:9999/offer/${id}/reject`,
        {
          userId: user.id, // Gửi ID của người cancel
        }
      );

      // console.log("Offer canceled successfully:", response.data);
      toast.success("Offer canceled successfully");
      setOpenModelReject(false); // Đóng modal
    } catch (error) {
      console.error("Error canceling offer:", error);
    }
  };
  if (!offer) return <p>Loading offer details...</p>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const job = offer.interview?.job;
  const candidate = offer.interview?.candidate;
  const interviewer = offer.interview?.interviewer;

  return (
    <div className="d-flex vh-100">
      <div className="container-fluid p-4 vh-100" style={{}}>
        <div className="row mb-3">
          <div className="col-9">
            <Typography variant="h5">
              Offer Details for {offer.offerType || `Offer/${id}`}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Contract for {candidate?.fullname || "N/A"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Status: {offer.status?.name || "Draft"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Salary: {offer.salary ? `$${offer.salary}` : "Not Available"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Created by: {offer.createdBy.fullname}
            </Typography>

            {offer.updatedBy && offer.updatedAt && (
              <Typography variant="subtitle2" color="textSecondary">
                Updated last time by: {offer.updatedBy.fullname} at{" "}
                {formatDate(offer.updatedAt)}
              </Typography>
            )}
          </div>
          <div className="col-1"></div>
          <div className="col-1">
            {offer.status?.name === "waiting for approved" &&
              user?.role === "Recruitment Manager" && (
                <button
                  className="btn btn-primary w-100"
                  onClick={handleOpenModalUpdate}
                >
                  Update
                </button>
              )}
            <Modal
              show={openModalUpdate}
              onHide={handleCloseModalUpdate}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Update Offer</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <TextField
                  select
                  label="Offer Type"
                  name="offerType"
                  value={offer.offerType}
                  onChange={handleOfferChange}
                  fullWidth
                  className="mb-3"
                >
                  <MenuItem value="Full-Time Employment">
                    Full-Time Employment
                  </MenuItem>
                  <MenuItem value="Part-Time Employment">
                    Part-Time Employment
                  </MenuItem>
                  <MenuItem value="Fixed-Term Contract">
                    Fixed-Term Contract
                  </MenuItem>
                  <MenuItem value="Freelance Contract">
                    Freelance Contract
                  </MenuItem>
                  <MenuItem value="Contract-to-Hire">Contract-to-Hire</MenuItem>
                  <MenuItem value="OutsourcingContract">
                    Outsourcing Contract
                  </MenuItem>
                  <MenuItem value="Retainer Agreement">
                    Retainer Agreement
                  </MenuItem>
                  <MenuItem value="Open-Source Contributor">
                    Open-Source Contributor
                  </MenuItem>
                </TextField>
                <TextField
                  type="datetime-local"
                  label="Offer From"
                  name="offerFrom"
                  value={offer.offerFrom}
                  onChange={handleOfferChange}
                  fullWidth
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="datetime-local"
                  label="Offer To"
                  name="offerTo"
                  value={offer.offerTo}
                  onChange={handleOfferChange}
                  fullWidth
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Salary"
                  name="salary"
                  type="number"
                  value={offer.salary}
                  onChange={handleOfferChange}
                  fullWidth
                  className="mb-3"
                />
              </Modal.Body>
              <Modal.Footer>
                <ButtonBootstrap
                  variant="outline-secondary"
                  onClick={handleCloseModalUpdate}
                >
                  Cancel
                </ButtonBootstrap>
                <ButtonBootstrap variant="primary" onClick={handleUpdateOffer}>
                  Save
                </ButtonBootstrap>
              </Modal.Footer>
            </Modal>
          </div>
          <div className="col-1">
            {offer.status?.name === "waiting for approved" &&
              user?.role === "Recuitment Manager" && (
                <button
                  className="btn btn-danger"
                  style={{ float: "right" }}
                  onClick={handleOpenModalCancel}
                >
                  Cancel
                </button>
              )}

            <Modal
              show={openModalCancel}
              onHide={handleCloseModalCancel}
              centered
            >
              <Modal.Body>
                <div className="text-center p-4">
                  <DoNotDisturbIcon
                    className="text-danger"
                    style={{ fontSize: 64 }}
                  />
                  <p className="h3 mt-3">Hang on a sec!</p>
                  <p>
                    Confirm to mark this offer as Cancel? <br />
                    Confirm your choice by clicking "Yes".
                    <br />
                    This action <strong>cannot be undone</strong>.
                  </p>

                  <div className="row">
                    <div className="col-6">
                      <button
                        className="btn btn-danger w-100 rounded-4"
                        onClick={handleCancelOffer}
                      >
                        Yes
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        className="btn btn-outline-danger w-100 rounded-4"
                        onClick={handleCloseModalCancel}
                      >
                        Let Me Rethink
                      </button>
                    </div>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>

        {/* Contract Time Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Contract Time
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Start Date
              </Typography>
              <Typography variant="body1" style={{ fontWeight: "bold" }}>
                {formatDate(offer.offerFrom)}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Expected End Date
              </Typography>
              <Typography variant="body1" style={{ fontWeight: "bold" }}>
                {offer.offerTo ? formatDate(offer.offerTo) : "Not Filled"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Interview Information Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Interview Information
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Date
              </Typography>
              <Typography variant="body1">
                {formatDate(offer.interview?.interview_date) || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Interviewer
              </Typography>
              <Typography variant="body1">
                {interviewer?.fullname || "N/A"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Job Information Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Job Information
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Job Name
              </Typography>
              <Typography variant="body1">{job?.job_name || "N/A"}</Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Level
              </Typography>
              <Typography variant="body1">{job?.levels || "N/A"}</Typography>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Experience
              </Typography>
              <Typography variant="body1">
                {job?.experience || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Working Type
              </Typography>
              <Typography variant="body1">
                {job?.working_type || "N/A"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Candidate Information Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Candidate Information
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography variant="body1">
                {candidate?.fullname || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">
                {candidate?.email || "N/A"}
              </Typography>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Phone
              </Typography>
              <Typography variant="body1">
                {candidate?.phoneNumber || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Address
              </Typography>
              <Typography variant="body1">
                {candidate?.address || "N/A"}
              </Typography>
            </div>
          </div>
        </Card>
        {offer.status?.name === "waiting for approved" &&
          user?.role === "Recruitment Manager" && (
            <div className="row">
              <div className="col-1">
                <button
                  className="btn btn-success w-100"
                  onClick={handleOpenModelAccept}
                >
                  Accept
                </button>
                <Modal
                  show={openModelAccept}
                  onHide={handleCloseModelAccept}
                  centered
                >
                  <Modal.Body>
                    <div className="text-center p-4">
                      <DoNotDisturbIcon
                        className="text-success"
                        style={{ fontSize: 64 }}
                      />
                      <p className="h3 mt-3">Hang on a sec!</p>
                      <p>
                        Confirm to Accept this offer? <br />
                        Confirm your choice by clicking "Yes".
                        <br />
                        This action <strong>cannot be undone</strong>.
                      </p>

                      <div className="row">
                        <div className="col-6">
                          <button
                            className="btn btn-success w-100 rounded-4"
                            onClick={handleAcceptOffer}
                          >
                            Yes
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            className="btn btn-outline-success w-100 rounded-4"
                            onClick={handleCloseModelAccept}
                          >
                            Let Me Rethink
                          </button>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
              <div className="col-1">
                <button
                  className="btn btn-danger w-100"
                  onClick={handleOpenModelReject}
                >
                  Reject
                </button>
                <Modal
                  show={openModelReject}
                  onHide={handleCloseModelReject}
                  centered
                >
                  <Modal.Body>
                    <div className="text-center p-4">
                      <DoNotDisturbIcon
                        className="text-danger"
                        style={{ fontSize: 64 }}
                      />
                      <p className="h3 mt-3">Hang on a sec!</p>
                      <p>
                        Confirm to REJECT this offer? <br />
                        Confirm your choice by clicking "Yes".
                        <br />
                        This action <strong>cannot be undone</strong>.
                      </p>

                      <div className="row">
                        <div className="col-6">
                          <button
                            className="btn btn-danger w-100 rounded-4"
                            onClick={handleRejectOffer}
                          >
                            Yes
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            className="btn btn-outline-danger w-100 rounded-4"
                            onClick={handleCloseModelReject}
                          >
                            Let Me Rethink
                          </button>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          )}
        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}

export default OfferDetail;
