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
  const [year, setYear] = useState("2023"); // Default year

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
    <div>
      <h2>Monthly Transactions for {year}</h2>

      {/* Dropdown to select year */}
      <select onChange={(e) => setYear(e.target.value)} value={year}>
        <option value="2022">2022</option>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
      </select>

      <LineChart
        width={500}
        height={300}
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
      />
    </div>
  );
};

export default TransactionLineChart;
