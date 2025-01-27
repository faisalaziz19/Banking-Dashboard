import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import api from "../../services/api"; // Import the method from the API file
import { ChevronDown } from "lucide-react";
import { HiOutlineLightBulb } from "react-icons/hi";
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";
import { BsStars } from "react-icons/bs";

const TransactionLineChart = ({ chartId }) => {
  const [transactionData, setTransactionData] = useState({
    months: [],
    online: [],
    debitCard: [],
    creditCard: [],
  });
  const [year, setYear] = useState("2024"); // Default year
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState(""); // Store generated insights
  const [showInsights, setShowInsights] = useState(false); // Toggle insights overlay

  // Fetch transaction data when the year changes
  useEffect(() => {
    api
      .getTransactionData(year)
      .then((data) => {
        if (data.months && data.online && data.debitCard && data.creditCard) {
          setTransactionData(data);
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [year]);

  const { months, online, debitCard, creditCard } = transactionData;

  // Generate insights using the AI model
  const generateInsights = async () => {
    const chartDescription = `This chart represents monthly transaction amounts in USD for the year ${year} (month wise), categorized into Online, Debit Card, and Credit Card transactions. Provide concise but valuable insights with suggestions for the data. (Not more than 3 Headings) Format: **Heading** followed by text in bullet points. Here is the data: ${JSON.stringify(
      transactionData
    )}`;

    const payload = {
      year: year,
      chart_data: transactionData,
      prompt: chartDescription,
    };

    try {
      const response = await fetch("http://localhost:5000/generate-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights); // Update insights state
        setShowInsights(true); // Show insights overlay
      } else {
        const error = await response.json();
        console.error("Error generating insights:", error);
        setInsights("Failed to generate insights.");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights("Failed to generate insights.");
    }
  };

  // Parse insights into a readable format
  const parseInsights = (insights) => {
    const cleanedInsights = insights
      .replace(/^"|"$/g, "") // Remove surrounding quotes
      .replace(/\\n/g, "\n") // Replace escaped newlines
      .replace(/\\+/g, "") // Remove backslashes
      .replace(/\n{2,}/g, "\n\n"); // Normalize excessive newlines

    const lines = cleanedInsights.split("\n");

    const parsedInsights = [];
    let currentHeading = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Match and render top-level headings (**Heading:**)
      if (/^\*\*.+\*\*:/.test(trimmedLine)) {
        currentHeading = trimmedLine
          .replace(/^\*\*|\*\*$/g, "") // Remove surrounding '**' characters
          .replace(":", "") // Remove the colon after the heading
          .trim();

        parsedInsights.push(
          <div
            key={`heading-${index}`}
            className="mt-4 font-bold text-lg text-white"
          >
            {currentHeading}
          </div>
        );
      }
      // Handle bullet points (lines starting with '-')
      else if (trimmedLine.startsWith("-")) {
        const bulletPoint = trimmedLine.replace(/^-/, "").trim(); // Remove the hyphen and extra space

        parsedInsights.push(
          <div key={`bullet-${index}`} className="ml-6 mt-2 text-white">
            • {bulletPoint}
          </div>
        );
      }
      // Handle text that doesn't match any of the above (normal text)
      else if (trimmedLine.length > 0) {
        // Check for any unnecessary '**' markers in the line
        const cleanLine = trimmedLine.replace(/\*\*/g, "");

        parsedInsights.push(
          <div
            key={`paragraph-${index}`}
            className="mt-2 font-bold text-xl uppercase text-yellow-200"
          >
            {cleanLine}
          </div>
        );
      }
    });

    return parsedInsights;
  };

  // Handle case when there's no data yet
  if (!months || !online || !debitCard || !creditCard) {
    return <div>Error: Missing data in response</div>;
  }

  if (!months.length) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="max-h-[420px] pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between">
        <div className="text-xl">Monthly Transactions Amount in USD</div>
        <div className="flex items-center gap-2">
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

          {/* Button to trigger insights generation */}
          <HiOutlineLightBulb
            onClick={generateInsights}
            className="cursor-pointer text-white text-2xl hover:text-yellow-400"
          />
        </div>
      </div>

      {/* Line Chart */}
      <LineChart
        width={500}
        height={340}
        sx={{
          "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
            strokeWidth: "0.4",
            fill: "#ffffff",
          },
          "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
            strokeWidth: "0.5",
            fill: "#ffffff",
          },
          "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
            stroke: "#ffffff",
          },
          "& .MuiChartsAxis-left .MuiChartsAxis-line": {
            stroke: "#ffffff",
          },
        }}
        series={[
          {
            data: online,
            label: "Online",
          },
          {
            data: debitCard,
            label: "Debit Card",
          },
          {
            data: creditCard,
            label: "Credit Card",
          },
        ]}
        xAxis={[{ scaleType: "point", data: months }]}
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "top", horizontal: "middle" },
            labelStyle: {
              fontSize: 14,
              fill: "white",
            },
          },
        }}
      />

      {/* Insights Overlay */}
      {showInsights && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#222222] rounded-lg p-6 w-4/5 md:w-2/3">
            <div className="flex justify-between items-center">
              <div className="flex text-yellow-200">
                <div className="text-3xl font-semibold">Insights</div>
                <div className="text-3xl">
                  <BsStars />
                </div>
              </div>
              <IconButton onClick={() => setShowInsights(false)}>
                <MdOutlineClose className="text-white hover:text-red-600" />
              </IconButton>
            </div>
            <div className="mt-4 text-white">{parseInsights(insights)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionLineChart;
