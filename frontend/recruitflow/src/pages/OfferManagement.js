import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/a.css";
import "../styles/offer.css";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get("http://localhost:9999/offer");
        setOffers(response.data.offers || []);
      } catch (error) {
        console.error("Error fetching offers:", error);
        toast.error("Failed to load data.");
      }
    };
    fetchOffers();
  }, []);

  const handleViewClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  const handleStatusChange = (status) => {
    setFilterStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const statusMapping = {
    "67bc5a667ddc08921b739695": {
      text: "Waiting for Approval",
      color: "#FFC107",
      borderColor: "#FFB300",
    },
    "67bc5a667ddc08921b739697": {
      text: "Open",
      color: "#007BFF",
      borderColor: "#0056b3",
    },
    "67c7f361e825bf941d636e07": {
      text: "Accepted",
      color: "#28a745",
      borderColor: "#1e7e34",
    },
    "67bc5a667ddc08921b739698": {
      text: "Closed (Expired)",
      color: "#6C757D",
      borderColor: "#495057",
    },
    "67c7f374e825bf941d636e09": {
      text: "Rejected",
      color: "#DC3545",
      borderColor: "#c82333",
    },
    "67bc5a667ddc08921b739696": {
      text: "Cancel",
      color: "rgb(108, 117, 125)",
      borderColor: "rgb(108, 117, 125)",
    },
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.interview?.candidate?.fullname
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus.length
      ? filterStatus.includes(offer.status)
      : true;
    return matchesSearch && matchesStatus;
  });

  const sortedOffers = [...filteredOffers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="d-flex vh-100">
      <div className="container-fluid p-4 vh-100 bg-light">
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
                    <h4 className="mb-1">Search Offer</h4>{" "}
                  </div>
                  <div className="col-md-9">
                    <div className="search-bar">
                      <div id="search" className="menu-search mb-0">
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control bg-light border-2 rounded-pill ps-5"
                            placeholder="Search by Candidate Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                    {filteredOffers.length} Offer found
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mt-4">
            <div className="card mb-3 shadow-sm bg-white">
              <div className="card-body">
                <h6 className="mb-2">Filter by Status</h6>
                {Object.entries(statusMapping).map(([key, { text }]) => (
                  <div className="form-check" key={key}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={key}
                      checked={filterStatus.includes(key)}
                      onChange={() => handleStatusChange(key)}
                    />
                    <label className="form-check-label">{text}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="row overflow-auto"
          style={{
            maxHeight: "calc(85vh - 200px)",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {sortedOffers.length > 0 ? (
            sortedOffers.map((offer) => (
              <div key={offer._id} className="col-md-4 mb-4">
                <div
                  className="card h-100 shadow-sm rounded p-3 position-relative"
                  style={{
                    backgroundColor: "#f9f9f9",
                    borderLeft: `5px solid ${
                      statusMapping[offer.status]?.borderColor || "#6C757D"
                    }`,
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="mb-3">
                      <p
                        className="text-muted mb-1"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {offer.offerType ? offer.offerType : "N/A"}
                      </p>
                      <h5
                        className="card-title mb-2"
                        style={{ fontSize: "1.5rem", fontWeight: "600" }}
                      >
                        {offer.interview?.job?.job_name || "Job Title"}
                      </h5>
                    </div>

                    <div className="footer-section mt-auto d-flex align-items-center justify-content-between">
                      <div className="d-flex flex-column">
                        <span
                          className="text-muted"
                          style={{ fontSize: "1rem", fontWeight: "bold" }}
                        >
                          {offer.interview?.candidate?.fullname ||
                            "Candidate Name Not Available"}
                        </span>
                        <span
                          className="badge mt-1"
                          style={{
                            fontSize: "0.7rem",
                            backgroundColor:
                              statusMapping[offer.status]?.color || "#6C757D",
                            color: "white",
                            padding: "3px 8px",
                            borderRadius: "10px",
                            alignSelf: "flex-start",
                          }}
                        >
                          {statusMapping[offer.status]?.text || "Unknown"}
                        </span>
                      </div>
                      <button
                        className="btn btn-dark rounded-pill"
                        style={{ fontSize: "0.8rem" }}
                        onClick={() => handleViewClick(offer._id)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No offers found</p>
            </div>
          )}
        </div>

        {/* ToastContainer for notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}

export default OfferManagement;
