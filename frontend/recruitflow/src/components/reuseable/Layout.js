import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";
// import NotificationComponent from "../Notification";

function Layout({ userFullName, setUserFullName }) {
  return (
    <div className="d-flex vh-100">
      {/* <header>
        <NotificationComponent />
      </header> */}
      <SideBar
        userFullName={userFullName}
        setUserFullName={setUserFullName}
      />
      <div className="container-fluid vh-100 p-0">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
