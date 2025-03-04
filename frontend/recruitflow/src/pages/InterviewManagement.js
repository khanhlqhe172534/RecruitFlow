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
import { Typography } from "@mui/material";
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
          <Typography
            className=" ms-5"
            sx={{ fontSize: "24px", fontWeight: "bold" }}
          >
            Calendar
          </Typography>
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
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor:
                    event.interview.status.name === "offered"
                      ? "#C7E6C7"
                      : "#D6E4FF",
                  color:
                    event.interview.status.name === "offered"
                      ? "#28a745"
                      : "#215AEE",
                  borderRadius: "8px",
                  padding: "5px",
                  border: `2px solid ${
                    event.interview.status.name === "offered"
                      ? "#28a745"
                      : "#215AEE"
                  }`,
                },
              })}
              components={{
                event: ({ event }) => (
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
                ),
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
