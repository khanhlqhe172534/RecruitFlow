import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import SideBar from '../components/reusable/Sidebar';

const AUTHORIZED_ROLES = ['Admin'];

export const PermissionHandler = ({ children }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const [isAuthorized, setIsAuthorized] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/no-access');
      return;
    }
    
    // Check if user has required role
    setIsAuthorized(AUTHORIZED_ROLES.includes(userRole));
  }, [navigate, userRole]);
  
  if (!isAuthorized) {
    return (
      <div className="d-flex vh-100">
        <SideBar />
        <Container fluid className="p-4 vh-100 bg-light">
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <h1 className="mb-4">Unauthorized Access</h1>
            <p className="text-muted mb-4 text-center">
              You don't have permission to access this page.<br />
              Please contact your administrator for assistance.
            </p>
          </div>
        </Container>
      </div>
    );
  }
  
  return children;
};