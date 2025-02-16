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
import { Eye, Pencil, Trash, UserPlus, ChevronsUpDown } from "lucide-react";
import SideBar from "../components/reusable/Sidebar";
import UserBreadcrumb from "../components/Breadcrumbs/UserBreadcrumb";
import { PermissionHandler } from "./PermissionHandler";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    dob: "",
    phoneNumber: "",
    gender: "",
    role: "",
    status: "activated", // default to activated
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
      setAlert({ type: "danger", message: err.message });
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
 

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const statusId = "671c68e1265bb9e80b7d46e2"; // ID for activated status
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
      setAlert({ type: "success", message: "User added successfully." });
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
      setAlert({ type: "danger", message: err.message });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
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
      setAlert({ type: "success", message: "User updated successfully." });
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setAlert({ type: "danger", message: err.message });
    }
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
      setAlert({ type: "success", message: "User deleted successfully." });
      setShowDeleteModal(false);
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    }
  };

  

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
      setAlert({
        type: "danger",
        message: "You cannot deactivate your own account.",
      });
      return;
    }

    const newStatusId =
      currentUser.status.name === "activated"
        ? "671ecab96110e590a12040cd" // Deactivated ID
        : "671c68e1265bb9e80b7d46e2"; // Activated ID

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
      setAlert({
        type: "success",
        message: `User ${
          updatedUser.status.name === "activated" ? "activated" : "deactivated"
        } successfully.`,
      });
      setShowDetailsModal(false); // Close the modal here
    } catch (err) {
      console.error("Error updating status:", err);
      setAlert({ type: "danger", message: err.message });
    }
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleRoleChange = (e) => {
    setCurrentUser({
      ...currentUser,
      role: e.target.value, // Store the role name directly
    });
  };

  return (
    <PermissionHandler>
      <div className="d-flex vh-100">
        <SideBar />
        <Container fluid className="p-4 vh-100 bg-light">
          <UserBreadcrumb />

          {alert && (
            <Alert
              variant={alert.type === "success" ? "success" : "danger"}
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 1050,
              }}
            >
              {alert.message}
            </Alert>
          )}

          {/* asdfsadfsad */}
{/* asd qweqw qweqw
sadsd
sdafasd
q2312
2134 */}
          {/* Add User Modal */}
          <Modal
            centered
            size="lg"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
          >
            <Row>asfsadf</Row>
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
                          label="Recruiter"
                          name="role"
                          value="Recruiter"
                          checked={newUser.role === "Recruiter"}
                          onChange={handleNewUserChange}
                          required
                        />
                        <Form.Check
                          type="radio"
                          id="roleCandidate"
                          label="Candidate"
                          name="role"
                          value="Candidate"
                          checked={newUser.role === "Candidate"}
                          onChange={handleNewUserChange}
                          required
                        />
                        <Form.Check
                          type="radio"
                          id="roleManager"
                          label="Manager"
                          name="role"
                          value="Manager"
                          checked={newUser.role === "Manager"}
                          onChange={handleNewUserChange}
                          required
                        />
                        <Form.Check
                          type="radio"
                          id="roleAccountant"
                          label="Accountant"
                          name="role"
                          value="Accountant"
                          checked={newUser.role === "Accountant"}
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
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Status </Form.Label>
                      <Form.Control
                        type="text"
                        name="status"
                        value={newUser.status} // This will now show "activated"
                        readOnly
                        className="bg-light"
                      />
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
                      <Form.Label className="fw-bold">
                        Full Name <span className="text-danger">*</span>
                      </Form.Label>
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
                      <Form.Label className="fw-bold">
                        Email <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={currentUser?.email}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        Date of Birth <span className="text-danger">*</span>
                      </Form.Label>
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
                      <Form.Label className="fw-bold">
                        Phone Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        value={currentUser?.phoneNumber}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            phoneNumber: e.target.value,
                          })
                        }
                        required
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
                          "Recruiter",
                          "Manager",
                          "Accountant",
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
                <Button variant="warning" type="submit">
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
              <Button variant="danger" onClick={confirmDeleteUser}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </PermissionHandler>
  );
}

export default UserManagement;
