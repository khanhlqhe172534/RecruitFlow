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
import { Eye, CheckCircle, XCircle, ChevronsUpDown } from "lucide-react";

function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarAlert, setSnackbarAlert] = useState(null);
  const requestsPerPage = 6;

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:9999/change-requests/pending-requests"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setSnackbarAlert({ type: "danger", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSort = useCallback(
    (column) => {
      setSortColumn(column);
      setSortOrder((prevOrder) =>
        column === sortColumn ? (prevOrder === "asc" ? "desc" : "asc") : "asc"
      );
    },
    [sortColumn]
  );

  useEffect(() => {
    if (sortColumn && requests.length > 0) {
      const sortedRequests = [...requests].sort((a, b) => {
        let aValue = a[sortColumn] || "";
        let bValue = b[sortColumn] || "";

        if (sortColumn === "user") {
          aValue = a.user.fullname.toLowerCase();
          bValue = b.user.fullname.toLowerCase();
        }

        if (typeof aValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });

      setRequests(sortedRequests);
    }
  }, [sortColumn, sortOrder, requests]);

  const handleStatusChange = async (requestId, status) => {
    try {
      const response = await fetch(
        `http://localhost:9999/change-requests/approve-request/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      await fetchRequests();
      setSnackbarAlert({
        type: "success",
        message: `Request ${status.toLowerCase()} successfully.`,
      });
    } catch (err) {
      setSnackbarAlert({ type: "danger", message: err.message });
    }
  };

  const filteredRequests = requests.filter((req) =>
    req.user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const paginatedRequests = filteredRequests.slice(
    currentPage * requestsPerPage,
    (currentPage + 1) * requestsPerPage
  );
  useEffect(() => {
    if (snackbarAlert) {
      const timer = setTimeout(() => {
        setSnackbarAlert(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [snackbarAlert]);

  return (
    <div className="d-flex vh-100">
      <Container
        fluid
        className="p-4 vh-100 bg-light"
      >
        {snackbarAlert && (
          <Alert
            variant={snackbarAlert.type}
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
                placeholder="Search User Name..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>

          <Table
            hover
            responsive
          >
            <thead className="table-lighter">
              <tr>
                {["user", "requestedChanges", "status", "action"].map(
                  (column) => (
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
                              ? "text-primary"
                              : "text-muted"
                          }`}
                        />
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {paginatedRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.user.fullname}</td>
                  <td>{Object.keys(request.requestedChanges).join(", ")}</td>
                  <td>
                    <span
                      className={`px-2 badge rounded-pill ${
                        request.status === "Pending"
                          ? "bg-warning"
                          : request.status === "Approved"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      className="m-1"
                      onClick={() => {
                        setCurrentRequest(request);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </Button>
                    {request.status === "Pending" && (
                      <>
                        <Button
                          variant="success"
                          className="m-1"
                          onClick={() =>
                            handleStatusChange(request._id, "Approved")
                          }
                        >
                          <CheckCircle size={18} />
                        </Button>
                        <Button
                          variant="danger"
                          className="m-1"
                          onClick={() =>
                            handleStatusChange(request._id, "Rejected")
                          }
                        >
                          <XCircle size={18} />
                        </Button>
                      </>
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
        </div>

        {/* Request Details Modal */}
        <Modal
          centered
          size="lg"
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Request Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentRequest && (
              <>
                <p>
                  <strong>User:</strong> {currentRequest.user.fullname}
                </p>
                <p>
                  <strong>Changes Requested:</strong>
                </p>
                <ul>
                  {Object.entries(currentRequest.requestedChanges).map(
                    ([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    )
                  )}
                </ul>
                <p>
                  <strong>Status:</strong> {currentRequest.status}
                </p>
              </>
            )}
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
      </Container>
    </div>
  );
}

export default RequestManagement;
