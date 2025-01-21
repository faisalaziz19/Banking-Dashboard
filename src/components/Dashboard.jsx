import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import api from "../services/api";
import TransactionLineChart from "./charts/TransactionLineChart";
import LoanPieChart from "./charts/LoanPieChart";
import CustomerLineChart from "./charts/CustomerLineChart";
import CustomerPieCharts from "./charts/CustomerPieCharts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [charts, setCharts] = useState([]);
  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const location = useLocation();
  const isUserRolesRoute = location.pathname === "/dashboard/userroles";

  useEffect(() => {
    const fetchCharts = async () => {
      if (user) {
        try {
          const fetchedCharts = await api.getChartsForUser(user.role); // Fetch charts based on the role
          setCharts(fetchedCharts);
        } catch (error) {
          console.error("Error fetching charts:", error);
        }
      }
    };

    fetchCharts();
  }, [user]); // Fetch charts when the user is updated

  return (
    <div className="h-full w-full font-[Akshar] bg-[#0C0C0C]">
      <div className="h-full w-screen flex flex-col backdrop-blur-[20px] p-3">
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
        <div className="w-full flex flex-grow">
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
          {isUserRolesRoute ? (
            <div
              className={`flex-grow p-2 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300`}
            >
              <Outlet />
            </div>
          ) : (
            // <div className="flex-grow p-2 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
            <div className="flex flex-wrap">
              {/* Render charts dynamically based on the user's role */}
              {charts.length === 0 ? (
                <p>No charts available for your role.</p>
              ) : (
                charts.map((chart) => {
                  switch (chart.chart_id) {
                    case 1:
                      return (
                        <div className="flex flex-wrap">
                          <TransactionLineChart
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    case 2:
                      return (
                        <div className="flex flex-wrap">
                          <LoanPieChart
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    case 3:
                      return (
                        <div className="flex flex-wrap">
                          <CustomerLineChart
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    case 4:
                      return (
                        <div className="flex flex-wrap">
                          <CustomerPieCharts
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    // Add more cases for other chart components
                    default:
                      return (
                        <div key={chart.chart_id}>
                          Chart {chart.chart_id} not implemented.
                        </div>
                      );
                  }
                })
              )}
            </div>
            // </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
