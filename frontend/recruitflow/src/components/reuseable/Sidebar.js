import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  IconButton,
  Avatar,
  Popover,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";
import {
  Home as HomeIcon,
  AssignmentOutlined as AssignmentIcon,
  Upcoming as UpcomingIcon,
  Menu as MenuIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  LocalOffer as OfferIcon,
  LockReset as LockIcon,
  Groups as GroupsIcon,
  ExitToAppRounded as LogoutIcon,
  Checklist,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { Form, Modal, Alert } from "react-bootstrap";

export default function SideBar({ userFullName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarAlert, setSnackbarAlert] = useState(null);
  const [user, setUser] = useState({
    email: "email",
    role: "User",
    fullName: userFullName,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userId, setUserId] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || "No Email";
    const userRole = localStorage.getItem("userRole") || "User";
    const userFullName = localStorage.getItem("userFullName") || "No Name";
    const _userId = localStorage.getItem("userId") || "Null";
    setUserId(_userId);
    setUser({
      email: userEmail,
      role: userRole,
      fullName: userFullName,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "user-menu-popover" : undefined;
  const location = useLocation();

  // Change Password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmitPasswordChange = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:9999/user/change-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to change password");

      setSnackbarAlert({
        message: "Password changed successfully!",
        type: "success",
      });
      setShowPasswordModal(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error.message);
    }
  };
  useEffect(() => {
    if (snackbarAlert) {
      const timer = setTimeout(() => {
        setSnackbarAlert(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [snackbarAlert]);
  return (
    <div
      className="vh-100 d-flex flex-column"
      style={{
        width: collapsed ? "180px" : "350px",
        transition: "width 0.3s ease",
      }}
    >
      {snackbarAlert && (
        <Alert
          variant={snackbarAlert.type === "success" ? "success" : "danger"}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1050,
          }}
        >
          {snackbarAlert.message}
        </Alert>
      )}
      {/* Sidebar Component */}
      <Sidebar
        className="w-100"
        backgroundColor="#FAFAFA"
        rootStyles={{
          border: "none",
          borderRadius: "0px 46px 46px 0px", // Chỉ bo góc bên phải
          overflow: "hidden",
          height: "100%",
          boxShadow: "5px 0px 10px rgba(0, 0, 0, 0.2)", // Đổ bóng bên phải
          transition: "box-shadow 0.3s ease-in-out", // Hiệu ứng mượt hơn
        }}
      >
        <Menu
          closeOnClick
          className="p-2"
          menuItemStyles={{
            button: ({ active }) => ({
              color: active ? "#0f0e13" : "rgba(15, 14, 19, 0.6)", // Lighter text when not selected
              fontSize: active ? "1.125rem" : "1rem", // 'h6' when active/hovered, 'body1' otherwise
              fontWeight: active ? "bold" : "normal", // Bold when active
              borderRadius: "50px", // Rounded button
              padding: "10px 20px", // Proper spacing
              transition:
                "background-color 0.3s ease, color 0.3s ease, font-weight 0.3s ease, font-size 0.3s ease", // Smooth effect
              backgroundColor: active ? "#E2DFEC" : "transparent", // Background only when active
              "&:hover": {
                backgroundColor: "#DBDBF4", // Show background on hover
                color: "#0f0e13", // Darker text on hover
                fontSize: "1.125rem", // 'h6' typography on hover
                fontWeight: "bold", // Bold on hover
                "& svg": {
                  color: "#3A3EF9", // Darker icon on hover
                },
              },
            }),
            icon: ({ active }) => ({
              color: active ? "#3A3EF9" : "#D5D6FA", // Icon color when active/inactive
              transition: "color 0.3s ease", // Smooth transition
            }),
          }}
        >
          {/* User Section with Logo */}
          <div className="d-flex justify-content-center align-items-center p-3 ">
            {/* <div
              className="d-flex justify-content-center align-items-center rounded m-3"
              style={{
                width: 55,
                height: 55,
                background:
                  "linear-gradient(45deg, rgb(21 87 205), rgb(90 225 255))",
                color: "white",
                fontSize: 24,
                fontWeight: "700",
              }}
            >
              R
            </div>

            {!collapsed && (
              <Typography
                variant="h6"
                className="d-flex justify-content-center align-items-center ms-1"
                fontWeight={700}
                color="#0098e5"
              >
                RecruitFlow
              </Typography>
            )} */}
          </div>

          <Typography
            variant="body2"
            fontWeight={600}
            className="ms-3 mt-3 mb-3"
            style={{ opacity: collapsed ? 0 : 0.7 }}
          >
            User
          </Typography>

          {/* Avatar Section */}
          <MenuItem>
            <div className="d-flex align-items-center">
              <IconButton
                aria-label="Account"
                onClick={handleClick}
                sx={{ padding: 0 }}
              >
                <Avatar
                  src="https://via.placeholder.com/40"
                  alt="User"
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>

              {!collapsed && (
                <div className="ms-3">
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                  >
                    {userFullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                  >
                    {user.role}
                  </Typography>
                </div>
              )}
            </div>
          </MenuItem>

          {/* User Menu Popover */}
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <nav aria-label="User account actions">
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => navigate("/profile")}>
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile Management" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleClose();
                      setShowPasswordModal(true);
                    }}
                  >
                    <ListItemIcon>
                      <LockIcon />
                    </ListItemIcon>
                    <ListItemText primary="Change Password" />
                  </ListItemButton>
                </ListItem>
              </List>
            </nav>
            <Divider />
            <nav aria-label="Logout">
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </nav>
          </Popover>

          {/* General Section */}
          <Typography
            variant="body2"
            fontWeight={600}
            className="ms-3 mt-3 mb-3"
            style={{ opacity: collapsed ? 0 : 0.7 }}
          >
            General
          </Typography>
          {user.role !== "Candidate" && (
            <MenuItem
              icon={<HomeIcon />}
              component={<Link to="/dashboard" />}
              active={location.pathname === "/dashboard"}
              className="mt-1"
            >
              Dashboard
            </MenuItem>
          )}

          {user.role === "Admin" && (
            <MenuItem
              icon={<PersonIcon />}
              component={<Link to="/user" />}
              active={location.pathname.startsWith("/user")}
              className="mt-1"
            >
              User Listing
            </MenuItem>
          )}
          <MenuItem
            icon={<WorkIcon />}
            component={<Link to="/job" />}
            active={location.pathname.startsWith("/job")}
            className="mt-1"
          >
            Job Listings
          </MenuItem>
          <MenuItem
            icon={<CalendarIcon />}
            component={<Link to="/interview" />}
            active={location.pathname.startsWith("/interview")}
            className="mt-1"
          >
            Interviews
          </MenuItem>
          <MenuItem
            icon={<OfferIcon />}
            component={<Link to="/offer" />}
            active={location.pathname.startsWith("/offer")}
            className="mt-1"
          >
            Offers List
          </MenuItem>
          {user.role !== "Candidate" && (
            <MenuItem
              icon={<GroupsIcon />}
              component={<Link to="/candidate" />}
              active={location.pathname.startsWith("/candidate")}
              className="mt-1"
            >
              Candidates
            </MenuItem>
          )}

          {/* {user.role == "Admin" && (
            <MenuItem
              icon={<AssignmentTurnedIn />}
              component={<Link to="/requests" />}
              active={location.pathname.startsWith("/requests")}
              className="mt-1"
            >
              Requests
            </MenuItem>
          )} */}
        </Menu>
      </Sidebar>
      <Modal
        centered
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <TextField
              fullWidth
              label="Old Password"
              name="oldPassword"
              type="password"
              value={passwordData?.oldPassword}
              onChange={handlePasswordChange}
              className="mb-3"
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData?.newPassword}
              onChange={handlePasswordChange}
              className="mb-3"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData?.confirmPassword}
              onChange={handlePasswordChange}
              className="mb-3"
            />
            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitPasswordChange}
          >
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
