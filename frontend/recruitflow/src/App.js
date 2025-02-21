import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/reuseable/Layout';
import Dashboard from './pages/Dashboard';
import InterviewManagement from './pages/InterviewManagement';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import NoAccess from './pages/NoAccess';
import UserManagement from './pages/UserManagement';
import OfferManagement from './pages/OfferManagement';
import CandidateManagerment from './pages/CandidateManagement';
import CandidateManagement from './pages/CandidateManagement';

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/no-access" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* LandingPage is displayed separately and not inside Layout */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={<Login setAuth={setIsAuthenticated} />}
        />

        <Route
          path="/no-access"
          element={<NoAccess />}
        />

        {/* Routes that require Layout */}
        <Route
          path="/"
          element={<Layout />}
        >
          {/* Protected route for InterviewManagement */}
          <Route
            path="interview"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <InterviewManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="user"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="offer"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OfferManagement />
              </ProtectedRoute>
            }
          />
           <Route
            path="candidate"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CandidateManagement />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
