import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart"; // Import PieChart
import api from "../../services/api"; // Import API methods
import { HiOutlineLightBulb } from "react-icons/hi"; // Icon for insights
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";
import { pieArcLabelClasses } from "@mui/x-charts";
import { BsStars } from "react-icons/bs";

const CustomerPieCharts = () => {
  const [customerData, setCustomerData] = useState({}); // Store chart data
  const [country, setCountry] = useState(null); // Country filter
  const [countries, setCountries] = useState([]); // List of countries
  const [insights, setInsights] = useState(""); // Store generated insights
  const [showInsights, setShowInsights] = useState(false); // Toggle visibility of insights
  const [totalCustomers, setTotalCustomers] = useState(0); // Store total customer count

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
          const incomeLevels = Object.entries(data.income_data).map(
            ([key, value]) => ({
              label: key,
              value,
            })
          );

          const segments = Object.entries(data.segment_data).map(
            ([key, value]) => ({
              label: key,
              value,
            })
          );

          // Set customer data
          setCustomerData({ incomeLevels, segments });

          // Calculate total customer count (sum of all values in incomeLevels and segments)
          const totalIncome = incomeLevels.reduce(
            (acc, item) => acc + item.value,
            0
          );
          const totalSegments = segments.reduce(
            (acc, item) => acc + item.value,
            0
          );
          setTotalCustomers(totalIncome + totalSegments); // Update total count
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
    const chartDescription = `Providing you some data for ${country} with total customers : ${
      totalCustomers / 2
    }, displaying the count of customers based on income levels (High, Medium and Low) and segments (Retail and Corporate). Provide very concise but key valuable insights with future trend or suggestion on the data in bullet points (not more than 3 headings and make sure the facts are correct logically and mathematically). Format to follow : **Heading** followed by text in bullet point. Here is the Data: ${JSON.stringify(
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

  const parseInsights = (insights) => {
    // Clean up the input
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

  // Function to calculate the percentage label
  const getArcLabel = (params, total) => {
    const percent = (params.value / total) * 100 * 2;
    return `${percent.toFixed(0)}%`;
  };

  // Handle case when there's no data yet
  if (!customerData.incomeLevels || !customerData.segments) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="text-xl text-white">Customer Data Analysis</div>
        <div className="text-white text-center font-semibold">
          Total Customer Count: {totalCustomers / 2}
        </div>
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
                arcLabel: (params) => getArcLabel(params, totalCustomers),
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "white",
                fontSize: 14,
              },
            }}
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
                arcLabel: (params) => getArcLabel(params, totalCustomers),
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "white",
                fontSize: 14,
              },
            }}
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

      {/* Insights section */}
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

export default CustomerPieCharts;
