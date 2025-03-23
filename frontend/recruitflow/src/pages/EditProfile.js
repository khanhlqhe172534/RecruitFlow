import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Table,
  Badge,
} from "react-bootstrap";
import { TextField, MenuItem } from "@mui/material";
import { Delete, Edit, Send, Visibility } from "@mui/icons-material";

function EditProfile() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [snackbarAlert, setSnackbarAlert] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const userId = localStorage.getItem("userId"); // Assuming user ID is stored in localStorage
  const userRole = localStorage.getItem("userRole"); // Assuming user ID is stored in localStorage

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let response;
        if (userRole.toLowerCase() == "candidate") {
          response = await fetch(`http://localhost:9999/candidate/${userId}`);
        } else {
          response = await fetch(`http://localhost:9999/user/by-id/${userId}`);
        }
        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data = await response.json();
        setUser(data);
        setUpdatedUser(data);
      } catch (error) {
        setSnackbarAlert({ type: "danger", message: error.message });
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch user's change requests
  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:9999/change-requests/user/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch requests");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        setSnackbarAlert({ type: "danger", message: error.message });
      }
    };

    fetchUserRequests();
  }, [userId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit change request
  const handleSubmitRequest = async () => {
    try {
      const response = await fetch(
        "http://localhost:9999/change-requests/request-change",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            requestedChanges: updatedUser,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit request");

      const newRequest = await response.json(); // Get the newly created request
      setRequests((prevRequests) => [...prevRequests, newRequest]);
      setSnackbarAlert({
        type: "success",
        message: "Change request submitted!",
      });
      setShowEditModal(false);
    } catch (error) {
      setSnackbarAlert({ type: "danger", message: error.message });
    }
  };
  // DELETE request function
  const handleDeleteRequest = async () => {
    try {
      const response = await fetch(
        `http://localhost:9999/change-requests/${requestToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete request");

      setRequests((prevRequests) =>
        prevRequests.filter((req) => req._id !== requestToDelete)
      );
      setSnackbarAlert({
        type: "success",
        message: "Request deleted successfully!",
      });
      setShowDeleteModal(false);
      setRequestToDelete(null);
    } catch (error) {
      setSnackbarAlert({ type: "danger", message: error.message });
    }
  };
  const hasUserChanged = () => {
    return Object.keys(updatedUser).some((key) => {
      const originalValue =
        typeof user[key] === "string" ? user[key].trim() : user[key];
      const newValue =
        typeof updatedUser[key] === "string"
          ? updatedUser[key].trim()
          : updatedUser[key];

      return originalValue !== newValue;
    });
  };
  useEffect(() => {
    if (snackbarAlert) {
      const timer = setTimeout(() => {
        setSnackbarAlert(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [snackbarAlert]);
  return (
    <Container className="py-5">
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

      {user ? (
        <Card className="shadow-lg p-4">
          <h3 className="text-center mb-4">My Profile</h3>
          <Row>
            <Col md={6}>
              <p>
                <strong>Full Name:</strong> {user.fullname}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone Number:</strong> {user.phoneNumber}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(user.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Gender:</strong> {user.isMale ? "Male" : "Female"}
              </p>
              <p>
                <strong>Role:</strong> {user.role?.name || "N/A"}
              </p>
            </Col>
          </Row>
          <div className="text-center mt-4">
            <Button
              variant="warning"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="me-2" /> Request Profile Change
            </Button>
          </div>
        </Card>
      ) : (
        <p>Loading profile...</p>
      )}

      {/* Past Change Requests */}
      <Card className="mt-5 shadow-lg p-4">
        <h4 className="mb-3">My Change Requests</h4>
        <Table
          hover
          responsive
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req, index) => (
                <tr key={req._id}>
                  <td>{index + 1}</td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Badge
                      bg={
                        req.status === "Pending"
                          ? "warning"
                          : req.status === "Approved"
                          ? "success"
                          : "danger"
                      }
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setCurrentRequest(req);
                        setShowRequestDetails(true);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </Button>
                    {req.status !== "Approved" && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => {
                          setRequestToDelete(req._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center"
                >
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        centered
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <TextField
              fullWidth
              label="Full Name"
              name="fullname"
              value={updatedUser.fullname || ""}
              onChange={handleInputChange}
              className="mb-3"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={updatedUser.phoneNumber || ""}
              onChange={handleInputChange}
              className="mb-3"
            />
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              name="dob"
              value={updatedUser.dob ? updatedUser.dob.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mb-3"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Gender"
              name="isMale"
              value={updatedUser.isMale ? "Male" : "Female"}
              onChange={(e) =>
                setUpdatedUser({
                  ...updatedUser,
                  isMale: e.target.value === "Male",
                })
              }
              className="mb-3"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitRequest}
            disabled={!hasUserChanged()}
          >
            <Send className="me-2" /> Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        centered
        show={showRequestDetails}
        onHide={() => setShowRequestDetails(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentRequest && (
            <>
              <p>
                <strong>Requested Changes:</strong>
              </p>
              <ul>
                {Object.entries(currentRequest.requestedChanges).map(
                  ([key, value]) => {
                    if (key === "isMale") {
                      return (
                        <li key={key}>
                          <strong>Gender: </strong> {value ? "Male" : "Female"}
                        </li>
                      );
                    }
                    return (
                      <li key={key}>
                        <strong>{key}: </strong>
                        {key !== "dob"
                          ? value
                          : new Date(value).toLocaleDateString()}
                      </li>
                    );
                  }
                )}
              </ul>
              <p>
                <strong>Status: </strong>
                <span
                  className={`badge px-2 py-1 rounded-pill ${
                    currentRequest.status === "Pending"
                      ? "bg-warning text-dark"
                      : currentRequest.status === "Approved"
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {currentRequest.status}
                </span>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRequestDetails(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Confirm delete modal */}
      <Modal
        centered
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this request? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteRequest}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default EditProfile;
