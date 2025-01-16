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
    const chartDescription = `Customer Line Chart for ${
      country || "all countries"
    }, displaying total customer counts on y-axis and years on x-axis. The data is divided into zones over years. Provide key and very concise insights of the data in bullet points.`;
    const chartData = customerData;

    try {
      const response = await fetch("http://localhost:5000/generate-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: country || "all countries", // Pass the selected country
          chart_data: chartData, // Pass the chart data
        }),
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
    const lines = insights.split("\n");
    let parsedInsights = [];
    let currentHeading = "";

    lines.forEach((line, index) => {
      // Check if the line starts with a heading (i.e., '- **')
      if (line.startsWith("- **")) {
        // Extract the heading text by removing the '- **' and '**' from the string
        currentHeading = line
          .slice(4, line.indexOf(":"))
          .replace(/\*/g, "")
          .trim();

        // Add the heading to the parsed insights
        parsedInsights.push(
          <div key={index} className="mt-2">
            <strong>- {currentHeading}</strong>
          </div>
        );

        // Add the text following the colon as a regular paragraph
        const paragraphText = line.slice(line.indexOf(":") + 1).trim();
        if (paragraphText) {
          parsedInsights.push(
            <div key={`${index}-text`} className="mt-2 text-white">
              {paragraphText}
            </div>
          );
        }
      } else if (line.trim().length > 0) {
        // For lines that are not empty, treat them as list items under the current heading
        if (line.startsWith("-")) {
          // Handle list items
          parsedInsights.push(
            <div key={index} className="mt-2">
              <ul className="ml-4 list-disc">
                {line
                  .trim()
                  .split(" - ")
                  .map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
              </ul>
            </div>
          );
        } else {
          // Handle plain text paragraphs
          parsedInsights.push(
            <div key={index} className="mt-2 text-white">
              {line.trim()}
            </div>
          );
        }
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
        height={250}
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
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-95 flex justify-center items-center z-10">
          <div className="p-6 bg-[#171717] rounded-md w-2/3">
            <div className="flex justify-between">
              <div className="text-2xl font-semibold text-white">Insights</div>
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
