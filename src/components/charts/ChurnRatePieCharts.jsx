import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import api from "../../services/api";
import { HiOutlineLightBulb } from "react-icons/hi";
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";
import { pieArcLabelClasses } from "@mui/x-charts";
import { BsStars } from "react-icons/bs";

const ChurnRatePieCharts = () => {
  const [churnData, setChurnData] = useState({});
  const [country, setCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [insights, setInsights] = useState("");
  const [showInsights, setShowInsights] = useState(false);

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

  // Fetch churn rate pie chart data when the country filter changes
  useEffect(() => {
    api
      .getChurnRateData(country)
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          const incomeLevels = Object.entries(data.income_data).map(
            ([key, value]) => ({
              label: key,
              value: value,
            })
          );

          const segments = Object.entries(data.segment_data).map(
            ([key, value]) => ({
              label: key,
              value: value,
            })
          );

          setChurnData({ incomeLevels, segments });
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching churn rate data:", error)
      );
  }, [country]);

  // Generate insights (similar to the reference code)
  const generateInsights = async () => {
    const chartDescription = `Providing you some data for ${country} with churn rates based on income levels and segments. Provide very concise insights with future suggestion. Format to follow: **Heading** followed by text in bullet points (no subheadings). Here is the Data: ${JSON.stringify(
      churnData
    )}`;

    const payload = {
      country: country || "all countries",
      chart_data: churnData,
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

  // Parse insights (similar to the reference code)
  const parseInsights = (insights) => {
    const cleanedInsights = insights
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n")
      .replace(/\\+/g, "")
      .replace(/\n{2,}/g, "\n\n");

    const lines = cleanedInsights.split("\n");

    const parsedInsights = [];
    let currentHeading = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (/^\*\*.+\*\*:/.test(trimmedLine)) {
        currentHeading = trimmedLine
          .replace(/^\*\*|\*\*$/g, "")
          .replace(":", "")
          .trim();
        parsedInsights.push(
          <div
            key={`heading-${index}`}
            className="mt-4 font-bold text-lg text-white"
          >
            {currentHeading}
          </div>
        );
      } else if (trimmedLine.startsWith("-")) {
        const bulletPoint = trimmedLine.replace(/^-/, "").trim();
        parsedInsights.push(
          <div key={`bullet-${index}`} className="ml-6 mt-2 text-white">
            • {bulletPoint}
          </div>
        );
      } else if (trimmedLine.length > 0) {
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
  if (!churnData.incomeLevels || !churnData.segments) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 max-h-[340px] bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="text-xl text-white">Customer Churn Rate Analysis</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {/* Income Level Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={358}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: churnData.incomeLevels,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
                arcLabel: (params) => `${params.value.toFixed(1)}%`,
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
            Churn Rate by Income Level
          </div>
        </div>

        {/* Segment Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={350}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: churnData.segments,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
                arcLabel: (params) => `${params.value.toFixed(1)}%`,
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
          <div className="text-white text-center">Churn Rate by Segment</div>
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

export default ChurnRatePieCharts;
