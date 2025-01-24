import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ChevronRight } from "lucide-react";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import api from "../services/api";
import TransactionLineChart from "./charts/TransactionLineChart";
import LoanPieChart from "./charts/LoanPieChart";
import CustomerLineChart from "./charts/CustomerLineChart";
import CustomerPieCharts from "./charts/CustomerPieCharts";
import ROIBarChart from "./charts/ROIBarChart";
import CurrencyWidget from "./charts/CurrencyWidget";
import NewsComponent from "./charts/NewsComponent";
import ChurnRatePieChart from "./charts/ChurnRatePieCharts";

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
    <div className="h-full w-full m-0 overflow-hidden font-[Akshar] bg-[#0C0C0C] p-3">
      <div className="h-full flex flex-col backdrop-blur-[20px]">
        {/* Top Bar */}
        <div className="flex justify-between items-center inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-[6px] mb-3 rounded-lg">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-md text-white"
            >
              {/* Chevron icon that rotates */}
              <ChevronRight
                size={24}
                strokeWidth={3}
                className={`transition-transform duration-300 ${
                  isSidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
            <h1 className="text-2xl mr-16 font-semibold">LTIM</h1>
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
              isSidebarCollapsed ? "w-14" : "w-64"
            } transition-all duration-300 mr-3 inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-3 rounded-lg`}
          >
            <div className={`flex flex-col h-full`}>
              <div className="flex flex-col">
                {/* Dashboard Menu Option */}
                <Link
                  to="/dashboard"
                  className={`mb-4 cursor-pointer font-extralight text-xl flex items-center p-1 rounded-md transition-all ${
                    location.pathname === "/dashboard"
                      ? "bg-[#6e4576] bg-opacity-40 text-purple-300"
                      : "text-white hover:bg-[#6e4576] hover:text-white hover:scale-105"
                  }`}
                >
                  <i className="text-2xl pr-3">
                    <GridViewOutlinedIcon />
                  </i>
                  {!isSidebarCollapsed && "Dashboard"}
                </Link>

                {/* User Roles Menu Option (Visible only to Admin) */}
                {user?.role === "Admin" && (
                  <Link
                    to="/dashboard/userroles"
                    className={`mb-4 cursor-pointer font-extralight text-xl flex items-center p-1 rounded-md transition-all ${
                      location.pathname === "/dashboard/userroles"
                        ? "bg-[#6e4576] bg-opacity-40 text-purple-300"
                        : "text-white hover:bg-[#6e4576] hover:text-white hover:scale-105"
                    }`}
                  >
                    <i className="text-lg pr-3 align-top">
                      <PersonOutlineOutlinedIcon />
                    </i>
                    {!isSidebarCollapsed && "User Roles"}
                  </Link>
                )}
              </div>

              {/* Logout Option */}
              <div className="mt-auto">
                <div
                  onClick={logout}
                  className={`mb-4 cursor-pointer font-extralight text-xl flex items-center p-1 rounded-md transition-all ${
                    location.pathname === "/dashboard/userroles"
                      ? "bg-[#995050] bg-opacity-40 text-red-300"
                      : "text-red-500 hover:bg-[#5b3333] hover:text-red-300 hover:scale-105"
                  }`}
                >
                  <i className="text-lg pr-3 align-top">
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
                    case 5:
                      return (
                        <div className="flex flex-wrap">
                          <ROIBarChart
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    case 6:
                      return (
                        <div className="flex flex-wrap">
                          <CurrencyWidget
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    case 7:
                      return (
                        <div className="flex flex-wrap">
                          <NewsComponent
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );
                    case 8:
                      return (
                        <div className="flex flex-wrap">
                          <ChurnRatePieChart
                            key={chart.chart_id}
                            chartId={chart.chart_id}
                          />
                        </div>
                      );

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
