import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen font-[Akshar] bg-[#0C0C0C]">
      <div className="h-full w-full flex flex-col backdrop-blur-[20px] p-3">
        {/* Top Bar */}
        <div className="flex justify-between items-center inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-3 mb-3 rounded-lg">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`${
                isSidebarCollapsed ? "mr-8" : "mr-12"
              } p-2 rounded-md text-white`}
            >
              <ViewSidebarOutlinedIcon />
            </button>
            <h1 className="text-2xl mr-16 font-semibold">LTIMindtree</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4">Good Morning, {user?.fullName}</span>
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
              {user?.fullName?.[0]}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-grow">
          {/* Sidebar */}
          <div
            className={`${
              isSidebarCollapsed ? "w-14" : "w-60"
            } transition-all duration-300 mr-3 inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-4 rounded-lg`}
          >
            <div className={`flex flex-col h-full`}>
              {/* Menu Options */}
              <div className="flex flex-col">
                <Link
                  to="/dashboard"
                  className="mb-4 cursor-pointer font-extralight"
                >
                  <i className="text-lg pr-3">
                    <GridViewOutlinedIcon />
                  </i>{" "}
                  {!isSidebarCollapsed && "Dashboard"}
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/dashboard/userroles"
                    className="mb-4 cursor-pointer font-extralight"
                  >
                    <i className="text-lg pr-3">
                      <PersonOutlineOutlinedIcon />
                    </i>{" "}
                    {!isSidebarCollapsed && "User Roles"}
                  </Link>
                )}
              </div>

              {/* Logout Option */}
              <div className="mt-auto">
                <div
                  onClick={logout}
                  className="cursor-pointer text-white hover:text-red-400 font-extralight"
                >
                  <i className="text-lg pr-3">
                    <LogoutOutlinedIcon />
                  </i>{" "}
                  {!isSidebarCollapsed && "Logout"}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`flex-grow p-4 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
