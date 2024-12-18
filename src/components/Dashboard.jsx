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
  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="h-screen w-screen font-[Akshar] bg-[#0C0C0C]">
      <div className="h-full w-full flex flex-col backdrop-blur-[20px] p-3">
        {/* Top Bar */}
        <div className="flex justify-between items-center inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-[6px] mb-3 rounded-lg">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`${
                isSidebarCollapsed ? "mr-10" : "mr-14"
              } p-2 rounded-md text-white`}
            >
              <ViewSidebarOutlinedIcon />
            </button>
            <h1 className="text-2xl mr-16 font-semibold">LTIMindtree</h1>
          </div>
          <div className="flex items-center cursor-pointer bg-[#1C1C1C] text-white px-3 py-1 rounded-lg mr-2">
            <div className="flex flex-col">
              <span className="text-[18px] font-normal">
                Hey, {user?.fullName}
              </span>
              <span className="text-[13px] font-extralight text-gray-400">
                It's {currentDate}
              </span>
            </div>
            <div className="ml-4 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-purple-600 text-2xl">
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
                {user?.role === "Admin" && (
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
                  className="cursor-pointer text-red-500 hover:text-red-400 font-extralight"
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
            className={`flex-grow p-2 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
