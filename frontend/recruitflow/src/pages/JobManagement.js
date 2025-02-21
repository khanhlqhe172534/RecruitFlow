import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import SideBar from "../components/reusable/Sidebar";
import JobBreadcrumb from "../components/Breadcrumbs/JobBreadcrumb";
import "../style/a.css";

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [user, setUser] = useState({ email: "", id: "", role: "" }); // State for user details
  const limit = 5;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [workingType, setWorkingType] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

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
  }, [search, statusFilter, workingType]);

  const fetchJobs = useCallback(
    async (userData) => {
      try {
        const apiUrl = `http://localhost:9999/job?page=1&limit=${limit}&role=${userData.role}&userId=${userData.id}&search=${search}&statusFilter=${statusFilter}&workingType=${workingType}&sort=updatedAt:desc`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        setJobs(data.jobs);
        setTotalJobs(data.totalJobs);
        setPage(1);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    },
    [limit, search, statusFilter, workingType]
  );

  const loadMoreJobs = useCallback(
    async (userData) => {
      try {
        const nextPage = page + 1;
        const apiUrl = `http://localhost:9999/job?page=${nextPage}&limit=${limit}&role=${userData.role}&userId=${userData.id}&search=${search}&statusFilter=${statusFilter}&workingType=${workingType}&sort=updatedAt:desc`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        setJobs((prevJobs) => [...prevJobs, ...data.jobs]);
        setPage(nextPage);
      } catch (error) {
        console.error("Error loading more jobs:", error);
      }
    },
    [page, limit, search, statusFilter, workingType]
  );

  const handleLoadMore = () => {
    loadMoreJobs(user);
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

  // Handle status filter change and reset page to 1
  const handleStatusFilterChange = (e) => {
    const newValue = e.target.value;
    setStatusFilter(newValue);
    setPage(1);
  };

  // Handle working type change and reset page to 1
  const handleWorkingTypeChange = (e) => {
    setWorkingType(e.target.value);
    setPage(1);
  };

  return (
    <div className="d-flex vh-100">
      <SideBar />
      <div className="container-fluid p-4 overflow-auto vh-100 bg-light">
        <JobBreadcrumb />

        <div className="card p-4 rounded shadow border-0 container mt-5">
          <div className="row mb-4">
            <div className="col search-bar p-0 d-none d-md-block ms-2">
              <div id="search" className="menu-search mb-0">
                <div>
                  <input
                    type="text"
                    className="form-control bg-light border-0 rounded-pill"
                    placeholder="Search by Title..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select rounded-pill bg-light border-0"
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
                className="form-select rounded-pill bg-light border-0"
                value={workingType}
                onChange={handleWorkingTypeChange}
              >
                <option value="" selected hidden>
                  Working Type
                </option>
                <option value="">All</option>
                <option value="Fulltime">Full-Time</option>
                <option value="Parttime">Part-Time</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              {["Manager", "Admin"].includes(user.role) && (
                <Button variant="warning" onClick={() => setShowModal(true)}>
                  + Add New Job
                </Button>
              )}
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: "75vh" }}>
            <div className="container">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="card mb-3 shadow-sm"
                  style={{
                    borderRadius: "1rem",
                    borderColor:
                      job.status.name === "open"
                        ? "#20b965"
                        : job.status.name === "waiting for approved"
                        ? "#f1b561"
                        : job.status.name === "closed"
                        ? "#f14668"
                        : "#f1b561",
                    backgroundColor:
                      job.status.name === "open"
                        ? "#f2fbf6"
                        : job.status.name === "waiting for approved"
                        ? "#fdf8ec"
                        : job.status.name === "closed"
                        ? "#f8e8eb"
                        : "#fdf8ec",
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5
                          className={`card-title mb-1 ${
                            job.status.name === "open"
                              ? "text-success"
                              : job.status.name === "closed"
                              ? "text-danger"
                              : "text-warning"
                          }`}
                        >
                          {job.job_name}
                        </h5>
                      </div>
                      <span
                        className={`${
                          job.status.name === "open"
                            ? "text-success"
                            : job.status.name === "closed"
                            ? "text-danger"
                            : "text-warning"
                        } fw-bold`}
                      >
                        ${job.salary_min} - ${job.salary_max}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-start">
                      <p className="card-subtitle text-muted ">
                        {formatDate(job.start_date)} -{" "}
                        {formatDate(job.end_date)}
                      </p>
                      <button
                        className={`btn ${
                          job.status.name === "open"
                            ? "btn-success"
                            : job.status.name === "closed"
                            ? "btn-danger"
                            : "btn-warning"
                        }`}
                        onClick={() => navigate(`/job/${job._id}`)} // Navigate to job details
                      >
                        View Details
                      </button>
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
              {jobs.length < totalJobs && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-primary rounded-pill"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobManagement;
