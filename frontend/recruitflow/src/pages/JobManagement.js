import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "../styles/a.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showModal, setShowModal] = useState(false); 
  const [user, setUser] = useState({ email: "", id: "", role: "" }); 
  const limit = 5;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [workingType, setWorkingType] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const fetchJobs = useCallback(
    async (userData) => {
      try {
        const params = new URLSearchParams({
          page,
          limit,
          role: userData.role || "",
          search,
          statusFilter,
          workingType,
          sort: "updatedAt:desc",
        });
  
        const apiUrl = `http://localhost:9999/job?${params.toString()}`;
        const response = await fetch(apiUrl);
  
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
  
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.totalJobs || 0);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    },
    [page, limit, search, statusFilter, workingType]
  );

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("userRole");

        const userData = { email: userEmail, id: userId, role: userRole };
        setUser(userData);

        await fetchJobs(userData);
      } catch (error) {
        console.error("Error fetching user or jobs:", error);
      }
    };

    fetchUserAndJobs();
  }, [page, limit, search, statusFilter, workingType]);

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

  const [newJob, setNewJob] = useState({
    job_name: "",
    salary_min: "",
    salary_max: "",
    start_date: "",
    end_date: "",
    working_type: "Fulltime",
    experience: "",
    number_of_vacancies: "",
    skills: [],
    benefits: [],
    levels: "Senior",
    description: "",
    createdBy: user.id,
  });

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const formatWorkingType = (type) => {
    return type.replace("time", "-time");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prevJob) => ({ ...prevJob, [name]: value }));
  };

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setNewJob((prevJob) => {
      const updatedValues = checked
        ? [...prevJob[type], value]
        : prevJob[type].filter((item) => item !== value);
      return { ...prevJob, [type]: updatedValues };
    });
  };

  const handleAddJob = async () => {
    const userId = localStorage.getItem("userId");
    newJob.createdBy = userId;
    try {
      const response = await fetch("http://localhost:9999/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
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

      const data = await response.json();
      setJobs((prevJobs) => [data.job, ...prevJobs]);
      await fetchJobs(user, page);
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleWorkingTypeChange = (e) => {
    setWorkingType(e.target.value);
    setPage(1);
  };

  return (
    <div className="d-flex vh-100">
      <div className="container p-2 vh-100 bg-light mb-5">
        <div className="col-md-2"></div>
        <div
          className="card p-4 shadow border-0 container mt-5 overflow-auto col-md-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="search-bar p-0 d-none d-md-block">
                <div id="search" className="menu-search mb-0">
                  <div>
                    <input
                      type="text"
                      className="form-control bg-light border-2 rounded-pill"
                      placeholder="Search by Title..."
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-pill bg-light border-2"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                defaultValue="0"
              >
                <option value="" disabled hidden>
                  Status
                </option>
                <option value="">All</option>
                {user.role !== "Recruiter" && user.role !== "Interviewer" && (
                  <option value="waiting">Waiting</option>
                )}
                <option value="opened">Opened</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-pill bg-light border-2"
                value={workingType}
                onChange={handleWorkingTypeChange}
                defaultValue="0"
              >
                <option value="" disabled hidden>
                  Working Type
                </option>
                <option value="">All</option>
                <option value="Fulltime">Full-Time</option>
                <option value="Parttime">Part-Time</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              {["Recruitment Manager", "Admin"].includes(user.role) && (
                <Button variant="warning" onClick={() => setShowModal(true)}>
                  + Request New Job
                </Button>
              )}
            </div>
          </div>

          <div className="" style={{ maxHeight: "75vh" }}>
            <div className="">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="card mb-3 shadow-sm"
                  style={{
                    border: "2px solid #ddd",
                    borderRadius: "20px",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "#fdfdfd",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#68b7ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#ddd")
                  }
                >
                  <div
                    className="card-body"
                    onClick={() => navigate(`/job/${job._id}`)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className={`card-title mb-1`}>{job.job_name}</h5>
                      </div>
                      <span className={`text-muted mt-1`}>
                        ${job.salary_min} - ${job.salary_max}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-start">
                      <p className="card-subtitle text-muted ">
                        {formatDate(job.start_date)} -{" "}
                        {formatDate(job.end_date)}
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className="badge bg-info text-white me-2">
                        {formatWorkingType(job.working_type)}
                      </span>
                      <span className="badge bg-info text-white me-2">
                        {job.experience}
                      </span>
                      <span className="badge bg-info text-white me-2">
                        Vacancies: {job.number_of_vacancies}
                      </span>
                      <span
                        className={`badge text-white ${
                          job.status.name === "closed"
                            ? "bg-danger"
                            : job.status.name === "open"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {job.status.name === "open"
                          ? "Opened"
                          : job.status.name === "closed"
                          ? "Closed"
                          : "Waiting"}
                      </span>
                      <small className="text-muted float-end">
                        {job.skills.join(", ")}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-center mt-3 pb-3">
                <Stack spacing={2}>
                  <Pagination
                    count={Math.max(1, Math.ceil(totalJobs / limit))}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "4px",
                        minWidth: "36px",
                        height: "36px",
                        borderColor: "#64c2f1",
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: "#64c2f1",
                        color: "#fff",
                        borderColor: "#64c2f1",
                      },
                      "& .MuiPaginationItem-root:hover": {
                        backgroundColor: "#b3e3f9",
                        borderColor: "#64c2f1",
                      },
                    }}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request New Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              {/* Job Title and Experience Row */}
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="job_name"
                    onChange={handleInputChange}
                    isInvalid={!!errors.job_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.job_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Experience</Form.Label>
                  <Form.Control
                    type="text"
                    name="experience"
                    onChange={handleInputChange}
                    isInvalid={!!errors.experience}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.experience}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Min Salary and Max Salary Row */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Min Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="salary_min"
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
                    onChange={handleInputChange}
                    isInvalid={!!errors.salary_max}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.salary_max}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Start Date and End Date Row */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
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
                    onChange={handleInputChange}
                    isInvalid={!!errors.end_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.end_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Level Row */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select name="levels" onChange={handleInputChange}>
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
                    onChange={handleInputChange}
                    isInvalid={!!errors.number_of_vacancies}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.number_of_vacancies}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            {/* Skills and Benefits Row */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group
                  className={`mb-3 ${errors.skills ? "is-invalid" : ""}`}
                >
                  <Form.Label>Skills</Form.Label>
                  <div className="row">
                    {skillOptions.map((skill, index) => (
                      <div key={skill} className="col-6">
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          value={skill}
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

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Benefits</Form.Label>
                  <div className="row">
                    {benefitOptions.map((benefit, index) => (
                      <div key={benefit} className="col-6">
                        <Form.Check
                          type="checkbox"
                          label={benefit}
                          value={benefit}
                          onChange={(e) => handleCheckboxChange(e, "benefits")}
                        />
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </div>
            </div>

            {/* Description Row */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddJob}>
            Save Job
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default JobManagement;
