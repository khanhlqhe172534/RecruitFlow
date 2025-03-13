import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "../styles/a.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { ToastContainer, toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({ email: "", id: "", role: "" });
  const limit = 5;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [workingType, setWorkingType] = useState([]);
  const [errors, setErrors] = useState({});
  const [levelFilter, setLevelFilter] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportErrors, setExportErrors] = useState({
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  const fetchJobs = useCallback(
    async (userData) => {
      try {
        console.log("levelFilter:", levelFilter);
        console.log("experienceFilter:", experienceFilter);
        const params = new URLSearchParams({
          page,
          limit,
          role: userData.role || "",
          search,
          statusFilter: statusFilter.join(","),
          workingType: workingType.join(","),
          levelFilter: levelFilter.join(","),
          experienceFilter: experienceFilter.join(","),
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
    [
      page,
      limit,
      search,
      statusFilter,
      workingType,
      levelFilter,
      experienceFilter,
    ]
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
  }, [
    page,
    limit,
    search,
    statusFilter,
    workingType,
    levelFilter,
    experienceFilter,
  ]);

  const handleExport = async () => {
    try {
      const response = await fetch(
        `http://localhost:9999/job/export?startDate=${startDate}&endDate=${endDate}`
      );

      if (!startDate && !endDate) {
        toast.info("No date range selected. Exporting all jobs.", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setExportErrors(errorData);
        } else {
          throw new Error(errorData.message || "Failed to export jobs");
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Job_List_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportErrors({ startDate: "", endDate: "" });
    } catch (error) {
      setExportErrors({ startDate: "", endDate: "", general: error.message });
    }
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

  const skillImages = {
    Java: "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg",
    Nodejs:
      "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg",
    "C++":
      "https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg",
    ".Net":
      "https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg",
    Python:
      "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
    JavaScript:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    PHP: "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg",
    Ruby: "https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg",
    Go: "https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg",
    Rust: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg",
  };

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
      toast.success("Job added successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add job. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setPage(1);
  };

  const handleWorkingTypeChange = (value) => {
    setWorkingType((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setPage(1);
  };

  const handleLevelFilterChange = (value) => {
    setLevelFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setPage(1);
  };

  const handleExperienceFilterChange = (value) => {
    setExperienceFilter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
    setPage(1);
  };

  return (
    <div className="d-flex flex-column bg-light ">
      <div className="container-fluid px-4" style={{ border: "" }}>
        <div className="row col-md-12">
          <div
            className="p-4 border-0 container-fluid"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="row">
              <div className="col-md-9">
                <div
                  className="card mb-3 shadow-sm mt-4"
                  style={{
                    border: "2px solid #ddd",
                    borderRadius: "20px",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "#fdfdfd",
                  }}
                >
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-12 mb-2">
                        <h4 className="mb-1">Search Job</h4>{" "}
                      </div>
                      <div className="col-md-12">
                        <div className="search-bar">
                          <div id="search" className="menu-search mb-0">
                            <div className="position-relative">
                              <input
                                type="text"
                                className="form-control bg-light border-2 rounded-pill ps-5"
                                placeholder="Search by Title..."
                                value={search}
                                onChange={handleSearchChange}
                              />
                              <i
                                className="fas fa-search position-absolute top-50 translate-middle-y ms-3"
                                style={{ color: "#888" }}
                              ></i>{" "}
                              <SearchIcon
                                className="position-absolute top-50 translate-middle-y ms-3"
                                style={{ color: "#888" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="mt-2 bg-opacity-50 p-2 rounded text-center"
                      style={{ backgroundColor: "#f3fafc" }}
                    >
                      <small style={{ color: "#64c2f1" }}>
                        {totalJobs} jobs found
                      </small>
                    </div>
                  </div>
                </div>
                <div
                  className="overflow-auto"
                  style={{
                    maxHeight: "calc(85vh - 200px)",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="card mb-3 shadow-sm"
                      style={{
                        border: "2px solid #ddd",
                        borderRadius: "10px",
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
                        <div className="d-flex">
                          <img
                            className="me-3"
                            src={skillImages[job.skills[0]]}
                            alt={job.skills[0]}
                            style={{
                              width: 100,
                              height: 100,
                              marginRight: 10,
                              objectFit: "fill",
                              borderRadius: "5px",
                            }}
                          />
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-start">
                              <h5 className="card-title mb-1">
                                {job.job_name}
                              </h5>
                              <span className="text-bold mt-1">
                                ${job.salary_min} - ${job.salary_max}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-start">
                              <p className="card-subtitle text-muted ">
                                {formatDate(job.start_date)} -{" "}
                                {formatDate(job.end_date)}
                              </p>
                              <span
                                className="fw-bold"
                                style={{ fontSize: "0.95rem" }}
                              >
                                Salary:&nbsp;
                                <span
                                  className={`${
                                    job.salaryChecked === true
                                      ? "text-success"
                                      : job.salaryChecked === false
                                      ? "text-danger"
                                      : "text-warning"
                                  } fw-bold`}
                                >
                                  {job.salaryChecked === true
                                    ? "Approved"
                                    : job.salaryChecked === false
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                                &nbsp;- Benefit:&nbsp;
                                <span
                                  className={`${
                                    job.benefitChecked === true
                                      ? "text-success"
                                      : job.benefitChecked === false
                                      ? "text-danger"
                                      : "text-warning"
                                  } fw-bold`}
                                >
                                  {job.benefitChecked === true
                                    ? "Approved"
                                    : job.benefitChecked === false
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                              </span>
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
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="col-md-3 mt-4 overflow-auto"
                  style={{
                    maxHeight: "calc(100vh - 100px)",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}>
                {user.role === "Recruitment Manager" && (
                  <div className="card mb-3 shadow-sm bg-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Tools</h5>
                      </div>
                      <div className="">
                        <p
                          onClick={() => setShowModal(true)}
                          className="mb-0 fs-6 text-warning"
                          style={{ cursor: "pointer" }}
                        >
                          Request New Job
                        </p>
                      </div>
                      <div className="">
                        <p
                          onClick={() => setShowExportModal(true)}
                          className="mb-0 fs-6"
                          style={{ color: "#64c2f1", cursor: "pointer" }}
                        >
                          Export Job List
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="card mb-3 shadow-sm bg-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0">Job Filter</h5>
                      <p
                        onClick={() => {
                          setStatusFilter([]);
                          setWorkingType([]);
                          setLevelFilter([]);
                          setExperienceFilter([]);
                        }}
                        className="mb-0 fs-6"
                        style={{ color: "#64c2f1", cursor: "pointer" }}
                      >
                        Clear All
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="card mb-3 shadow-sm bg-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-2">Status</h6>
                      <p
                        onClick={() => {
                          setStatusFilter([]);
                        }}
                        className="mb-2"
                        style={{ color: "#64c2f1", cursor: "pointer" }}
                      >
                        Clear
                      </p>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="waiting"
                        checked={statusFilter.includes("waiting")}
                        onChange={() => handleStatusFilterChange("waiting")}
                      />
                      <label className="form-check-label">Waiting</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="opened"
                        checked={statusFilter.includes("opened")}
                        onChange={() => handleStatusFilterChange("opened")}
                      />
                      <label className="form-check-label">Opened</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="closed"
                        checked={statusFilter.includes("closed")}
                        onChange={() => handleStatusFilterChange("closed")}
                      />
                      <label className="form-check-label">Closed</label>
                    </div>
                  </div>
                </div>

                {/* Working Type Filter */}
                <div className="card mb-3 shadow-sm bg-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-2">Working Type</h6>
                      <p
                        onClick={() => {
                          setWorkingType([]);
                        }}
                        className="mb-2"
                        style={{ color: "#64c2f1", cursor: "pointer" }}
                      >
                        Clear
                      </p>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="Fulltime"
                        checked={workingType.includes("Fulltime")}
                        onChange={() => handleWorkingTypeChange("Fulltime")}
                      />
                      <label className="form-check-label">Full-Time</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="Parttime"
                        checked={workingType.includes("Parttime")}
                        onChange={() => handleWorkingTypeChange("Parttime")}
                      />
                      <label className="form-check-label">Part-Time</label>
                    </div>
                  </div>
                </div>

                {/* Experience Filter */}
                <div className="card mb-3 shadow-sm bg-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-2">Experience</h6>
                      <p
                        onClick={() => {
                          setExperienceFilter([]);
                        }}
                        className="mb-2"
                        style={{ color: "#64c2f1", cursor: "pointer" }}
                      >
                        Clear
                      </p>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="1year"
                        checked={experienceFilter.includes("1year")}
                        onChange={() => handleExperienceFilterChange("1year")}
                      />
                      <label className="form-check-label">&lt; 1 year</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="13years"
                        checked={experienceFilter.includes("13years")}
                        onChange={() => handleExperienceFilterChange("13years")}
                      />
                      <label className="form-check-label">1-3 years</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="3years"
                        checked={experienceFilter.includes("3years")}
                        onChange={() => handleExperienceFilterChange("3years")}
                      />
                      <label className="form-check-label">&gt; 3 years</label>
                    </div>
                  </div>
                </div>
                {/* Level Filter */}
                <div className="card mb-3 shadow-sm bg-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-2">Level</h6>
                      <p
                        onClick={() => {
                          setLevelFilter([]);
                        }}
                        className="mb-2"
                        style={{ color: "#64c2f1", cursor: "pointer" }}
                      >
                        Clear
                      </p>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="Senior"
                        checked={levelFilter.includes("Senior")}
                        onChange={() => handleLevelFilterChange("Senior")}
                      />
                      <label className="form-check-label">Senior</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="Junior"
                        checked={levelFilter.includes("Junior")}
                        onChange={() => handleLevelFilterChange("Junior")}
                      />
                      <label className="form-check-label">Junior</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="Fresher"
                        checked={levelFilter.includes("Fresher")}
                        onChange={() => handleLevelFilterChange("Fresher")}
                      />
                      <label className="form-check-label">Fresher</label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="Intern"
                        checked={levelFilter.includes("Intern")}
                        onChange={() => handleLevelFilterChange("Intern")}
                      />
                      <label className="form-check-label">Intern</label>
                    </div>
                  </div>
                </div>
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

      <Modal
        show={showExportModal}
        onHide={() => {
          setShowExportModal(false);
          setExportErrors({});
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Export Job List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please choose the date range to export the job list.</p>

          {exportErrors.general && (
            <div className="alert alert-warning">{exportErrors.general}</div>
          )}

          <div className="row mt-3">
            <div className="col-md-6">
              <Form.Group controlId="startDate">
                <Form.Label>Start Date:</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  isInvalid={!!exportErrors.startDate}
                />
                <Form.Control.Feedback type="invalid">
                  {exportErrors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="endDate">
                <Form.Label>End Date:</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  isInvalid={!!exportErrors.endDate}
                />
                <Form.Control.Feedback type="invalid">
                  {exportErrors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowExportModal(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleExport} variant="danger">
            Export Job
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default JobManagement;
