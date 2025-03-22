import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import Sidebar from "../components/reuseable/Sidebar";
import moment from "moment";
import CustomToolbar from "../components/CustomToolbar"; // Import your custom toolbar
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles
import "../styles/calendar.css";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
const localizer = momentLocalizer(moment);

function InterviewManagement() {
  const [myEvents, setMyEvents] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", id: "", role: "" });

  // Load user info from localStorage when the component mounts
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    console.log(userEmail, userRole, userId);
    setUser({ email: userEmail, id: userId, role: userRole });
  }, []);

  // Function to fetch interviews based on user role
  const fetchInterviews = async () => {
    try {
      let apiUrl = "http://localhost:9999/interview";

      // Check if the user is an interviewer and adjust the API endpoint
      if (user.role === "Interviewer") {
        apiUrl = `http://localhost:9999/interview/interviewer/${user.id}`;
      }
      
      // Check if the user is an candidate and adjust the API endpoint
      if (user.role === "Candidate") {
        apiUrl = `http://localhost:9999/interview/candidate/${user.id}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      const events = data.map((interview) => ({
        id: interview._id,
        title: `${interview.candidate.fullname} - ${moment(
          interview.interview_date
        ).format("HH:mm")}`, // Hiển thị tên + giờ phỏng vấn
        start: new Date(interview.interview_date),
        end: new Date(interview.interview_date),
        interview,
      }));

      setMyEvents(events);
      console.log(events);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews. Please try again.");
    }
  };

  // Fetch interviews on component load and when user changes
  useEffect(() => {
    if (user.role) {
      fetchInterviews();
    }
  }, [user]);

  const handleSelectEvent = (event) => {
    navigate(`/interview/${event.id}`);
  };

  return (
    <div className="d-flex vh-100 ">
      <div className="container-fluid p-3 vh-100 d-flex flex-column">
        {/* Tiêu đề + Breadcrumbs */}
        <div
          className="mb-3"
          style={{ width: "100%", maxWidth: "100vw", margin: "0 auto" }}
        >
          <div className="ms-5 mb-3">
            <Breadcrumbs
              separator={
                <NavigateNextIcon fontSize="small" sx={{ color: "#b0b0b0" }} />
              }
              aria-label="breadcrumb"
            >
              <Link
                underline="none"
                key="1"
                color="inherit"
                href="/dashboard"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#555",
                  fontSize: "14px",
                  fontWeight: 500,
                  "&:hover": { color: "#000" },
                }}
              >
                <HomeIcon fontSize="small" />
              </Link>

              <Link
                underline="none"
                key="2"
                color="inherit"
                sx={{
                  color: "#555",
                  fontSize: "14px",
                  fontWeight: 600,
                  "&:hover": { color: "#000" },
                }}
              >
                Interviews
              </Link>

              <Typography
                key="3"
                sx={{
                  color: "#215AEE",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: "#f7f7f7",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                Calendar
              </Typography>
            </Breadcrumbs>
          </div>
        </div>

        {/* Lịch mở rộng full màn hình */}
        <div className="flex-grow-1 d-flex justify-content-center vh-100">
          <div
            style={{
              width: "100%",
              maxWidth: "95vw",
              height: "92vh",
              minHeight: "600px",
            }}
          >
            <Calendar
              localizer={localizer}
              events={myEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              style={{
                fontSize: "14px",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden",
              }}
              eventPropGetter={(event) => {
                let bgColor = "#D6E4FF"; // Default light blue
                let textColor = "#215AEE";
                let borderColor = "#215AEE";

                if (
                  event.interview.status.name === "offered" ||
                  (event.interview.status.name === "done" &&
                    event.interview.result === "Pass")
                ) {
                  bgColor = "#C7E6C7";
                  textColor = "#28a745";
                  borderColor = "#28a745";
                } else if (
                  event.interview.status.name === "offered" ||
                  (event.interview.status.name === "done" &&
                    event.interview.result === "Fail")
                ) {
                  bgColor = "#F8D7DA"; // Light red background
                  textColor = "#DC3545"; // Dark red text
                  borderColor = "#DC3545"; // Red border
                } else if (event.interview.status.name === "cancel") {
                  bgColor = "#E0E0E0"; // Light gray background
                  textColor = "#6C757D"; // Medium gray text
                  borderColor = "#495057"; // Dark gray border
                } else if (
                  event.interview.status.name === "waiting for approved"
                ) {
                  bgColor = "#FFF3CD"; // Light yellow background
                  textColor = "#856404"; // Dark yellow text
                  borderColor = "#FFC107"; // Yellow border
                }

                return {
                  style: {
                    backgroundColor: bgColor,
                    color: textColor,
                    borderRadius: "8px",
                    padding: "5px",
                    border: `2px solid ${borderColor}`,
                  },
                };
              }}
              components={{
                event: ({ event }) => {
                  // Determine if the event is cancelled to apply line-through style
                  const isCancelled = event.interview.status.name === "cancel";

                  return (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "2px 8px",
                      }}
                    >
                      <span
                        style={{
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                          textDecoration: isCancelled ? "line-through" : "none", // Apply line-through only if canceled
                        }}
                      >
                        {event.interview.candidate.fullname}
                      </span>
                      <span
                        style={{
                          textAlign: "right",
                          fontWeight: "bold",
                          marginLeft: "8px",
                        }}
                      >
                        {moment(event.start).format("HH:mm")}
                      </span>
                    </div>
                  );
                },
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    onFetchInterviews={fetchInterviews}
                  />
                ),
              }}
              dayPropGetter={(date) => {
                const isPast = moment(date).isBefore(moment(), "day");
                return { className: isPast ? "past-day" : "" };
              }}
            />
          </div>
        </div>
      </div>

      {/* ToastContainer for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default InterviewManagement;
