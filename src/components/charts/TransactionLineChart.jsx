import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import api from "../../services/api"; // Import the method from the API file

const TransactionLineChart = ({ chartId }) => {
  const [transactionData, setTransactionData] = useState({
    months: [],
    online: [],
    debitCard: [],
    creditCard: [],
  });
  const [year, setYear] = useState("2024"); // Default year

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

  if (!months || !online || !debitCard || !creditCard) {
    return <div>Error: Missing data in response</div>;
  }

  if (!months.length) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="pt-5 pr-5 pl-5 mr-3 mb-3 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg transition-all duration-300">
      <div className="flex justify-between">
        <div className="text-xl">Monthly Transactions for {year}</div>
        {/* Dropdown to select year */}
        <select
          className="rounded-md bg-[#1C1C1C]"
          onChange={(e) => setYear(e.target.value)}
          value={year}
        >
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>
      <LineChart
        width={500}
        height={250}
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
        xAxis={[{ scaleType: "point", data: months }]} // Use months as x-axis data
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
    </div>
  );
};

export default TransactionLineChart;
