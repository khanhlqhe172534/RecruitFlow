import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ButtonBootstrap from "react-bootstrap/Button";

import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  TextField,
  Divider,
  MenuItem,
} from "@mui/material";
import Modal from "react-bootstrap/Modal";
import axios from "axios";

import CheckIcon from "@mui/icons-material/Check";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";

import {
  AccessTime,
  Link,
  Person,
  Email,
  Phone,
  Description,
} from "@mui/icons-material";
import InterviewJob from "../components/InterviewJob";
import InterviewInformation from "../components/InterviewInformation";
import InterviewerInformation from "../components/InterviewerInformation";
import InterviewCandidate from "../components/InterviewCandidate";

function InterviewDetail() {
  const { id } = useParams(); // Get interview ID from URL
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interview, setInterview] = useState(null);
  const [openPass, setOpenPass] = useState(false);
  const [openFail, setOpenFail] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [passFeedback, setPassFeedback] = useState("");
  const [failFeedback, setFailFeedback] = useState("");
  const [openOffer, setOpenOffer] = useState(false); // Modal state for "Create New Offer"
  const [user, setUser] = useState({ email: "", id: "", role: "" }); // Define user state
  const [offerData, setOfferData] = useState({
    interview: id,
    offerType: "",
    offerFrom: "",
    offerTo: "",
    salary: "",
    createdBy: "", // Initialize createdBy as an empty string
  });

  // Load user info from localStorage when the component mounts
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    console.log(userEmail, userRole, userId);
    setUser({ email: userEmail, id: userId, role: userRole });
  }, []);

  // Update createdBy in offerData once user ID is set
  useEffect(() => {
    if (user.id) {
      setOfferData((prev) => ({
        ...prev,
        createdBy: user.id,
      }));
    }
  }, [user.id]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewer: "",
    candidate: "",
    job: "",
    interview_date: "",
    meeting_link: "",
    note: "",
  });
  // Load user info from localStorage when the component mounts
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    setUser({ email: userEmail, id: userId, role: userRole });
  }, []);
  // fetch data for modal update
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [interviewersRes, candidatesRes, jobsRes] = await Promise.all([
          axios.get("http://localhost:9999/user/Interviewer"),
          axios.get("http://localhost:9999/candidate"),
          axios.get("http://localhost:9999/job"),
        ]);
        setInterviewers(interviewersRes.data);
        setCandidates(candidatesRes.data);
        setJobs(jobsRes.data.jobs);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data."); // Use toast for error notification
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCloseUpdateModal = () => {
    setOpenUpdate(false);
  };
  const handleOpenPassModal = () => {
    setOpenPass(true);
  };

  const handleClosePassModal = () => {
    setOpenPass(false);
  };

  const handleOpenFailModal = () => {
    setOpenFail(true);
  };

  const handleCloseFailModal = () => {
    setOpenFail(false);
  };

  const handleOpenOffer = () => setOpenOffer(true);
  const handleCloseOffer = () => setOpenOffer(false);

  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(`http://localhost:9999/interview/${id}`);
      const data = await response.json();
      console.log(data);
      setInterview(data);
    } catch (error) {
      console.error("Error fetching interview:", error);
    }
  };
  // Fetch interview details from backend
  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:9999/interview/${id}`, formData);
      handleCloseUpdateModal();
      toast.success("Interview updated successfully!"); // Use toast for success notification
      // Fetch the updated interview details after the update
      await fetchInterviewDetails(); // Call the fetch function here
    } catch (error) {
      console.error("Error updating interview:", error);
      toast.error("Failed to update interview."); // Use toast for error notification
    }
  };

  if (!interview) return <p>Loading interview details...</p>;

  const { interviewer, candidate, job } = interview;

  // Handle data change for offer fields
  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new offer to the backend
  const handleSubmitOffer = async () => {
    const { offerType, offerFrom, offerTo, salary } = offerData;

    // Validate all fields are filled
    if (!offerType || !offerFrom || !offerTo || !salary) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Check if Start Date is before End Date
    if (new Date(offerFrom) >= new Date(offerTo)) {
      toast.error("Start Date must be before End Date.");
      return;
    }

    // Check if Salary is within the job's salary range
    if (salary < job.salary_min || salary > job.salary_max) {
      toast.error(
        `Salary must be between $${job.salary_min} and $${job.salary_max}.`
      );
      return;
    }

    try {
      await axios.post("http://localhost:9999/offer", offerData);
      setOpenOffer(false); // Close modal upon success
      toast.success("Offer created successfully!");
    } catch (error) {
      console.error("Error creating new offer:", error);
      toast.error("Failed to create offer.");
    }
  };

  const handleOpenUpdateModal = () => {
    if (interview) {
      // Format the date correctly
      const formattedDate = new Date(interview.interview_date)
        .toISOString()
        .slice(0, 16); // Format to YYYY-MM-DDTHH:mm

      setFormData({
        interviewer: interview.interviewer?._id || "", // Interviewer ID
        candidate: interview.candidate?._id || "", // Candidate ID
        job: interview.job?._id || "", // Job ID
        interview_date: formattedDate, // Correctly formatted interview date
        meeting_link: interview.meeting_link || "", // Meeting link
        note: interview.note || "", // Note
      });
      setOpenUpdate(true);
    } else {
      console.error("No interview data available.");
    }
  };

  const dobString = candidate.dob;
  const dob = new Date(dobString);
  const formattedDob = `${String(dob.getDate()).padStart(2, "0")}/${String(
    dob.getMonth() + 1
  ).padStart(2, "0")}/${dob.getFullYear()}`;

  // Submit pass feedback to the backend
  const handleSubmitPass = async () => {
    if (!passFeedback) {
      // Optionally set an error state or show a message to the user
      return;
    }
    try {
      await axios.put(`http://localhost:9999/interview/${id}/pass`, {
        feedback: passFeedback,
      });
      handleClosePassModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating interview status to pass:", error);
    }
  };

  // Submit fail feedback to the backend
  const handleSubmitFail = async () => {
    if (!failFeedback) {
      // Optionally set an error state or show a message to the user
      return;
    }
    try {
      await axios.put(
        `http://localhost:9999/interview/${id}/fail`, // Correct URL
        { feedback: failFeedback } // Send feedback as JSON object
      );
      handleCloseFailModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating interview status to fail:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="d-flex vh-100">
      <div className="container-fluid p-4 vh-100">
        <div className="row mb-3">
          <div className="col-9">
            {interview.result === "Pass" && (
              <h3 className="text-success">
                <CheckIcon style={{ fontSize: 64 }} /> Result: Pass
              </h3>
            )}
            {interview.result === "Fail" && (
              <h3 className="text-danger">
                <DoNotDisturbIcon style={{ fontSize: 64 }} /> Result: Fail
              </h3>
            )}
            {interview.result === "N/A" && (
              <h3 className="text-warning">
                <AccessTime style={{ fontSize: 64 }} /> Result: N/A
              </h3>
            )}
          </div>
          {/* Show "Create New Offer" Button if Result is "Pass" */}
          {interview.result === "Pass" &&
            user.role === "Interviewer" &&
            candidate.status === "67bc5a667ddc08921b739694" && // activated
            job.status === "67bc5a667ddc08921b739697" && ( // open
              <div className="col-3 ms-1">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenOffer}
                >
                  Create New Offer
                </button>

                {/* Offer Modal */}
                <Modal show={openOffer} onHide={handleCloseOffer} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Create New Offer</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <TextField
                      label="Offer Type"
                      name="offerType"
                      value={offerData.offerType}
                      onChange={handleOfferChange}
                      fullWidth
                      required
                      className="mb-3"
                    />
                    <TextField
                      type="datetime-local"
                      label="Offer From"
                      name="offerFrom"
                      value={offerData.offerFrom}
                      onChange={handleOfferChange}
                      fullWidth
                      required
                      className="mb-3"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      type="datetime-local"
                      label="Offer To"
                      name="offerTo"
                      value={offerData.offerTo}
                      onChange={handleOfferChange}
                      fullWidth
                      required
                      className="mb-3"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Salary"
                      name="salary"
                      type="number"
                      value={offerData.salary}
                      onChange={handleOfferChange}
                      fullWidth
                      required
                      className="mb-3"
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <ButtonBootstrap
                      variant="outline-secondary"
                      onClick={handleCloseOffer}
                    >
                      Cancel
                    </ButtonBootstrap>
                    <ButtonBootstrap
                      variant="primary"
                      onClick={handleSubmitOffer}
                    >
                      Save
                    </ButtonBootstrap>
                  </Modal.Footer>
                </Modal>
              </div>
            )}

          {/* Show "Mark as Pass" and "Mark as Fail" Buttons if Result is "N/A" and role = "Interviewer" */}
          {interview.result === "N/A" && user.role === "Interviewer" && (
            <div className="col-3 ms-1">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleOpenPassModal}
              >
                Mark as Pass
              </button>

              <Modal show={openPass} onHide={handleClosePassModal} centered>
                <Modal.Body>
                  <div className="text-center p-4">
                    <CheckIcon
                      className="text-success"
                      style={{ fontSize: 64 }}
                    />
                    <p className="h3 mt-3">Hang on a sec!</p>
                    <p>
                      You need to provide us some feedback before we close this
                    </p>

                    <TextField
                      error={passFeedback === ""}
                      id="outlined-multiline-flexible"
                      label="Feedback"
                      multiline
                      rows={8}
                      value={passFeedback}
                      className="mb-5 mt-3 w-100"
                      required
                      onChange={(event) => setPassFeedback(event.target.value)}
                    />

                    <div className="row mt-5">
                      <div className="col-6">
                        <button
                          className="btn btn-success w-100 rounded-4"
                          onClick={handleSubmitPass}
                          disabled={!passFeedback} // Disable if passFeedback is empty
                        >
                          Yes
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          className="btn btn-outline-success w-100 rounded-4"
                          onClick={handleClosePassModal}
                        >
                          Let Me Rethink
                        </button>
                      </div>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>

              <button
                type="button"
                className="btn btn-danger ms-3"
                onClick={handleOpenFailModal}
              >
                Mark as Fail
              </button>

              <Modal show={openFail} onHide={handleCloseFailModal} centered>
                <Modal.Body>
                  <div className="text-center p-4">
                    <DoNotDisturbIcon
                      className="text-danger"
                      style={{ fontSize: 64 }}
                    />
                    <p className="h3 mt-3">Hang on a sec!</p>
                    <p>
                      Confirm to mark this interview as Fail? <br />
                      Confirm your choice by clicking "Yes".
                      <br /> This action <strong>cannot be undone</strong>
                    </p>

                    <TextField
                      error={failFeedback === ""}
                      id="outlined-multiline-flexible"
                      label="Feedback"
                      multiline
                      rows={8}
                      value={failFeedback}
                      className="mb-5 mt-3 w-100"
                      required
                      onChange={(event) => setFailFeedback(event.target.value)}
                    />

                    <div className="row">
                      <div className="col-6">
                        <button
                          className="btn btn-danger w-100 rounded-4"
                          onClick={handleSubmitFail}
                          disabled={!failFeedback}
                        >
                          Yes
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          className="btn btn-outline-danger w-100 rounded-4"
                          onClick={handleCloseFailModal}
                        >
                          Let Me Rethink
                        </button>
                      </div>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          )}
          {/* Show "Update" Buttons if Result is "N/A" and role = "Recruiter" */}
          {interview.result === "N/A" && user.role === "Recruiter" && (
            <div className="col-3 ms-1">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleOpenUpdateModal}
              >
                Update Interview Information
              </button>
              <Modal show={openUpdate} onHide={handleCloseUpdateModal} centered>
                <Modal.Header closeButton>
                  <Modal.Title>
                    <Typography variant="h6" component="p">
                      <strong>Update Interview</strong>
                    </Typography>
                  </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                  {loading ? (
                    <Typography>Loading data...</Typography>
                  ) : (
                    <>
                      <TextField
                        select
                        label="Select Interviewer"
                        name="interviewer"
                        value={formData.interviewer}
                        onChange={handleChange}
                        fullWidth
                        required
                        className="mb-3"
                      >
                        {interviewers.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.fullname}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="Select Candidate"
                        name="candidate"
                        value={formData.candidate}
                        onChange={handleChange}
                        fullWidth
                        required
                        className="mb-3"
                      >
                        {candidates.map((candidate) => (
                          <MenuItem key={candidate._id} value={candidate._id}>
                            {candidate.fullname}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="Select Job"
                        name="job"
                        value={formData.job}
                        onChange={handleChange}
                        fullWidth
                        required
                        className="mb-3"
                      >
                        {jobs.map((job) => (
                          <MenuItem key={job._id} value={job._id}>
                            {job.job_name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        type="datetime-local"
                        label="Interview Date"
                        name="interview_date"
                        value={formData.interview_date}
                        onChange={handleChange}
                        fullWidth
                        required
                        className="mb-3"
                        InputLabelProps={{ shrink: true }}
                      />

                      <TextField
                        label="Meeting Link"
                        name="meeting_link"
                        value={formData.meeting_link}
                        onChange={handleChange}
                        fullWidth
                        className="mb-3"
                      />
                    </>
                  )}
                </Modal.Body>

                <Modal.Footer>
                  <ButtonBootstrap
                    variant="outline-secondary"
                    onClick={handleCloseUpdateModal}
                  >
                    Close
                  </ButtonBootstrap>
                  <ButtonBootstrap variant="primary" onClick={handleSubmit}>
                    Save
                  </ButtonBootstrap>
                </Modal.Footer>
              </Modal>
            </div>
          )}
        </div>

        <div className="row">
          {/* interview information */}
          <div className="col">
            <InterviewInformation interview={interview} />
          </div>
          {/* job information */}
          <div className="col">
            <InterviewJob job={job} />
          </div>
          <div className="col">
            {/* interviewer information */}
            <div className="row">
              <InterviewerInformation interviewer={interviewer} />
            </div>
            {/* Candidate Information */}
            <div className="row mt-3">
              <InterviewCandidate
                candidate={candidate}
                formattedDob={formattedDob}
              />
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </div>
  );
}

export default InterviewDetail;
