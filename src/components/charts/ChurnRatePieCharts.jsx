import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart"; // Import PieChart
import api from "../../services/api"; // Import API methods
import { HiOutlineLightBulb } from "react-icons/hi"; // Icon for insights
import { IconButton } from "@mui/material";
import { MdOutlineClose } from "react-icons/md";
import { pieArcLabelClasses } from "@mui/x-charts";

const ChurnRatePieChart = () => {
  const [churnData, setChurnData] = useState({}); // Store chart data
  const [insights, setInsights] = useState(""); // Store generated insights
  const [showInsights, setShowInsights] = useState(false); // Toggle visibility of insights

  // Fetch churn rate pie chart data
  useEffect(() => {
    api
      .getChurnRateData() // API endpoint to get churn rate pie chart data
      .then((data) => {
        console.log("API Response Data:", data); // Log the response to inspect the structure
        if (
          data &&
          data.income_level_churn_data &&
          data.customer_segment_churn_data &&
          data.overall_churn_rate
        ) {
          // Transform data for the charts
          const incomeLevels = Object.entries(data.income_level_churn_data).map(
            ([key, value]) => ({
              label: key,
              value,
            })
          );

          console.log(incomeLevels);

          const segments = Object.entries(data.customer_segment_churn_data).map(
            ([key, value]) => ({
              label: key,
              value,
            })
          );

          const overall = Object.entries(data.overall_churn_rate).map(
            ([key, value]) => ({
              label: key,
              value,
            })
          );

          // Set churn data
          setChurnData({ incomeLevels, segments, overall });
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching churn rate pie chart data:", error)
      );
  }, []);

  // Generate insights using HuggingFace or an API
  const generateInsights = async () => {
    const chartDescription = `Providing you some churn rate data, displaying the churn rates based on income levels (High, Medium, Low), segments (Retail, Corporate), and overall churn. Provide concise and valuable insights in bullet points (not more than 3 headings). Format to follow: **Heading** followed by text in bullet points. Here is the Data: ${JSON.stringify(
      churnData
    )}`;

    const payload = {
      chart_data: churnData, // Pass the chart data
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

  // Function to calculate the percentage label for each pie chart slice
  const getArcLabel = (params) => {
    const percent = (params.value / params.total) * 100;
    return `${percent.toFixed(0)}%`;
  };

  // Handle case when there's no data yet
  if (!churnData.incomeLevels || !churnData.segments || !churnData.overall) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="text-xl text-white">Churn Rate Analysis</div>
        <div className="flex items-center">
          {/* Button to trigger insights generation */}
          <HiOutlineLightBulb
            onClick={generateInsights}
            className="ml-2 cursor-pointer text-white text-2xl hover:text-yellow-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        {/* Income Level Churn Rate Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={350}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: churnData.incomeLevels, // Properly formatted data
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
                arcLabel: getArcLabel, // Apply arc label directly
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

        {/* Segment Churn Rate Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={350}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: churnData.segments, // Properly formatted data
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
                arcLabel: getArcLabel, // Apply arc label directly
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

        {/* Overall Churn Rate Pie Chart */}
        <div className="bg-none">
          <PieChart
            width={350}
            height={250}
            margin={{ top: 45, right: 10, bottom: 30, left: 70 }}
            series={[
              {
                data: churnData.overall, // Properly formatted data
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                cx: 150,
                cy: 70,
                arcLabel: getArcLabel, // Apply arc label directly
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
          <div className="text-white text-center">Overall Churn Rate</div>
        </div>
      </div>

      {showInsights && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg max-w-lg w-full">
            <div className="text-right cursor-pointer">
              <MdOutlineClose onClick={() => setShowInsights(false)} />
            </div>
            <div className="text-lg font-bold text-black">Insights</div>
            <div className="mt-4 text-black">{parseInsights(insights)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChurnRatePieChart;
