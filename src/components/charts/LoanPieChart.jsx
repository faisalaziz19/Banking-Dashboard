import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { ChevronDown } from "lucide-react";
import api from "../../services/api"; // Import the method from the API file

const LoanPieChart = ({ chartId }) => {
  const [loanData, setLoanData] = useState({
    loanTypes: [], // Initialize with empty arrays
    loanCounts: [],
    loanAmounts: [],
  });
  const [year, setYear] = useState("2024"); // Default year
  const [isOpen, setIsOpen] = useState(false); // Dropdown visibility
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getLoanData(year)
      .then((data) => {
        if (data.error) {
          setError(data.error); // Set the error message from the API
        } else {
          setLoanData(data); // Set loan data if successful
          setError(""); // Clear error if data is found
        }
      })
      .catch((error) => {
        setError("Failed to fetch loan data");
        console.error("Error fetching loan data:", error);
      });
  }, [year]);

  const { loanTypes, loanCounts } = loanData;

  // Ensure we are passing a valid series prop for the PieChart component
  const pieChartData =
    Array.isArray(loanTypes) && loanTypes.length > 0
      ? loanTypes.map((type, index) => ({
          id: index,
          value: loanCounts[index],
          label: type,
        }))
      : []; // Empty array if no data

  return (
    <div className="max-h-[420px] pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between ">
        <div className="text-xl">Loan Types Distribution for {year}</div>
        {/* Dropdown to select year */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-[#1C1C1C] px-2 py-1 rounded-md hover:opacity-80 transition-colors"
          >
            <span>{year}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1C1C1C] opacity-95 rounded-xl shadow-lg py-2 z-10">
              {["2022", "2023", "2024"].map((yearOption) => (
                <button
                  key={yearOption}
                  onClick={() => {
                    setYear(yearOption);
                    setIsOpen(false); // Close the dropdown after selection
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 
                    ${yearOption === year ? "bg-white/5" : ""}`}
                >
                  {yearOption}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed size chart container */}
      <div style={{ height: "270px", width: "350px", position: "relative" }}>
        {/* Conditionally render error or pie chart */}
        {error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "red",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Showing pie chart only if data is available */}
        {pieChartData.length > 0 && !error && (
          <PieChart
            series={[
              {
                data: pieChartData,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 20,
                  additionalRadius: -30,
                  color: "gray",
                },
              },
            ]}
            width={350}
            height={270}
            margin={{ top: 60, right: 10, bottom: 20, left: 10 }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "middle" },
                padding: 10,
                labelStyle: {
                  fontSize: 14,
                  fill: "white",
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LoanPieChart;
