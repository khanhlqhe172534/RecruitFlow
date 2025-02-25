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

function InterviewJob(props) {
  const job = props.job;
  const handleRedirectJob = () => {
    window.location.href = `/job/${job._id}`;
  };

  return (
    <>
      <Card
        variant="outlined"
        style={{ borderRadius: "15px", padding: "16px" }}
      >
        <Typography variant="h6" gutterBottom onClick={handleRedirectJob}>
          Job Information
        </Typography>
        <div className="mb-3">
          <Person />
          <span className="ms-2">
            <strong>Job Name:</strong> {job.job_name}
          </span>
        </div>
        <div className="mb-3">
          <Person />
          <span className="ms-2">
            <strong>Level:</strong> {job.levels}
          </span>
        </div>
        <div className="mb-3">
          <Person />
          <span className="ms-2">
            <strong>Experience:</strong> {job.experience}
          </span>
        </div>
        <div className="mb-3">
          <Person />
          <span className="ms-2">
            <strong>Working Type:</strong> {job.working_type}
          </span>
        </div>
        <div className="mb-3">
          <Person />
          <span className="ms-2">
            <strong>Salary Range:</strong> ${job.salary_min} - ${job.salary_max}
          </span>
        </div>
        <div className="mb-3">
          <strong>Benefits:</strong>
          <ul>
            {job.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
        <div className="mb-3">
          <strong>Skills Required:</strong>
          <ul>
            {job.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      </Card>
    </>
  );
}

export default InterviewJob;
