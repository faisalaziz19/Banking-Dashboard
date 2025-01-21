import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart"; // Assuming MUI for PieChart
import api from "../../services/api"; // Import API methods
import { HiOutlineLightBulb } from "react-icons/hi"; // Icon for insights
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";

const CustomerPieCharts = () => {
  const [customerData, setCustomerData] = useState({}); // Store chart data
  const [country, setCountry] = useState(null); // Country filter
  const [countries, setCountries] = useState([]); // List of countries
  const [insights, setInsights] = useState(""); // Store generated insights
  const [showInsights, setShowInsights] = useState(false); // Toggle visibility of insights

  // Fetch the list of distinct countries from the backend
  useEffect(() => {
    api
      .getCountries()
      .then((data) => {
        if (Array.isArray(data)) {
          setCountries(data);
        } else {
          console.error("Expected an array for countries:", data);
        }
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  // Fetch customer pie chart data when the country filter changes
  useEffect(() => {
    api
      .getPieChartData(country) // API endpoint to get pie chart data
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          // Transform data for the charts
          setCustomerData({
            incomeLevels: Object.entries(data.income_data).map(
              ([key, value]) => ({
                label: key,
                value,
              })
            ),
            segments: Object.entries(data.segment_data).map(([key, value]) => ({
              label: key,
              value,
            })),
          });
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching customer pie chart data:", error)
      );
  }, [country]);

  // Generate insights using HuggingFace or an API
  const generateInsights = async () => {
    const chartDescription = `Here is some data for country: ${country}, displaying income levels (High, Medium and Low) and segments (Retail and Corporate). Provide very concise but valuable key insights in bullet points (not more than 3 headings). Data: ${JSON.stringify(
      customerData
    )}`;

    const payload = {
      country: country || "all countries", // Pass the selected country
      chart_data: customerData, // Pass the chart data
      prompt: chartDescription, // Pass the dynamically generated prompt
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
        setInsights(data.insights); // Update insights state with backend response
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

  // Function to parse and format the insights
  const parseInsights = (insights) => {
    const cleanedInsights = insights
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n");
    const lines = cleanedInsights.split("\n");

    const parsedInsights = [];
    let currentHeading = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check for headings (e.g., - **Heading**:)
      if (trimmedLine.startsWith("- **") && trimmedLine.includes(":")) {
        const headingEndIndex = trimmedLine.indexOf(":");
        currentHeading = trimmedLine
          .slice(4, headingEndIndex)
          .replace(/\*/g, "")
          .trim();

        parsedInsights.push(
          <div key={`heading-${index}`} className="mt-4 font-bold text-lg">
            {currentHeading}
          </div>
        );

        const paragraphText = trimmedLine.slice(headingEndIndex + 1).trim();
        if (paragraphText) {
          parsedInsights.push(
            <div key={`paragraph-${index}`} className="mt-2 text-white">
              {paragraphText}
            </div>
          );
        }
      }
      // Check for list items (e.g., - Item)
      else if (trimmedLine.startsWith("-")) {
        const listItem = trimmedLine.slice(1).trim();
        if (listItem) {
          parsedInsights.push(
            <ul key={`list-${index}`} className="ml-6 list-disc">
              <li>{listItem}</li>
            </ul>
          );
        }
      }
      // Handle plain text
      else if (trimmedLine.length > 0) {
        parsedInsights.push(
          <div key={`text-${index}`} className="mt-2 text-white">
            {trimmedLine}
          </div>
        );
      }
    });

    return parsedInsights;
  };

  // Handle case when there's no data yet
  if (!customerData.incomeLevels || !customerData.segments) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="text-xl text-white">Customer Data Analysis</div>
        <div className="flex items-center">
          <select
            className="rounded-md bg-[#1C1C1C] text-white"
            onChange={(e) => setCountry(e.target.value)}
            value={country || ""}
          >
            <option value="">All Countries</option>
            {Array.isArray(countries) &&
              countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
          </select>

          {/* Button to trigger insights generation */}
          <HiOutlineLightBulb
            onClick={generateInsights}
            className="ml-2 cursor-pointer text-white text-2xl hover:text-yellow-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Income Level Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={370}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: customerData.incomeLevels, // Properly formatted data
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
              },
            ]}
            slotProps={{
              legend: {
                direction: "column",
                position: { vertical: "middle", horizontal: "left" },
                labelStyle: {
                  fontSize: 14,
                  fill: "white",
                },
              },
            }}
          />
          <div className="text-white text-center">
            All Time Customer Count by Income Level
          </div>
        </div>

        {/* Segment Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={370}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: customerData.segments, // Properly formatted data
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
              },
            ]}
            slotProps={{
              legend: {
                direction: "column",
                position: { vertical: "middle", horizontal: "left" },
                labelStyle: {
                  fontSize: 14,
                  fill: "white",
                },
              },
            }}
          />
          <div className="text-white text-center">
            All Time Customer Count by Segment
          </div>
        </div>
      </div>

      {/* Display insights */}
      {showInsights && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
          onClick={() => setShowInsights(false)} // Close on overlay click
        >
          <div
            className="bg-[#2C2C2C] p-4 rounded-lg shadow-lg w-1/2"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex justify-between items-center">
              <span className="text-white text-4xl">Insights</span>
              <IconButton onClick={() => setShowInsights(false)}>
                <MdOutlineClose className="text-white text-xl hover:text-red-600" />
              </IconButton>
            </div>
            <div className="mt-4 text-white">{parseInsights(insights)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPieCharts;
