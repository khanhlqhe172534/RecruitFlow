import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  Modal,
  Spinner
} from "react-bootstrap";
import {
  Eye,
  Pencil,
  UserPlus,
  ChevronsUpDown,
  Import,
  FileUp
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function CandidateManagement() {
  const nav = useNavigate();
  const [candidate, setCandidate] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [newCandidateData, setNewCandidateData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    isMale: true,
    dob: "",
    address: "",
    cv_url: "",
    status: "67bc5a667ddc08921b739694", // default status = activated
    role: "67bc59b77ddc08921b73968f", // default role = candidate
    skills: []
  });

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
    "Rust"
  ];

  // for add candidate
  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setNewCandidateData((prevCandidate) => {
      const updatedValues = checked
        ? [...prevCandidate[type], value]
        : prevCandidate[type].filter((item) => item !== value);
      return { ...prevCandidate, [type]: updatedValues };
    });
  };

  // for edit candidate
  const handleCheckboxChangeEdit = (e, type) => {
    const { value, checked } = e.target;
    setCurrentCandidate((prevCandidate) => {
      const updatedValues = checked
        ? [...prevCandidate[type], value]
        : prevCandidate[type].filter((item) => item !== value);
      return { ...prevCandidate, [type]: updatedValues };
    });
  };

  // import excel start

  const [file, setFile] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false); // Trạng thái import
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Trạng thái vô hiệu hóa nút
  const [errorImport, setErrorImport] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls" // Chỉ chấp nhận file Excel
  });

  const handleImportCandidates = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    // Kiểm tra loại file
    const allowedTypes = [".xlsx", ".xls"];
    const fileExtension = file.name.split(".").pop();

    if (!allowedTypes.includes(`.${fileExtension}`)) {
      toast.error("Invalid file type. Only .xlsx or .xls files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsImporting(true); // Bắt đầu quá trình import
    setIsButtonDisabled(true); // Vô hiệu hóa nút khi bắt đầu import

    try {
      setImportStatus("Importing...");

      const response = await axios.post(
        "http://localhost:9999/candidate/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      setImportStatus("Import successful!");
      // Reset state
      setFile(null);
      setShowImportModal(false);
      toast.success(response.data.message);
    } catch (error) {
      setImportStatus("Import failed!");
      toast.error("Error importing candidates.");
      console.log("Error importing candidates:", error);
      setErrorImport(error.response.data.errors);
    } finally {
      setIsImporting(false); // Kết thúc quá trình import
      setIsButtonDisabled(false); // Bỏ vô hiệu hóa nút
    }
  };
  // import excel end

  // Hàm để download file mẫu Excel từ thư mục public
  const handleDownloadTemplate = () => {
    // Chỉ cần truyền đường dẫn tĩnh đến file trong thư mục public
    const link = document.createElement("a");
    link.href = "/files/Candidates_Mock_Data.xlsx"; // Đường dẫn đến file mẫu trong thư mục public
    link.download = "Candidates_Mock_Data.xlsx"; // Đặt tên file khi tải xuống
    link.click();
  };

  const [errors, setErrors] = useState({});

  const usersPerPage = 6;
  const RECRUITER_ROLE_ID = "Recruitment Manager";

  // Get user role info
  useEffect(() => {
    const userInfo = localStorage.getItem("userRole");

    if (userInfo) {
      setCurrentUserRole(userInfo);
    }
  }, []);

  //check role
  const hasRecruiterPermission = currentUserRole === RECRUITER_ROLE_ID;

  //Get all candidate
  useEffect(() => {
    fetch(`http://localhost:9999/candidate`)
      .then((res) => res.json())
      .then((res) => {
        setCandidate(res);
        setFilteredCandidates(res);
      })
      .catch((err) => console.log(err));
  }, [file]);

  // Handle search
  useEffect(() => {
    const filtered = candidate.filter((c) =>
      c.fullname.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredCandidates(filtered);
  }, [searchInput, candidate]);

  const handleSort = useCallback(
    (column) => {
      if (column === "action") return;

      setSortColumn(column);
      setSortOrder((prevOrder) => {
        // If clicking the same column, toggle the order
        if (column === sortColumn) {
          return prevOrder === "asc" ? "desc" : "asc";
        }
        // If clicking a new column, default to ascending
        return "asc";
      });
    },
    [sortColumn]
  );

  // Update the useEffect for sorting
  useEffect(() => {
    if (sortColumn && candidate.length > 0) {
      const sortedCandidate = [...candidate].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        // Handle nested objects (like role.name)
        if (sortColumn === "role") {
          aValue = (a.role?.name || a.role || "").toLowerCase();
          bValue = (b.role?.name || b.role || "").toLowerCase();
        }

        // Handle nested objects (like status.name)
        if (sortColumn === "status") {
          aValue = (a.status?.name || a.status || "").toLowerCase();
          bValue = (b.status?.name || b.status || "").toLowerCase();
        }

        // Handle phone numbers
        if (sortColumn === "phoneNumber") {
          aValue = aValue.replace(/\D/g, "");
          bValue = bValue.replace(/\D/g, "");
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle string comparisons
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric comparisons
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });

      setCandidate(sortedCandidate);
    }
  }, [sortColumn, sortOrder, candidate, showEditModal]);

  const totalPages = Math.ceil(filteredCandidates.length / usersPerPage);

  const paginatedCandidate = filteredCandidates.slice(
    currentPage * usersPerPage,
    (currentPage + 1) * usersPerPage
  );

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setNewCandidateData({ ...newCandidateData, [name]: value.toLowerCase() });
    } else {
      setNewCandidateData({ ...newCandidateData, [name]: value });
    }
  };

  //Validate
  const validateCandidateData = (data, isEdit = false) => {
    let newErrors = {};

    // Check for duplicate email
    const existingEmailCandidate = candidate.find(
      (c) =>
        c.email.toLowerCase() === data.email.toLowerCase() &&
        (!isEdit || c._id !== data._id)
    );
    if (existingEmailCandidate) {
      newErrors.email = "Email already exists.";
    }

    // Check for duplicate phone number
    const existingPhoneCandidate = candidate.find(
      (c) =>
        c.phoneNumber === data.phoneNumber && (!isEdit || c._id !== data._id)
    );
    if (existingPhoneCandidate) {
      newErrors.phoneNumber = "Phone number already exists.";
    }

    // Check full name
    if (/\d/.test(data.fullname)) {
      newErrors.fullname = "Full name cannot contain numbers.";
    }

    // Check phone number format
    if (!/^[+]?[0-9]{10,11}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be between 10 and 11 digits.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    setErrors({});

    if (!hasRecruiterPermission) {
      alert("You don't have permission to add candidates");
      return;
    }

    if (!validateCandidateData(newCandidateData)) {
      return;
    }

    fetch(`http://localhost:9999/candidate/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newCandidateData)
    })
      .then((res) => res.json())
      .then((data) => {
        setCandidate([...candidate, data]);
        setShowAddModal(false);
        window.location.reload();
      })
      .catch((err) => console.log(err));
    nav("/candidate");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCandidate({ ...currentCandidate, [name]: value });
  };
  //Validate

  const validateEditData = (data) => {
    return validateCandidateData(data, true);
  };
  const handleEditCandidate = (e) => {
    e.preventDefault();
    setErrors({});

    if (!hasRecruiterPermission) {
      alert("You don't have permission to edit candidates");
      return;
    }

    if (!validateEditData(currentCandidate)) {
      return;
    }

    fetch(`http://localhost:9999/candidate/update/${currentCandidate._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(currentCandidate)
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedCandidates = candidate.map((c) =>
          c._id === data._id ? data : c
        );
        setCandidate(updatedCandidates);
        setShowEditModal(false);
      })
      .catch((err) => console.log(err));
  };

  const handleOpenAddModal = () => {
    setErrors({});
    setShowAddModal(true);
  };

  const handleOpenEditModal = (candidate) => {
    setErrors({});
    setCurrentCandidate(candidate);
    setShowEditModal(true);
  };

  return (
    <div className="d-flex vh-100">
      <Container fluid className="p-4 vh-100 bg-light">
        <Row className="card p-4 rounded shadow border-0 overflow-auto">
          <Row className="mb-4">
            <Col md={8}>
              <Form.Control
                className="form-control bg-light rounded-pill"
                type="text"
                placeholder="Search Full Name..."
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
            </Col>

            <Col md={2} className="text-end">
              {hasRecruiterPermission && (
                <Button
                  variant="warning"
                  className="rounded-pill"
                  onClick={handleOpenAddModal}
                >
                  <UserPlus className="pb-1" size={20} /> Add Candidate
                </Button>
              )}
            </Col>
            <Col md={2}>
              {hasRecruiterPermission && (
                <Button
                  variant="success"
                  className="rounded-pill"
                  onClick={() => setShowImportModal(true)}
                  disabled={isButtonDisabled}
                >
                  <Import className="pb-1" size={20} /> Import
                </Button>
              )}

              {/* Modal import excel start */}
              <Modal
                show={showImportModal}
                onHide={() => {
                  setFile(null);
                  setErrorImport([]);
                  setImportStatus("");
                  setIsImporting(false);
                  setIsButtonDisabled(false);
                  setShowImportModal(false);
                }}
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>Import Candidates from File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <div
                      {...getRootProps()}
                      className="dropzone"
                      style={{
                        border: "2px dashed #ccc",
                        padding: "20px",
                        textAlign: "center"
                      }}
                    >
                      <input {...getInputProps()} />
                      <FileUp className="pb-1 mb-2" size={60} />
                      <p>
                        Drag & drop an Excel (.xlsx, .xls) file here, or click
                        to select a file
                      </p>
                    </div>
                  </Form>
                  {file && (
                    <div>
                      <strong>Selected File:</strong> {file.name}
                    </div>
                  )}
                  {/* Nút tải file mẫu */}
                  <Button variant="link" onClick={handleDownloadTemplate}>
                    <Import className="pb-1" size={20} /> Download Template File
                  </Button>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFile(null);
                      setErrorImport([]);
                      setImportStatus("");
                      setIsImporting(false);
                      setIsButtonDisabled(false);
                      setShowImportModal(false);
                    }}
                    disabled={isButtonDisabled}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleImportCandidates}
                    disabled={isButtonDisabled} // Vô hiệu hóa nút khi đang import
                  >
                    {isImporting ? (
                      <Spinner animation="border" size="sm" /> // Hiển thị spinner khi đang import
                    ) : (
                      "Import"
                    )}
                  </Button>

                  {/* Displaying the errors below the file selection */}
                  {errorImport.length > 0 && (
                    <div className="mt-3 text-danger">
                      <h3>Import Errors:</h3>
                      <ul>
                        {errorImport.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>
              {/* Modal import excel end */}
            </Col>
          </Row>
          <Row>
            <Table hover responsive>
              <thead className="table-lighter">
                <tr>
                  {[
                    "fullname",
                    "gender",
                    "email",
                    "phoneNumber",
                    "status",
                    "createdAt",
                    "action"
                  ].map((column) => (
                    <th
                      key={column}
                      onClick={() => column !== "action" && handleSort(column)}
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                      {column !== "action" && (
                        <ChevronsUpDown
                          size={20}
                          className={`pb-1 ${
                            sortColumn === column
                              ? sortOrder === "desc"
                                ? "text-primary rotate-180"
                                : "text-primary"
                              : "text-muted"
                          }`}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {paginatedCandidate?.map((c) => (
                  <tr key={c._id}>
                    <td>{c.fullname}</td>
                    <td>{c.isMale ? "Male" : "Female"}</td>
                    <td>{c.email}</td>
                    <td>{c.phoneNumber}</td>
                    <td>
                      <span
                        className={`px-2 inline-flex text-sm badge rounded-pill ${
                          c.status?.name === "activated"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {c.status?.name}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="primary"
                        className="m-1 btn btn-icon btn-pills btn-soft-primary"
                        onClick={() => {
                          setCurrentCandidate(c);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye size={18} />
                      </Button>
                      {hasRecruiterPermission && (
                        <Button
                          variant="warning"
                          className="m-1 btn btn-icon btn-pills btn-soft-warning"
                          onClick={() => {
                            setCurrentCandidate(c);
                            handleOpenEditModal(c);
                          }}
                        >
                          <Pencil size={18} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage + 1 === totalPages}
              >
                Next
              </Button>
            </div>
          </Row>
        </Row>

        {/* Add Candidate Modal */}
        <Modal
          centered
          size="lg"
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Candidate</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddCandidate}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Full Name <span className="text-danger">*</span>{" "}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullname"
                      placeholder="Type a name..."
                      required
                      value={newCandidateData.fullname}
                      onChange={handleInputChange}
                    />
                    {errors.fullname && (
                      <div className="text-danger">{errors.fullname}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Email <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Type a email..."
                      required
                      value={newCandidateData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <div className="text-danger">{errors.email}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Date of Birth <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      required
                      value={newCandidateData.dob}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      placeholder="Type an address..."
                      required
                      value={newCandidateData.address}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Phone Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      placeholder="Type a number..."
                      required
                      value={newCandidateData.phoneNumber}
                      onChange={handleInputChange}
                    />
                    {errors.phoneNumber && (
                      <div className="text-danger">{errors.phoneNumber}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Gender <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="isMale"
                      required
                      value={newCandidateData.isMale}
                      onChange={(e) =>
                        setNewCandidateData({
                          ...newCandidateData,
                          isMale: e.target.value === "true"
                        })
                      }
                    >
                      <option value="true">Male</option>
                      <option value="false">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      CV URL <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="cv_url"
                      placeholder="Insert a cv url..."
                      required
                      value={newCandidateData.cv_url}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                {/* Skills and Benefits Row */}
                <div className="row">
                  <div className="col-md-12">
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
                              onChange={(e) =>
                                handleCheckboxChange(e, "skills")
                              }
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
                </div>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Close
              </Button>
              <Button variant="warning" type="submit">
                Add Candidate
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* View User Modal */}
        <Modal
          size="lg"
          centered
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Candidate Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCandidate?.fullname}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={currentCandidate?.email}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        currentCandidate?.dob
                          ? currentCandidate.dob.slice(0, 10)
                          : ""
                      }
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Role</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCandidate?.role?.name}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCandidate?.address}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={currentCandidate?.phoneNumber}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <Form.Control
                      type="text"
                      readOnly
                      value={currentCandidate?.isMale ? "Male" : "Female"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Status</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCandidate?.status?.name}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Skills</Form.Label>
                <Form.Control
                  type="text"
                  value={currentCandidate?.skills?.join(", ")}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">CV</Form.Label>
                <div>
                  <a
                    href={currentCandidate?.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {currentCandidate?.cv_url}
                  </a>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          size="lg"
          centered
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Candidate</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullname"
                      value={currentCandidate?.fullname}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={currentCandidate?.email}
                      onChange={handleEditInputChange}
                      readOnly
                    />
                    {errors.email && (
                      <div className="text-danger">{errors.email}</div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={
                        currentCandidate?.dob
                          ? currentCandidate.dob.slice(0, 10)
                          : ""
                      }
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Role</Form.Label>
                    <Form.Control
                      type="text"
                      name="role"
                      value={currentCandidate?.role?.name}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={currentCandidate?.address}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={currentCandidate?.phoneNumber}
                      onChange={handleEditInputChange}
                    />
                    {errors.phoneNumber && (
                      <div className="text-danger">{errors.phoneNumber}</div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <Form.Select
                      name="isMale"
                      value={currentCandidate?.isMale}
                      onChange={(e) =>
                        setCurrentCandidate({
                          ...currentCandidate,
                          isMale: e.target.value === "true"
                        })
                      }
                    >
                      <option value="true">Male</option>
                      <option value="false">Female</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={
                        currentCandidate?.status?._id ||
                        currentCandidate?.status
                      }
                      onChange={(e) =>
                        setCurrentCandidate({
                          ...currentCandidate,
                          status: e.target.value
                        })
                      }
                    >
                      <option value="671c68e1265bb9e80b7d46e2">
                        Activated
                      </option>
                      <option value="671ecab96110e590a12040cd">
                        Deactivated
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">CV</Form.Label>
                <Form.Control
                  type="text"
                  name="cv_url"
                  value={currentCandidate?.cv_url}
                  onChange={handleEditInputChange}
                />
              </Form.Group>
            </Form>

            <Row>
              {/* Skills and Benefits Row */}
              <div className="row">
                <div className="col-md-12">
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
                            onChange={(e) =>
                              handleCheckboxChangeEdit(e, "skills")
                            }
                            checked={currentCandidate?.skills?.includes(skill)}
                          />
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                </div>
              </div>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleEditCandidate}>
              Edit
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      {/* ToastContainer for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default CandidateManagement;
