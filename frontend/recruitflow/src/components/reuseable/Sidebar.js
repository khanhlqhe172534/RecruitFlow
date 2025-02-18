import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  HomeOutlined as HomeIcon,
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
} from "@mui/icons-material";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ email: "email", role: "User" });
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail") || "No Email";
    const userRole = localStorage.getItem("userRole") || "User";
    setUser({ email: userEmail, role: userRole });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
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

  return (
    <div
      className="vh-100 d-flex flex-column"
      style={{
        width: collapsed ? "80px" : "250px",
        transition: "width 0.3s ease",
      }}
    >
      {/* Sidebar Component */}
      <Sidebar collapsed={collapsed} collapsedWidth="80px" style={{ flex: 1 }}>
        <Menu closeOnClick>
          {/* User Section with Logo */}
          <div className="d-flex align-items-center p-3">
            <div
              className="d-flex justify-content-center align-items-center rounded m-2"
              style={{
                width: 35,
                height: 35,
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
                className="d-flex justify-content-center align-items-center ms-3"
                fontWeight={700}
                color="#0098e5"
              >
                RecruitFlow
              </Typography>
            )}
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
                  <Typography variant="body1" fontWeight="bold">
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
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
                  <ListItemButton>
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile Management" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
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

          {user.role === "Admin" && (
            <MenuItem icon={<PersonIcon />} component={<Link to="/user" />}>
              User Management
            </MenuItem>
          )}
          <MenuItem icon={<WorkIcon />} component={<Link to="/job" />}>
            Job Management
          </MenuItem>
          <MenuItem
            icon={<CalendarIcon />}
            component={<Link to="/interview" />}
          >
            Interview Management
          </MenuItem>
          <MenuItem icon={<OfferIcon />} component={<Link to="/offer" />}>
            Offer Management
          </MenuItem>
          <MenuItem icon={<GroupsIcon />} component={<Link to="/candidate" />}>
            Candidate Management
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f1f1f1",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {collapsed ? (
            <strong>{user.role}</strong>
          ) : (
            <>
              Logged in as <strong>{user.role || "User"}</strong>
            </>
          )}
        </Typography>
      </div>
    </div>
  );
}
