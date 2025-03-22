import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Alert,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { Eye, Pencil, Trash, UserPlus, ChevronsUpDown } from "lucide-react";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [snackbarAlert, setSnackbarAlert] = useState(null);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const usersPerPage = 6;

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    dob: "",
    phoneNumber: "",
    gender: "",
    role: "",
    status: "",
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:9999/user/");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      setSnackbarAlert({ type: "danger", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevData) => ({ ...prevData, [name]: value }));
  };
  const validateUserData = (handleType, data) => {
    let newErrors = {};
    // check full name
    if (
      !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(
        handleType == "add" ? data.fullName : data.fullname
      )
    ) {
      newErrors.fullName = "Full name cannot contain numbers.";
    }
    // check phone has number and "+" optional
    if (!/^\d+$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain only numbers.";
    }

    if (!/^\d{10,11}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be between 10 and 11 digits.";
    }
    // validate email and phone
    const existingPhone = users.find(
      (c) => c.phoneNumber === newUser.phoneNumber
    );
    const existingEmail = users.find(
      (c) => c.email.toLowerCase() === newUser.email
    );
    if (existingPhone && handleType == "add") {
      newErrors.phoneNumber = "Phone number already exists. Please try again.";
    }
    if (existingEmail && handleType == "add") {
      newErrors.email = "Email already exists. Please try again.";
    }
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return false;
    }

    setError({});
    return true;
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError({});
    const isValid = validateUserData("add", newUser);
    if (!isValid) {
      return;
    }
    try {
      const statusId = "67bc5a667ddc08921b739694"; // ID for activated status
      const response = await fetch("http://localhost:9999/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: newUser.fullName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          gender: newUser.gender,
          dob: newUser.dob,
          status: statusId, // Send ID in the request
          role: newUser.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      await fetchUsers();
      setSnackbarAlert({
        type: "success",
        message: "User added successfully.",
      });
      setShowAddModal(false);
      setNewUser({
        fullName: "",
        email: "",
        dob: "",
        phoneNumber: "",
        gender: "",
        role: "",
        status: "activated", // Reset to display name
      });
    } catch (err) {
      setSnackbarAlert({ type: "danger", message: err.message });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError({});
    const isValid = validateUserData("edit", currentUser);
    if (!isValid) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:9999/user/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullname: currentUser.fullname,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            gender:
              currentUser.gender || (currentUser.isMale ? "Male" : "Female"),
            dob: currentUser.dob,
            status: currentUser.status?._id || currentUser.status,
            role: currentUser.role, // Send role name directly
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const updatedUser = await response.json();
      console.log("Updated user:", updatedUser); // For debugging

      await fetchUsers(); // Refresh the users list
      setSnackbarAlert({
        type: "success",
        message: "User updated successfully.",
      });
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setSnackbarAlert({ type: "danger", message: err.message });
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:9999/user/${userToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers(); // Refresh the users list
      setSnackbarAlert({
        type: "success",
        message: "User deleted successfully.",
      });
      setShowDeleteModal(false);
    } catch (err) {
      setSnackbarAlert({ type: "danger", message: err.message });
    }
  };

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
    if (sortColumn && users.length > 0) {
      const sortedUsers = [...users].sort((a, b) => {
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

      setUsers(sortedUsers);
    }
  }, [sortColumn, sortOrder, users]);

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (roleFilter === "All" || (user.role?.name || user.role) === roleFilter)
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginatedUsers = filteredUsers.slice(
    currentPage * usersPerPage,
    (currentPage + 1) * usersPerPage
  );

  const toggleStatus = async () => {
    if (!currentUser) return;

    // Fetch logged-in user's ID and role from localStorage
    const loggedInUserId = localStorage.getItem("userId");
    const loggedInUserRole = localStorage.getItem("userRole");

    // Prevent admin from deactivating themselves
    if (currentUser._id === loggedInUserId && loggedInUserRole === "Admin") {
      setSnackbarAlert({
        type: "danger",
        message: "You cannot deactivate your own account.",
      });
      return;
    }

    const newStatusId =
      currentUser.status.name === "activated"
        ? "67bc5a667ddc08921b73969a" // Deactivated ID
        : "67bc5a667ddc08921b739694"; // Activated ID

    try {
      const response = await fetch(
        `http://localhost:9999/user/status/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statusId: newStatusId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user status");
      }

      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      await fetchUsers();

      // Set the success alert and close the modal
      setSnackbarAlert({
        type: "success",
        message: `User ${
          updatedUser.status.name === "activated" ? "activated" : "deactivated"
        } successfully.`,
      });
      setShowDetailsModal(false); // Close the modal here
    } catch (err) {
      console.error("Error updating status:", err);
      setSnackbarAlert({ type: "danger", message: err.message });
    }
  };

  useEffect(() => {
    if (snackbarAlert) {
      const timer = setTimeout(() => {
        setSnackbarAlert(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [snackbarAlert]);

  const handleRoleChange = (e) => {
    setCurrentUser({
      ...currentUser,
      role: e.target.value, // Store the role name directly
    });
  };

  return (
    <div className="d-flex vh-100">
      <Container
        fluid
        className="p-4 vh-100 bg-light"
      >
        {snackbarAlert && (
          <Alert
            variant={snackbarAlert.type === "success" ? "success" : "danger"}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1050,
            }}
          >
            {snackbarAlert.message}
          </Alert>
        )}

        <div className="card p-4 rounded shadow border-0 overflow-auto">
          <Row className="mb-4">
            <Col md={6}>
              <Form.Control
                className="form-control bg-light rounded-pill"
                type="text"
                placeholder="Search Full Name..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                className="form-select bg-light rounded-pill"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Interviewer">Interviewer</option>
                <option value="Recuitment Manager">Recuitment Manager</option>
                <option value="Payroll Manager">Payroll Manager</option>
                <option value="Benefit Manager">Benefit Manager</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Col>
            <Col
              md={3}
              className="text-end"
            >
              <Button
                variant="warning"
                className="rounded-pill"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus
                  className="pb-1"
                  size={20}
                />{" "}
                Add New User
              </Button>
            </Col>
          </Row>

          <Table
            hover
            responsive
          >
            <thead className="table-lighter">
              <tr>
                {[
                  "fullname",
                  "email",
                  "phoneNumber",
                  "role",
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
              {paginatedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullname}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.role?.name || user.role}</td>
                  <td>
                    <span
                      className={`px-2 inline-flex text-sm badge rounded-pill ${
                        user.status?.name === "activated"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {user.status?.name || user.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <Button
                      variant="primary"
                      className="m-1 btn btn-icon btn-pills btn-soft-primary"
                      onClick={() => {
                        setCurrentUser(user);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      variant="warning"
                      className="m-1 btn btn-icon btn-pills btn-soft-warning"
                      onClick={() => {
                        setCurrentUser({
                          ...user,
                          role: user.role?.name || user.role,
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <Pencil size={18} />
                    </Button>

                    <Button
                      variant="danger"
                      className="m-1 btn btn-icon btn-pills btn-soft-danger"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <Trash size={18} />
                    </Button>
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
        </div>

        {/* Add User Modal */}
        <Modal
          centered
          size="lg"
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddUser}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Full Name <span className="text-danger">*</span>{" "}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      placeholder="Type a name..."
                      value={newUser.fullName}
                      onChange={handleNewUserChange}
                      required
                    />
                    {error.fullName && (
                      <div className="text-danger">{error.fullName}</div>
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
                      value={newUser.email}
                      onChange={handleNewUserChange}
                      required
                    />
                    {error.email && (
                      <div className="text-danger">{error.email}</div>
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
                      value={newUser.dob}
                      onChange={handleNewUserChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Gender <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="gender"
                      placeholder="Select a gender..."
                      value={newUser.gender}
                      onChange={handleNewUserChange}
                      required
                    >
                      <option value="">Select a gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
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
                      value={newUser.phoneNumber}
                      onChange={handleNewUserChange}
                      required
                    />
                    {error.phoneNumber && (
                      <div className="text-danger">{error.phoneNumber}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Role <span className="text-danger">*</span>
                    </Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        id="roleInterviewer"
                        label="Interviewer"
                        name="role"
                        value="Interviewer"
                        checked={newUser.role === "Interviewer"}
                        onChange={handleNewUserChange}
                        required
                      />
                      <Form.Check
                        type="radio"
                        id="roleRecruiter"
                        label="Recruitment Manager"
                        name="role"
                        value="Recruitment Manager"
                        checked={newUser.role === "Recruitment Manager"}
                        onChange={handleNewUserChange}
                        required
                      />
                      <Form.Check
                        type="radio"
                        id="roleManager"
                        label="Benefit Manager"
                        name="role"
                        value="Benefit Manager"
                        checked={newUser.role === "Benefit Manager"}
                        onChange={handleNewUserChange}
                        required
                      />
                      <Form.Check
                        type="radio"
                        id="roleAccountant"
                        label="Payroll Manager"
                        name="role"
                        value="Payroll Manager"
                        checked={newUser.role === "Payroll Manager"}
                        onChange={handleNewUserChange}
                        required
                      />
                      {/* <Form.Check
                        type="radio"
                        id="roleAdmin"
                        label="Admin"
                        name="role"
                        value="Admin"
                        checked={newUser.role === "Admin"}
                        onChange={handleNewUserChange}
                        required
                      /> */}
                    </div>
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
              <Button
                variant="warning"
                type="submit"
              >
                Add User
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          centered
          size="lg"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditUser}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser?.fullname}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          fullname: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={currentUser?.email}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          email: e.target.value,
                        })
                      }
                      disabled
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        currentUser?.dob
                          ? new Date(currentUser.dob)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          dob: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={currentUser?.phoneNumber}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          phoneNumber: e.target.value,
                        })
                      }
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Role <span className="text-danger">*</span>
                    </Form.Label>
                    <div>
                      {[
                        "Interviewer",
                        "Recruitment Manager",
                        "Benefit Manager",
                        "Payroll Manager",
                        "Candidate",
                        "Admin",
                      ].map((roleOption) => (
                        <Form.Check
                          key={roleOption}
                          type="radio"
                          label={roleOption}
                          name="role"
                          value={roleOption}
                          checked={
                            currentUser?.role === roleOption ||
                            currentUser?.role?.name === roleOption
                          }
                          onChange={handleRoleChange}
                          required
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </Button>
              <Button
                variant="warning"
                type="submit"
              >
                Edit User
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
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser?.fullname}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={currentUser?.email}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Role</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser?.role?.name || currentUser?.role}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Status</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser?.status?.name || currentUser?.status}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={currentUser?.phoneNumber}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date of Birth</Form.Label>
                    <Form.Control
                      type="text"
                      value={
                        currentUser?.dob
                          ? new Date(currentUser.dob).toLocaleDateString()
                          : ""
                      }
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentUser?.isMale ? "Male" : "Female"}
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
            <Button
              variant={
                currentUser?.status?.name === "activated" ||
                currentUser?.status === "activated"
                  ? "danger"
                  : "success"
              }
              onClick={toggleStatus}
            >
              {currentUser?.status?.name === "activated" ||
              currentUser?.status === "activated"
                ? "Deactivate"
                : "Activate"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete User Modal */}
        <Modal
          centered
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Delete User</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteUser}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      {/* ToastContainer for notifications */}
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

export default UserManagement;
