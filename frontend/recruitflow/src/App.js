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
          <Route path="im" element={<InterviewManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
