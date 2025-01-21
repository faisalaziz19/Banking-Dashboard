import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart"; // Assuming you are using MUI for the LineChart
import api from "../../services/api"; // Import the method from the API file
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";
import { HiOutlineLightBulb } from "react-icons/hi"; // Close icon for the insights overlay

const CustomerLineChart = ({ chartId }) => {
  const [customerData, setCustomerData] = useState({}); // Store chart data
  const [country, setCountry] = useState(null); // Country filter (optional)
  const [countries, setCountries] = useState([]); // Store the list of countries
  const [insights, setInsights] = useState(""); // Store generated insights
  const [showInsights, setShowInsights] = useState(false); // State to toggle insights visibility

  // Fetch the list of distinct countries from the backend
  useEffect(() => {
    api
      .getCountries() // Fetch countries from the backend
      .then((data) => {
        if (Array.isArray(data)) {
          setCountries(data); // Set countries state with the data from the backend
        } else {
          console.error("Expected an array for countries:", data);
        }
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []); // Only run this once when the component mounts

  // Fetch customer chart data when the country filter changes
  useEffect(() => {
    api
      .getCustomerLineChartData(country) // Pass country as filter (can be null for all countries)
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setCustomerData(data); // Update customer data
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching customer chart data:", error)
      );
  }, [country]); // Trigger fetch when country changes

  // Extract years and zones from the customer data
  const years = Object.keys(customerData);
  const zones = years.length ? Object.keys(customerData[years[0]]) : [];
  console.log("Customer Data passed by the backend", customerData);
  console.log("Selected Country", country);

  // Generate insights using HuggingFace
  const generateInsights = async () => {
    const chartDescription = `Here is some data for country: ${country}, displaying total customer counts over the years. The data is divided into five zones (North, East, West, South and Central). Provide very concise but valuable key insights in bullet points (not more than 4 headings) for this data. Data: ${JSON.stringify(
      customerData
    )}"
 `;

    // Prepare the request payload with the dynamic prompt
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

  // Handle case when there's no data yet (loading state)
  if (!years.length || !zones.length) {
    return <div>Loading data...</div>;
  }

  const parseInsights = (insights) => {
    // Step 1: Remove outer quotes and process escaped newlines
    const cleanedInsights = insights
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n");
    const lines = cleanedInsights.split("\n");

    const parsedInsights = [];
    let currentHeading = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Step 2: Check for headings (e.g., - **Heading**:)
      if (trimmedLine.startsWith("- **") && trimmedLine.includes(":")) {
        const headingEndIndex = trimmedLine.indexOf(":");
        currentHeading = trimmedLine
          .slice(4, headingEndIndex)
          .replace(/\*/g, "")
          .trim();

        // Push the heading
        parsedInsights.push(
          <div key={`heading-${index}`} className="mt-4 font-bold text-lg">
            {currentHeading}
          </div>
        );

        // Handle additional text after the colon
        const paragraphText = trimmedLine.slice(headingEndIndex + 1).trim();
        if (paragraphText) {
          parsedInsights.push(
            <div key={`paragraph-${index}`} className="mt-2 text-white">
              {paragraphText}
            </div>
          );
        }
      }
      // Step 3: Check for list items (e.g., - Item)
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
      // Step 4: Handle plain text
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

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between">
        <div className="text-xl">Customer Data by Zone</div>

        {/* Dropdown to select country dynamically */}
        <div className="flex items-center">
          <select
            className="rounded-md bg-[#1C1C1C]"
            onChange={(e) => setCountry(e.target.value)}
            value={country || ""}
          >
            <option value="">All Countries</option>
            {/* Check if countries is an array before using .map */}
            {Array.isArray(countries) &&
              countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
          </select>
          <HiOutlineLightBulb
            onClick={generateInsights}
            className="ml-2 cursor-pointer text-white text-2xl hover:text-yellow-400"
            color="primary"
            aria-label="generate-insights"
          >
            <span className="material-icons">insights</span>{" "}
            {/* Replace with your icon */}
          </HiOutlineLightBulb>
        </div>
      </div>

      {/* Render LineChart with customer data */}
      <LineChart
        width={500}
        height={270}
        series={zones.map((zone) => ({
          data: years.map((year) => customerData[year][zone] || 0), // Populate data for each zone per year
          label: zone, // Each line gets a label for the zone
        }))}
        xAxis={[
          {
            scaleType: "point",
            data: years,
            stroke: "white", // Set the axis line color to white
            tickStroke: "white", // Set tick stroke to white
            labelStyle: {
              fill: "white", // Set label color to white
            },
          },
        ]}
        yAxis={[
          {
            stroke: "white", // Set the axis line color to white
            tickStroke: "white", // Set tick stroke to white
            labelStyle: {
              fill: "white", // Set label color to white
            },
          },
        ]}
        slotProps={{
          legend: {
            direction: "row", // Display legends horizontally
            position: { vertical: "top", horizontal: "middle" }, // Position legends at the top
            padding: 10,
            labelStyle: {
              fontSize: 14,
              fill: "white", // Legend text color
            },
          },
        }}
      />

      {/* Insights Section */}
      {showInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-lg w-1/2">
            <div className="flex justify-between">
              <div className="text-4xl font-semibold text-white">Insights</div>
              <IconButton
                onClick={() => setShowInsights(false)}
                color="inherit"
                aria-label="close-insights"
              >
                <MdOutlineClose className="hover:text-red-600" />
              </IconButton>
            </div>
            <div className="mt-4 text-white">{parseInsights(insights)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLineChart;
