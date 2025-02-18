import Dashboard from "./pages/Dashboard";
import InterviewManagement from "./pages/InterviewManagement";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/im" element={<InterviewManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
