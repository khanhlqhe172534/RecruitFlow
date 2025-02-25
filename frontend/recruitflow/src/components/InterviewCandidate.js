import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ButtonBootstrap from "react-bootstrap/Button";

import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  TextField,
  Divider,
  MenuItem,
} from "@mui/material";
import Modal from "react-bootstrap/Modal";
import axios from "axios";

import CheckIcon from "@mui/icons-material/Check";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast

import {
  AccessTime,
  Link,
  Person,
  Email,
  Phone,
  Description,
} from "@mui/icons-material";

function InterviewCandidate(props) {
  const candidate = props.candidate;
  const formattedDob = props.formattedDob;
  return (
    <Card variant="outlined" style={{ borderRadius: "15px", padding: "16px" }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold" }}
        gutterBottom
        className="text-center"
      >
        Candidate Information
      </Typography>
      <Divider className="mb-3" />
      <div className="row ps-4 pe-4 pt-2">
        <div className="col-6 pe-4">
          <div className="row">
            <Card
              variant="outlined"
              className="p-3 m-0"
              style={{
                borderRadius: "15px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <AccountCircleOutlinedIcon
                  className="p-1"
                  sx={{
                    fontSize: "51px",
                    color: "#3a6cf1",
                    marginRight: "8px",
                  }} // Add margin to space out the icon
                />
                <div>
                  <p className="p-0 m-0">
                    <strong>Name</strong>
                  </p>
                  <p className="p-0 m-0">{candidate.fullname}</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="row mt-4">
            <Card
              variant="outlined"
              className="p-3 m-0"
              style={{
                borderRadius: "15px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <PhoneInTalkOutlinedIcon
                  className="p-1"
                  sx={{
                    fontSize: "51px",
                    color: "#fee010",
                    marginRight: "8px", // Add margin to space out the icon
                  }}
                />
                <div>
                  <p className="p-0 m-0">
                    <strong>Phone</strong>
                  </p>
                  <p className="p-0 m-0">{candidate.phoneNumber}</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="row mt-4">
            <Card
              variant="outlined"
              className="p-3 m-0"
              style={{
                borderRadius: "15px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <MarkEmailUnreadOutlinedIcon
                  className="p-1"
                  sx={{
                    fontSize: "51px",
                    color: "#ec1f26",
                    marginRight: "8px",
                  }}
                />
                <div>
                  <p className="p-0 m-0">
                    <strong>Email</strong>
                  </p>
                  <p className="p-0 m-0" style={{ fontSize: "13px" }}>
                    {candidate.email}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="col-6 pe-4">
          <div className="row">
            <Card
              variant="outlined"
              className="p-3 m-0"
              style={{
                borderRadius: "15px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <AssignmentIndOutlinedIcon
                  className="p-1"
                  sx={{
                    fontSize: "51px",
                    color: "#ca8273",
                    marginRight: "8px", // Add margin to space out the icon
                  }}
                />
                <div>
                  <p className="p-0 m-0">
                    <strong>CV</strong>
                  </p>
                  <p className="p-0 m-0">
                    <a
                      href={candidate.cv} // Use curly braces to insert the variable correctly
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Click here
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="row mt-4">
            <Card
              variant="outlined"
              className="p-3 m-0"
              style={{
                borderRadius: "15px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <CakeOutlinedIcon
                  className="p-1"
                  sx={{
                    fontSize: "51px",
                    color: "#e6b673",
                    marginRight: "8px", // Add margin to space out the icon
                  }}
                />
                <div>
                  <p className="p-0 m-0">
                    <strong>Dob</strong>
                  </p>
                  <p className="p-0 m-0">{formattedDob}</p>{" "}
                  {/* Ensure formattedDob is in dd/mm/yyyy format */}
                </div>
              </div>
            </Card>
          </div>
          <div className="row mt-4 mb-4">
            <Card
              variant="outlined"
              className="p-3 m-0"
              style={{
                borderRadius: "15px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <HomeOutlinedIcon
                  className="p-1"
                  sx={{
                    fontSize: "51px",
                    color: "#63bf98", // Customize the icon color
                    marginRight: "8px", // Add margin to space out the icon
                  }}
                />
                <div>
                  <p className="p-0 m-0">
                    <strong>Address</strong>
                  </p>
                  <p className="p-0 m-0" style={{ fontSize: "13px" }}>
                    {candidate.address}
                  </p>{" "}
                  {/* Ensure candidate.address is properly formatted */}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default InterviewCandidate;
