import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideBar from "../components/reusable/Sidebar";
import { Card, Typography } from "@mui/material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OfferDetail() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/offer/${id}`);
        setOffer(response.data);
      } catch (error) {
        console.error("Error fetching offer:", error);
        toast.error("Failed to load offer details.");
      }
    };
    fetchOffer();
  }, [id]);

  if (!offer) return <p>Loading offer details...</p>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const job = offer.interview?.job;
  const candidate = offer.interview?.candidate;
  const interviewer = offer.interview?.interviewer;

  return (
    <div className="d-flex vh-100">
      <SideBar />
      <div
        className="container-fluid p-4 vh-100"
        style={{
          backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <div className="row mb-3">
          <div className="col-9">
            <Typography variant="h5">
              Offer Details for {offer.offerType || `Offer/${id}`}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Contract for {candidate?.fullname || "N/A"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Status: {offer.status?.name || "Draft"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Salary: {offer.salary ? `$${offer.salary}` : "Not Available"}
            </Typography>
          </div>
        </div>

        {/* Contract Time Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Contract Time
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Start Date
              </Typography>
              <Typography variant="body1" style={{ fontWeight: "bold" }}>
                {formatDate(offer.offerFrom)}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Expected End Date
              </Typography>
              <Typography variant="body1" style={{ fontWeight: "bold" }}>
                {offer.offerTo ? formatDate(offer.offerTo) : "Not Filled"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Interview Information Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Interview Information
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Date
              </Typography>
              <Typography variant="body1">
                {formatDate(offer.interview?.interview_date) || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Interviewer
              </Typography>
              <Typography variant="body1">
                {interviewer?.fullname || "N/A"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Job Information Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Job Information
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Job Name
              </Typography>
              <Typography variant="body1">{job?.job_name || "N/A"}</Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Level
              </Typography>
              <Typography variant="body1">{job?.levels || "N/A"}</Typography>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Experience
              </Typography>
              <Typography variant="body1">
                {job?.experience || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Working Type
              </Typography>
              <Typography variant="body1">
                {job?.working_type || "N/A"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Candidate Information Section */}
        <Card className="mb-4 p-3">
          <Typography variant="h6" gutterBottom>
            Candidate Information
          </Typography>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography variant="body1">
                {candidate?.fullname || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">
                {candidate?.email || "N/A"}
              </Typography>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Phone
              </Typography>
              <Typography variant="body1">
                {candidate?.phoneNumber || "N/A"}
              </Typography>
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Address
              </Typography>
              <Typography variant="body1">
                {candidate?.address || "N/A"}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}

export default OfferDetail;
