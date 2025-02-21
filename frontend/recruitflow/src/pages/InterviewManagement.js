import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import Sidebar from "../components/reuseable/Sidebar";
import moment from "moment";
import CustomToolbar from "../components/CustomToolbar"; // Import your custom toolbar
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles

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
        title: `${interview.candidate.fullname} - ${
          interview.job ? interview.job.job_name : "No Job Assigned"
        }`,
        start: new Date(interview.interview_date),
        end: new Date(interview.interview_date),
        interview,
      }));

      setMyEvents(events);
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
    <div className="d-flex vh-100">
      {/* <Sidebar /> */}

      <div className="container-fluid pt-4 vh-100 bg-light">
        <Calendar
          localizer={localizer}
          events={myEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                onFetchInterviews={fetchInterviews} // Pass the fetch function
              />
            ),
          }}
        />
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
