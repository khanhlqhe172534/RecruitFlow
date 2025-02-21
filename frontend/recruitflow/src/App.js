import Layout from "./components/reuseable/Layout";
import Dashboard from "./pages/Dashboard";
import InterviewManagement from "./pages/InterviewManagement";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="interview" element={<InterviewManagement />} />
          <Route path="job" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
