import React from "react";
import SideBar from "../components/reuseable/Sidebar";

function Dashboard() {
  return (
    <div className="d-flex vh-100">
      <SideBar />
      <div className="container-fluid p-4 overflow-auto vh-100 bg-light">
        content
      </div>
    </div>
  );
}

export default Dashboard;
