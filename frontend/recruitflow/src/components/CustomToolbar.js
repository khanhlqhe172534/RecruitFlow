import React, { useEffect, useState } from "react";
import { TextField, MenuItem, Typography } from "@mui/material";
import Modal from "react-bootstrap/Modal";
import ButtonBootstrap from "react-bootstrap/Button";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CustomToolbar({ label, onNavigate, onView, onFetchInterviews }) {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [filteredCandidates, setFilteredCandidates] = useState([]); // Danh sách candidates lọc theo job
  const [filteredCandidatesAdd, setFilteredCandidatesAdd] = useState([]); // Danh sách candidates lọc theo job

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewer: "",
    candidate: "",
    job: "",
    interview_date: "",
    meeting_link: "",
    note: "",
  });
  const [formDataAdd, setFormDataAdd] = useState({
    interviewer: "",
    candidate: "",
    job: "",
    interview_date: "",
    meeting_link: "",
    note: "",
  });
  const [user, setUser] = useState({ email: "", id: "", role: "" });

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    setUser({ email: userEmail, id: userId, role: userRole });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleOpenAdd = () => setOpenAdd(true);

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
    setFilteredCandidates([]); // Reset danh sách ứng viên khi đóng modal
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setFormDataAdd({
      interviewer: "",
      candidate: "",
      job: "",
      interview_date: "",
      meeting_link: "",
      note: "",
    });
    setFilteredCandidatesAdd([]); // Reset danh sách ứng viên khi đóng modal
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

        const activatedCandidates = candidatesRes.data.filter(
          (candidate) => candidate.status.name === "activated"
        );
        setCandidates(activatedCandidates);

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

    if (open || openAdd) fetchData();
  }, [open, openAdd]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "job") {
      const selectedJob = jobs.find((job) => job._id === value);
      if (selectedJob) {
        const jobSkills = selectedJob.skills || [];

        // Chỉ lấy ứng viên có đủ tất cả kỹ năng yêu cầu của công việc
        const matchedCandidates = candidates.filter((candidate) =>
          jobSkills.every((skill) => candidate.skills.includes(skill))
        );

        setFilteredCandidates(matchedCandidates);
      } else {
        setFilteredCandidates([]); // Nếu không có job nào được chọn, reset danh sách candidates
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setFormDataAdd({ ...formDataAdd, [name]: value });

    if (name === "job") {
      const selectedJob = jobs.find((job) => job._id === value);
      if (selectedJob) {
        const applicantIds = selectedJob.applicants || [];

        // Chỉ lấy ứng viên có id nằm trong applicants của job
        const matchedCandidates = candidates.filter((candidate) =>
          applicantIds.includes(candidate._id)
        );

        setFilteredCandidatesAdd(matchedCandidates);
      } else {
        setFilteredCandidatesAdd([]); // Reset nếu không có job nào được chọn
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const interviewDate = new Date(formData.interview_date);
      const hours = interviewDate.getHours();
      const minutes = interviewDate.getMinutes();
      const now = new Date();

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

      await axios.post("http://localhost:9999/interview/invite", formData);
      handleClose();
      onFetchInterviews();
      toast.success("Interview added successfully!");
    } catch (error) {
      console.error("Error adding interview:", error);
      if (error.response) {
        const { status, data } = error.response;

        if (
          status === 400 &&
          data.message ===
            "Interviewer already has an interview during this time."
        ) {
          toast.error("Interviewer is already booked for this time slot.");
        } else if (status === 404) {
          toast.error("Interview not found.");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleSubmitAdd = async () => {
    try {
      const interviewDate = new Date(formDataAdd.interview_date);
      const hours = interviewDate.getHours();
      const minutes = interviewDate.getMinutes();
      const now = new Date();

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

      await axios.post("http://localhost:9999/interview/", formDataAdd);
      handleCloseAdd();
      onFetchInterviews();
      toast.success("Interview added successfully!");
    } catch (error) {
      console.error("Error adding interview:", error);
      if (error.response) {
        const { status, data } = error.response;

        if (
          status === 400 &&
          data.message ===
            "Interviewer already has an interview during this time."
        ) {
          toast.error("Interviewer is already booked for this time slot.");
        } else if (status === 404) {
          toast.error("Interview not found.");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="rbc-toolbar d-flex justify-content-between align-items-center">
      <div>
        <button onClick={() => onNavigate("TODAY")} className="btn btn-primary">
          Today
        </button>
        <button
          onClick={() => onNavigate("PREV")}
          className="btn btn-secondary mx-2"
        >
          Back
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>

      <span className="rbc-toolbar-label">{label}</span>

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
          <button className="btn btn-secondary mx-2" onClick={handleOpen}>
            * Invite Interview
          </button>
        )}

        <Modal show={open} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <Typography variant="h6">Invite to Interview</Typography>
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
                      {`${job.job_name} - ${job.skills.join(", ")}`}
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
                  disabled={!formData.job} // Chỉ cho chọn khi đã chọn Job
                >
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                      <MenuItem key={candidate._id} value={candidate._id}>
                        {`${candidate.fullname} - ${candidate.skills.join(
                          ", "
                        )}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No matching candidates</MenuItem>
                  )}
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

        {user.role === "Recruitment Manager" && (
          <button className="btn btn-primary mx-2" onClick={handleOpenAdd}>
            Add Interview +
          </button>
        )}

        <Modal show={openAdd} onHide={handleCloseAdd} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <Typography variant="h6">Add Interview +</Typography>
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
                  value={formDataAdd.interviewer}
                  onChange={handleChangeAdd}
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
                  label="Select Job"
                  name="job"
                  value={formDataAdd.job}
                  onChange={handleChangeAdd}
                  fullWidth
                  required
                  className="mb-3"
                >
                  {jobs.map((job) => (
                    <MenuItem key={job._id} value={job._id}>
                      {`${job.job_name} `}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Select Candidate"
                  name="candidate"
                  value={formDataAdd.candidate}
                  onChange={handleChangeAdd}
                  fullWidth
                  required
                  className="mb-3"
                  disabled={!formDataAdd.job} // Chỉ cho chọn khi đã chọn Job
                >
                  {filteredCandidatesAdd.length > 0 ? (
                    filteredCandidatesAdd.map((candidate) => (
                      <MenuItem key={candidate._id} value={candidate._id}>
                        {`${candidate.fullname} `}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No matching candidates</MenuItem>
                  )}
                </TextField>
                <TextField
                  type="datetime-local"
                  label="Interview Date"
                  name="interview_date"
                  value={formDataAdd.interview_date}
                  onChange={handleChangeAdd}
                  fullWidth
                  required
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Meeting Link"
                  name="meeting_link"
                  value={formDataAdd.meeting_link}
                  onChange={handleChangeAdd}
                  fullWidth
                  className="mb-3"
                />

                <TextField
                  label="Note"
                  name="note"
                  value={formDataAdd.note}
                  onChange={handleChangeAdd}
                  fullWidth
                  multiline
                  rows={3}
                />
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <ButtonBootstrap
              variant="outline-secondary"
              onClick={handleCloseAdd}
            >
              Close
            </ButtonBootstrap>
            <ButtonBootstrap variant="primary" onClick={handleSubmitAdd}>
              Save
            </ButtonBootstrap>
          </Modal.Footer>
        </Modal>

        <ToastContainer />
      </div>
    </div>
  );
}

export default CustomToolbar;
