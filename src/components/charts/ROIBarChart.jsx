import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import api from "../../services/api";
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";
import { HiOutlineLightBulb } from "react-icons/hi";
import { BsStars } from "react-icons/bs";

const ROIBarChart = ({ chartId }) => {
  const [chartData, setChartData] = useState([]);
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [insights, setInsights] = useState("");
  const [showInsights, setShowInsights] = useState(false);

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

  useEffect(() => {
    api
      .getROIBarChartData(country)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setChartData(data);
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) => console.error("Error fetching chart data:", error));
  }, [country]);

  const years = chartData.map((item) => item.year); // Extract the years from the data

  // Prepare the series for investment and revenue
  const investmentSeries = {
    label: "Total Investment",
    data: chartData.map((item) => parseFloat(item.total_investment)),
    id: "investment",
    color: "#02b2af",
  };

  const revenueSeries = {
    label: "Total Revenue",
    data: chartData.map((item) => parseFloat(item.total_revenue)),
    id: "revenue",
    color: "#dd00ff",
  };

  const generateInsights = async () => {
    const chartDescription = `Here is data for country: ${country}, showing total investment vs revenue generated (in USD) for the marketing campaigns over the years. Provide very consice but key valuable insights in bullet points (not more than 3 headings and make sure the facts are correct logically and mathematically). Format to follow : **Heading** followed by text in bullet point. Here is the Data:: ${JSON.stringify(
      chartData
    )}`;

    const payload = {
      country: country || "all countries",
      chart_data: chartData,
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
        setInsights(data.insights);
        setShowInsights(true);
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

  if (!chartData.length) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between">
        <div className="text-xl">Maretking Campaigns ROI</div>

        <div className="flex items-center">
          <select
            className="rounded-md px-2 py-1 bg-[#1C1C1C]"
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
          <HiOutlineLightBulb
            onClick={generateInsights}
            className="ml-2 cursor-pointer text-white text-2xl hover:text-yellow-400"
            color="primary"
            aria-label="generate-insights"
          />
        </div>
      </div>

      <BarChart
        width={500}
        height={300}
        margin={{ top: 60, right: 20, bottom: 40, left: 60 }}
        series={[investmentSeries, revenueSeries]}
        sx={{
          //change left yAxis label styles
          "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
            strokeWidth: "0.4",
            fill: "#ffffff",
          },
          // change bottom label styles
          "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
            strokeWidth: "0.5",
            fill: "#ffffff",
          },
          // bottomAxis Line Styles
          "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
            stroke: "#ffffff",
          },
          // leftAxis Line Styles
          "& .MuiChartsAxis-left .MuiChartsAxis-line": {
            stroke: "#ffffff",
          },
        }}
        xAxis={[
          {
            data: years,
            scaleType: "band",
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value) => `${value / 1e7} Cr`,
          },
        ]}
        slotProps={{
          legend: {
            labelStyle: {
              fontSize: 14,
              fill: "white",
            },
          },
        }}
      />

      {showInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-lg w-1/2">
            <div className="flex justify-between">
              <div className="flex text-yellow-200">
                <div className="text-3xl font-semibold">Insights</div>
                <div className="text-3xl">
                  <BsStars />
                </div>
              </div>
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

export default ROIBarChart;
