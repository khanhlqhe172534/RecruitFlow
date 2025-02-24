import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Form, Button } from "react-bootstrap";

import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import SalaryIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StatusIcon from "@mui/icons-material/CheckCircleOutline";
import PersonIcon from "@mui/icons-material/Person";

function JobDetails() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [updatedJob, setUpdateJob] = useState({});
  const [close, setClose] = useState(false);
  const [errors, setErrors] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    setUser({ email: userEmail, role: userRole, id: userId });
  }, []);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:9999/job/${jobId}`);
      const data = await response.json();
      setJob(data.job);
      setUpdateJob(data.job);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId, refreshTrigger]);

  if (!job) return <p>Loading...</p>;

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const formatWorkingType = (type) => {
    return type.replace("time", "-time");
  };

  const formatDescriptionToArray = (description) => {
    return description
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateJob((prevData) => ({ ...prevData, [name]: value }));
  };

  const skillOptions = [
    "Java",
    "Nodejs",
    "C++",
    ".Net",
    "Python",
    "JavaScript",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
  ];
  const benefitOptions = [
    "13th-month salary",
    "Health insurance",
    "Flexible working",
    "Remote work",
    "Stock options",
    "Annual leave",
    "Team building",
    "Training programs",
    "Performance bonus",
    "Free snacks and drinks",
  ];
  const levelOptions = ["Senior", "Junior", "Fresher", "Intern"];

 
  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setUpdateJob((prevJob) => {
      const updatedValues = checked
        ? [...prevJob[type], value]
        : prevJob[type].filter((item) => item !== value);
      return { ...prevJob, [type]: updatedValues };
    });
  };

  const handleUpdateJob = async () => {
    try {
      const response = await fetch(`http://localhost:9999/job/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedJob),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 400 && result.errors) {
          setErrors(result.errors || {});
        } else {
          console.error("Unexpected error response:", result);
        }
        return;
      }

      handleCloseModal();
      fetchJobDetails();
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleCloseJob = async () => {
    try {
      const response = await fetch(`http://localhost:9999/job/${jobId}/close`, {
        method: "PUT",
      });
      const data = await response.json();
      console.log(data);
      fetchJobDetails();
      setClose(false);
    } catch (error) {
      console.error("Error closing job:", error);
    }
  };

  const handleApproval = async (isApproved) => {
    try {
      let url = "";
      let updateData = {};

      if (user.role === "Payroll Manager") {
        url = `http://localhost:9999/job/${job._id}/salary-check`;
        updateData.salaryChecked = isApproved;
      } else if (user.role === "Benefit Manager") {
        url = `http://localhost:9999/job/${job._id}/benefit-check`;
        updateData.benefitChecked = isApproved;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      const updatedJob = await response.json();
      setJob(updatedJob.job);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  return (
    <div className="d-flex vh-100">
      <div className="container-fluid p-4 overflow-auto vh-100 bg-light">
        <div className="container-fluid">
          <div className="row p-2">
            <div className="col-auto p-0">
              <a
                href="/job"
                className="text-primary"
                style={{ fontWeight: "400" }}
              >
                Home
              </a>
            </div>
            <div className="col-auto">/</div>
            <div className="col-auto p-0">
              <Typography variant="body1" gutterBottom className="my-0">
                {"Job"}↔{"Job Details"}
              </Typography>
            </div>
          </div>
        </div>
        <div className="container mt-4">
          <Grid container spacing={4}>
            {/* Left Column: Job Details */}
            <Grid item xs={12} md={8}>
              <Card variant="outlined" className="p-4">
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold" }}
                    className="text-left"
                    component="div"
                    gutterBottom
                  >
                    {job.job_name}
                  </Typography>
                  <Grid container spacing={2} className="my-3">
                    <Grid item xs={6}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <SalaryIcon
                            sx={{
                              fontSize: "30px",
                              color: "#3a6cf1",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Salary range:</strong>
                            </Typography>
                            <Typography variant="body2">
                              ${job.salary_min} - ${job.salary_max}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <CalendarTodayIcon
                            sx={{
                              fontSize: "30px",
                              color: "#ff9800",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Application time range:</strong>
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(job.start_date)} -{" "}
                              {formatDate(job.end_date)}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} className="my-3">
                    <Grid item xs={6}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon
                            sx={{
                              fontSize: "30px",
                              color: "#4caf50",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Added by:</strong>
                            </Typography>
                            <Typography variant="body2">
                              {job.createdBy.fullname || "N/A"}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <StatusIcon
                            sx={{
                              fontSize: "30px",
                              color:
                                job.status.name === "open"
                                  ? "#4caf50"
                                  : job.status.name === "waiting for approved"
                                  ? "#ff9800"
                                  : "#f44336",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Status:</strong>
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{
                                color:
                                  job.status.name === "open"
                                    ? "#4caf50"
                                    : job.status.name === "waiting for approved"
                                    ? "#ff9800"
                                    : "#f44336",
                              }}
                            >
                              {job.status.name === "open"
                                ? "Opened"
                                : job.status.name === "closed"
                                ? "Closed"
                                : "Waiting"}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                  </Grid>

                  <div className="d-flex mb-3 row">
                    {user.role === "Recruitment Manager" &&
                      job.status.name === "waiting for approved" && (
                        <div>
                          <Button
                            variant="success"
                            className="btn btn-info col-md-2 btn-md float-end"
                            style={{ borderRadius: "8px" }}
                            onClick={() => setShowModal(true)}
                          >
                            Update
                          </Button>
                        </div>
                      )}

                    {user.role === "Recruitment Manager" &&
                      job.status.name === "open" &&
                      job.salaryChecked === null &&
                      job.benefitChecked ===
                        null(
                          <div>
                            <Button
                              variant="danger"
                              className="btn btn-danger col-md-2 btn-md float-end"
                              style={{ borderRadius: "8px" }}
                              onClick={() => setClose(true)}
                            >
                              Close
                            </Button>
                          </div>
                        )}

                    {((user.role === "Payroll Manager" &&
                      job.salaryChecked === null) ||
                      (user.role === "Benefit Manager" &&
                        job.benefitChecked === null)) &&
                      job.status.name === "waiting for approved" && (
                        <div>
                          <Button
                            variant="success"
                            className="btn btn-success col-md-2 btn-md float-end"
                            style={{ borderRadius: "8px" }}
                            onClick={() => handleApproval(true)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            className="btn btn-danger col-md-2 btn-md float-end me-2"
                            style={{ borderRadius: "8px" }}
                            onClick={() => handleApproval(false)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card className=" container mt-4">
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold" }}
                    className="text-left"
                    component="div"
                    gutterBottom
                  >
                    Job Details
                  </Typography>
                  <Divider className="my-2" />
                  <Typography variant="body1" paragraph>
                    Job Description
                    <br />
                    <ul>
                      {formatDescriptionToArray(job.description).map(
                        (line, index) => (
                          <li key={index}>
                            <Typography variant="body2">{line}</Typography>
                          </li>
                        )
                      )}
                    </ul>
                  </Typography>
                  <Typography variant="body1" className="my-2">
                    Work Benefits
                    <br />
                    <ul>
                      {job.benefits &&
                        job.benefits.map((benefit, index) => (
                          <li key={index}>
                            <Typography variant="body2">{benefit}</Typography>
                          </li>
                        ))}
                    </ul>
                  </Typography>
                  <ul>
                    {job.responsibilities &&
                      job.responsibilities.map((item, index) => (
                        <li key={index}>
                          <Typography variant="body2">{item}</Typography>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                variant="outlined"
                style={{ borderRadius: "15px", padding: "16px" }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold" }}
                    gutterBottom
                    className="text-center"
                  >
                    General Information
                  </Typography>
                  <Divider className="mb-3" />

                  <Grid container spacing={2} direction="column">
                    {/* Level */}
                    <Grid item>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <BusinessCenterOutlinedIcon
                            sx={{
                              fontSize: "30px",
                              color: "#3a6cf1",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Level</strong>
                            </Typography>
                            <Typography variant="body2">
                              {job.levels || "N/A"}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>

                    {/* Working Type */}
                    <Grid item>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <AccessTimeOutlinedIcon
                            sx={{
                              fontSize: "30px",
                              color: "#fee010",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Working Type</strong>
                            </Typography>
                            <Typography variant="body2">
                              {formatWorkingType(job.working_type) ||
                                "Toàn thời gian"}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>

                    {/* Number of Vacancies */}
                    <Grid item>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <PeopleAltOutlinedIcon
                            sx={{
                              fontSize: "30px",
                              color: "#ca8273",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Number of Vacancies</strong>
                            </Typography>
                            <Typography variant="body2">
                              {job.number_of_vacancies || 1}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>

                    {/* Skills Required */}
                    <Grid item>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <BuildOutlinedIcon
                            sx={{
                              fontSize: "30px",
                              color: "#63bf98",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Skills Required</strong>
                            </Typography>
                            <Typography variant="body2">
                              {job.skills ? job.skills.join(", ") : "N/A"}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>

                    {/* Experience */}
                    <Grid item>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          padding: "8px",
                          borderColor: "#e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <TrendingUpOutlinedIcon
                            sx={{
                              fontSize: "30px",
                              color: "#ec1f26",
                              marginRight: "8px",
                            }}
                          />
                          <div>
                            <Typography variant="body2">
                              <strong>Experience</strong>
                            </Typography>
                            <Typography variant="body2">
                              {job.experience}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Job Title */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="job_name"
                    value={updatedJob.job_name || ""}
                    onChange={handleInputChange}
                    isInvalid={!!errors.job_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.job_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              {/* Experience */}
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Experience</Form.Label>
                  <Form.Control
                    type="text"
                    name="experience"
                    value={updatedJob.experience || ""}
                    onChange={handleInputChange}
                    isInvalid={!!errors.experience}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.experience}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Min Salary and Max Salary */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Min Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="salary_min"
                    value={updatedJob.salary_min || ""}
                    onChange={handleInputChange}
                    isInvalid={!!errors.salary_min}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.salary_min}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Max Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="salary_max"
                    value={updatedJob.salary_max || ""}
                    onChange={handleInputChange}
                    isInvalid={!!errors.salary_max}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.salary_max}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Start Date and End Date */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={
                      updatedJob.start_date
                        ? new Date(updatedJob.start_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    isInvalid={!!errors.start_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.start_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={
                      updatedJob.end_date
                        ? new Date(updatedJob.end_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    isInvalid={!!errors.end_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.end_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Level */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select
                    name="levels"
                    value={updatedJob.levels || ""}
                    onChange={handleInputChange}
                  >
                    {levelOptions.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Number of vacancies</Form.Label>
                  <Form.Control
                    type="number"
                    name="number_of_vacancies"
                    value={updatedJob.number_of_vacancies || ""}
                    onChange={handleInputChange}
                    isInvalid={!!errors.number_of_vacancies}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.number_of_vacancies}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Skills */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group
                  className={`mb-3 ${errors.skills ? "is-invalid" : ""}`}
                >
                  <Form.Label>Skills</Form.Label>
                  <div className="row">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="col-6">
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          value={skill}
                          checked={updatedJob.skills.includes(skill)}
                          onChange={(e) => handleCheckboxChange(e, "skills")}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.skills && (
                    <Form.Text className="text-danger">
                      {errors.skills}
                    </Form.Text>
                  )}
                </Form.Group>
              </div>

              {/* Benefits */}
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Benefits</Form.Label>
                  <div className="row">
                    {benefitOptions.map((benefit) => (
                      <div key={benefit} className="col-6">
                        <Form.Check
                          type="checkbox"
                          label={benefit}
                          value={benefit}
                          checked={updatedJob.benefits.includes(benefit)}
                          onChange={(e) => handleCheckboxChange(e, "benefits")}
                        />
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </div>
            </div>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={updatedJob.description || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateJob}>
            Save Job
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={close} onHide={() => setClose(true)} style={{ top: "30%" }}>
        <Modal.Header>
          <Modal.Title>Close Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to close this job? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setClose(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleCloseJob} variant="danger">
            Close Job
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default JobDetails;
