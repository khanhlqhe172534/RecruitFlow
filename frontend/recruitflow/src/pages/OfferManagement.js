import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/a.css";
import "../styles/offer.css";
import { useNavigate } from "react-router-dom";

function OfferManagement() {
  const [offers, setOffers] = useState([]);
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

  return (
    <div className="d-flex vh-100">
      <div className="container-fluid p-4 vh-100 bg-light">
        <div className="row">
          {offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer._id} className="col-md-4 mb-4">
                <div
                  className="card h-100 shadow-sm rounded p-3 position-relative"
                  style={{ backgroundColor: "#f9f9f9" }}
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
                        {offer.interview && offer.interview.job
                          ? offer.interview.job.job_name
                          : "Job Title"}
                      </h5>
                    </div>

                    <div className="footer-section mt-auto d-flex align-items-center justify-content-between">
                      <span
                        className="text-muted"
                        style={{ fontSize: "1rem", fontWeight: "bold" }}
                      >
                        {offer.interview && offer.interview.candidate
                          ? offer.interview.candidate.fullname
                          : "Candidate Name Not Available"}
                      </span>
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
