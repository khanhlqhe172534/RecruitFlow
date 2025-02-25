import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import { Eye, Pencil, UserPlus, ChevronsUpDown } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

function CandidateManagement() {
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
  });
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
  }, []);

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
  }, [sortColumn, sortOrder, candidate]);

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
  const validateCandidateData = (data) => {
    // validate email and phone
    const existingCandidate = candidate.find(
      (c) =>
        c.email.toLowerCase() === newCandidateData.email ||
        c.phoneNumber === newCandidateData.phoneNumber
    );

    if (existingCandidate) {
      return {
        isValid: false,
        error: "Email or phone number already exists. Please try again.",
      };
    }

    // check full name
    if (/\d/.test(data.fullname)) {
      return {
        isValid: false,
        error: "Full name cannot contain numbers.",
      };
    }

    // check phone has number and "+" optional
    if (!/^[+]?\d+$/.test(data.phoneNumber)) {
      return {
        isValid: false,
        error: 'Phone number must contain only numbers and "+" (optional).',
      };
    }

    if (!/^[+]?\d{10,11}$/.test(data.phoneNumber)) {
      return {
        isValid: false,
        error: "Phone number must be between 10 and 11 digits.",
      };
    }

    // if all information is valid
    return {
      isValid: true,
      error: null,
    };
  };

  // Handle form submission
  const handleAddCandidate = (e) => {
    e.preventDefault();

    if (!hasRecruiterPermission) {
      alert("You don't have permission to add candidates");
      return;
    }
    const { isValid, error } = validateCandidateData(newCandidateData);

    if (!isValid) {
      alert(error);
      return;
    }
    // Send data to backend
    fetch(`http://localhost:9999/candidate/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCandidateData),
    })
      .then((res) => res.json())
      .then((data) => {
        // Refresh the candidate list
        setCandidate([...candidate, data]);
        setShowAddModal(false);
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCandidate({ ...currentCandidate, [name]: value });
  };
  //Validate
  const validateEditData = (data) => {
    // validate email and phone
    const existingCandidate = candidate.find(
      (c) =>
        c.email.toLowerCase() === currentCandidate.email ||
        c.phoneNumber === currentCandidate.phoneNumber
    );

    if (existingCandidate) {
      return {
        isValid: false,
        error: "Email or phone number already exists. Please try again.",
      };
    }

    // check full name
    if (/\d/.test(data.fullname)) {
      return {
        isValid: false,
        error: "Full name cannot contain numbers.",
      };
    }

    // check phone has number and "+" optional
    if (!/^[+]?\d+$/.test(data.phoneNumber)) {
      return {
        isValid: false,
        error: 'Phone number must contain only numbers and "+" (optional).',
      };
    }

    if (!/^[+]?\d{10,11}$/.test(data.phoneNumber)) {
      return {
        isValid: false,
        error: "Phone number must be between 10 and 11 digits.",
      };
    }

    // if all information is valid
    return {
      isValid: true,
      error: null,
    };
  };
  const handleEditCandidate = (e) => {
    e.preventDefault();
    if (!hasRecruiterPermission) {
      alert("You don't have permission to edit candidates");
      return;
    }
    const { isValid, error } = validateEditData(currentCandidate);

    if (!isValid) {
      alert(error);
      return;
    }
    // request to backend
    fetch(`http://localhost:9999/candidate/update/${currentCandidate._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentCandidate), // data is updated
    })
      .then((res) => res.json())
      .then((data) => {
        // Update list when the data is updated success
        const updatedCandidates = candidate.map((c) =>
          c._id === data._id ? data : c
        );
        setCandidate(updatedCandidates);
        setShowEditModal(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="d-flex vh-100">
      <Container fluid className="p-4 vh-100 bg-light">
        <Row className="card p-4 rounded shadow border-0 overflow-auto">
          <Row className="mb-4">
            <Col md={6}>
              <Form.Control
                className="form-control bg-light rounded-pill"
                type="text"
                placeholder="Search Full Name..."
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
            </Col>
            <Col md={3}></Col>
            <Col md={3} className="text-end">
              {hasRecruiterPermission && (
                <Button
                  variant="warning"
                  className="rounded-pill"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus className="pb-1" size={20} /> Add Candidate
                </Button>
              )}
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
                    "action",
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
                            setShowEditModal(true);
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
                          isMale: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">Male</option>
                      <option value="false">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
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
                      disabled
                    />
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
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <Form.Select
                      name="isMale"
                      value={currentCandidate?.isMale}
                      onChange={(e) =>
                        setCurrentCandidate({
                          ...currentCandidate,
                          isMale: e.target.value === "true",
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
                          status: e.target.value,
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
            </Form>
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
    </div>
  );
}

export default CandidateManagement;
