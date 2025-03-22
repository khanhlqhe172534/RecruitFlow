import React, { useEffect, useState } from "react";
import { TextField, MenuItem, Typography } from "@mui/material";
import Modal from "react-bootstrap/Modal";
import ButtonBootstrap from "react-bootstrap/Button";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import styles

function CustomToolbar({ label, onNavigate, onView, onFetchInterviews }) {
  const [open, setOpen] = useState(false);
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewer: "",
    candidate: "",
    job: "",
    interview_date: "",
    meeting_link: "",
    note: "",
  });
  const [user, setUser] = useState({ email: "", id: "", role: "" });

  // Load user info from localStorage when the component mounts
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    // console.log(userEmail, userRole, userId);
    setUser({ email: userEmail, id: userId, role: userRole });
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setFormData({
      interviewer: "",
      candidate: "",
      job: "",
      interview_date: "",
      meeting_link: "",
      note: "",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [interviewersRes, candidatesRes, jobsRes] = await Promise.all([
          axios.get("http://localhost:9999/user/Interviewer"),
          axios.get("http://localhost:9999/candidate"),
          axios.get("http://localhost:9999/job/list"),
        ]);

        setInterviewers(interviewersRes.data);

        // Filter candidates with status 'activated'
        const activatedCandidates = candidatesRes.data.filter(
          (candidate) => candidate.status.name === "activated"
        );
        setCandidates(activatedCandidates);

        // Filter jobs with status 'open'
        const openJobs = jobsRes.data.jobs.filter(
          (job) => job.status.name === "open"
        );
        setJobs(openJobs);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchData();
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const interviewDate = new Date(formData.interview_date);
      const hours = interviewDate.getHours();
      const minutes = interviewDate.getMinutes();
      const now = new Date();

      // Validate if the interview date is in the past
      if (interviewDate < now) {
        toast.error("Interview date cannot be in the past.");
        return;
      }
      if (hours < 9 || (hours === 15 && minutes > 0) || hours > 15) {
        toast.error("Interview time must be between 9 AM and 3 PM.");
        return;
      }
      if (interviewDate.getDay() === 0 || interviewDate.getDay() === 6) {
        toast.error("Interview day must be Monday to Friday.");
        return;
      }
      // Call the API to create the interview
      const response = await axios.post(
        "http://localhost:9999/interview",
        formData
      );

      // On successful creation
      handleClose();
      onFetchInterviews();
      toast.success("Interview added successfully!");
    } catch (error) {
      console.error("Error adding interview:", error);

      // Check for specific error responses and show appropriate toast messages
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message;

        if (
          errorMessage ===
          "Interviewer already has an interview during this time."
        ) {
          toast.error("Interviewer is already booked for this time slot.");
        } else if (
          errorMessage ===
          "Candidate already has an interview scheduled within 2 hours of this time."
        ) {
          toast.error(
            "Candidate already has an interview within 2 hours of this time."
          );
        } else if (
          errorMessage === "Candidate already has an interview for this job."
        ) {
          toast.error(
            "Candidate already has an interview scheduled for this job."
          );
        } else if (errorMessage === "Interview date cannot be in the past.") {
          toast.error("Interview date cannot be in the past.");
        } else {
          toast.error("Failed to add interview. Please check the details.");
        }
      } else {
        // General error fallback
        toast.error("Failed to add interview.");
      }
    }
  };

  return (
    <div className="rbc-toolbar d-flex justify-content-between align-items-center">
      {/* Navigation Buttons */}
      <div>
        <button onClick={() => onNavigate("TODAY")} className="btn btn-primary">
          Today
        </button>
        <button
          onClick={() => onNavigate("PREV")}
          className="btn btn-secondary mx-2"
          style={{ color: "#EFEEF1" }}
        >
          Back
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="btn btn-secondary"
          style={{ color: "#EFEEF1" }}
        >
          Next
        </button>
      </div>

      <span className="rbc-toolbar-label">{label}</span>

      {/* View Buttons & Custom Button */}
      <div>
        <button
          onClick={() => onView("month")}
          className="btn btn-outline-info mx-1"
        >
          Month
        </button>
        <button
          onClick={() => onView("week")}
          className="btn btn-outline-info mx-1"
        >
          Week
        </button>
        <button
          onClick={() => onView("day")}
          className="btn btn-outline-info mx-1"
        >
          Day
        </button>
        {user.role === "Recruitment Manager" && (
          <button className="btn btn-primary mx-2" onClick={handleOpen}>
            Add New Interview +
          </button>
        )}

        {/* Modal */}
        <Modal show={open} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <Typography variant="h6" component="p">
                <strong>Add New Interview</strong>
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
                  {candidates
                    .filter(
                      (candidate) => candidate.status.name === "activated"
                    )
                    .map((candidate) => (
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

                <TextField
                  label="Note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <ButtonBootstrap variant="outline-secondary" onClick={handleClose}>
              Close
            </ButtonBootstrap>
            <ButtonBootstrap variant="primary" onClick={handleSubmit}>
              Save
            </ButtonBootstrap>
          </Modal.Footer>
        </Modal>

        {/* ToastContainer for notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}

export default CustomToolbar;
