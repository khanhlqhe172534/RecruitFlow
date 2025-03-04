import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";

function Layout() {
  return (
    <div className="d-flex vh-100">
      <SideBar />
      <div className="container-fluid vh-100 p-0">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
