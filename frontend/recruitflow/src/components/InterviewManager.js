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

function InterviewManager(props) {
  const interviewer = props.rm;
  return (
    <Card variant="outlined" style={{ borderRadius: "15px", padding: "16px" }}>
      <Typography variant="h6" gutterBottom>
        Manager Information
      </Typography>
      <div className="mb-3">
        <Person />
        <span className="ms-2">
          <strong>Manager Name:</strong> {interviewer.fullname}
        </span>
      </div>
      <div className="mb-3">
        <Person />
        <span className="ms-2">
          <strong>Email:</strong> {interviewer.email}
        </span>
      </div>
      <div className="mb-3">
        <Person />
        <span className="ms-2">
          <strong>Phone:</strong> {interviewer.phoneNumber}
        </span>
      </div>
      <div className="mb-3">
        <Person />
        <span className="ms-2">
          <strong>Sex:</strong> {interviewer.isMale ? "Male" : "Female"}
        </span>
      </div>
      <div className="mb-3">
        <Person />
        <span className="ms-2">
          <strong>Dob</strong> {interviewer.dob}
        </span>
      </div>
    </Card>
  );
}

export default InterviewManager;
