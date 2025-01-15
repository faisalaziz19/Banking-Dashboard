import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart"; // Assuming you are using MUI for the LineChart
import api from "../../services/api"; // Import the method from the API file

const CustomerLineChart = ({ chartId }) => {
  const [customerData, setCustomerData] = useState({}); // Store chart data
  const [country, setCountry] = useState(null); // Country filter (optional)
  const [countries, setCountries] = useState([]); // Store the list of countries

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

  // Handle case when there's no data yet (loading state)
  if (!years.length || !zones.length) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between">
        <div className="text-xl">Customer Data by Zone</div>

        {/* Dropdown to select country dynamically */}
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
    </div>
  );
};

export default CustomerLineChart;
