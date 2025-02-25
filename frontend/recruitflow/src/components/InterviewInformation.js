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

function InterviewInformation(props) {
  const interview = props.interview;
  return (
    <Card variant="outlined" style={{ borderRadius: "15px", padding: "16px" }}>
      <Typography variant="h6" gutterBottom>
        Interview Information
      </Typography>
      <div className="mb-3">
        <AccessTime />
        <span className="ms-2">
          <strong>Date:</strong>{" "}
          {new Date(interview.interview_date).toLocaleString()}
        </span>
      </div>
      <div className="mb-3">
        <Link />
        <span className="ms-2">
          <strong>Meeting Link:</strong>
          <a
            href={interview.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary ms-1"
          >
            {interview.meeting_link}
          </a>
        </span>
      </div>
      <div className="mb-3">
        <Person />
        <span className="ms-2">
          <strong>Status:</strong> {interview.status.name}
        </span>
      </div>
      <div className="mb-3">
        <Description />
        <span className="ms-2">
          <strong>Result:</strong> {interview.result}
        </span>
      </div>
      <div className="mb-3">
        <Description />
        <span className="ms-2">
          <strong>Note:</strong> {interview.note}
        </span>
      </div>
    </Card>
  );
}

export default InterviewInformation;
