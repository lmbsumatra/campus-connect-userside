// frontend/src/components/Analytics/TransactionAnalyticsComponent.js
import React, { useState, useEffect } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TransactionStatusDistribution = ({ transactions }) => {
  const statusData = transactions.reduce((acc, transaction) => {
    const status = transaction.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Total transactions
  const total = transactions.length;

  // Assign colors dynamically for better readability
  const statusColors = {
    Requested: "#28a745", // Green
    Accepted: "#ffc107", // Yellow
    Declined: "#dc3545", // Red
    HandedOver: "#17a2b8", // Blue
    Returned: "#ff69b4", // Pink
    Completed: "#ff4500", // Orange
    Cancelled: "#dc3545",
    Unknown: "#6c757d", // Gray
  };

  // Convert data into an array with percentages
  const statusPercentages = Object.entries(statusData).map(
    ([status, count]) => ({
      status,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    })
  );

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: Object.keys(statusData).map(
          (status) => statusColors[status] || "#8a2be2"
        ), // Assign colors dynamically
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-3">
      <h5 className="mb-3 text-center">Transaction Status Distribution</h5>
      <p className="text-muted text-center">
        Total Transactions: <strong>{total}</strong>
      </p>

      <div className="d-flex justify-content-center">
        <div style={{ width: "300px" }}>
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    padding: 10,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const percentage = statusPercentages.find(
                        (item) => item.status === context.label
                      )?.percentage;
                      return `${context.label}: ${context.raw} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <h6>Status Summary</h6>
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {statusPercentages.map(({ status, count, percentage }) => (
              <tr key={status}>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: statusColors[status] || "#8a2be2",
                      color: "#fff",
                      padding: "6px 10px",
                    }}
                  >
                    {status}
                  </span>
                </td>
                <td>{count}</td>
                <td>{percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TransactionsGrowth = ({ transactions }) => {
  const [timeframe, setTimeframe] = useState("monthly");
  const [metric, setMetric] = useState("count");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const processData = () => {
      const groupedData = transactions.reduce((acc, transaction) => {
        if (!transaction.createdAt) return acc; // Skip if no date

        const date = new Date(transaction.createdAt);
        let key;
        let sortKey;

        if (timeframe === "daily") {
          // Format: YYYY-MM-DD for consistent sorting
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          key = `${year}-${month}-${day}`;
          sortKey = date.getTime(); // Use timestamp for sorting
          // Display format: "MMM DD" (e.g., "Mar 15")
          key = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else if (timeframe === "weekly") {
          const year = date.getFullYear();
          const weekNumber = getWeekNumber(date);
          key = `Week ${weekNumber}, ${year}`;
          sortKey = `${year}-${String(weekNumber).padStart(2, "0")}`; // For sorting
        } else {
          // Monthly
          key = date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          sortKey = date.getFullYear() * 12 + date.getMonth(); // For sorting
        }

        if (!acc[key]) {
          acc[key] = {
            count: 0,
            totalAmount: 0,
            completed: 0,
            pending: 0,
            failed: 0,
            rental: 0,
            sell: 0,
            sortKey, // Store the sort key
          };
        }

        acc[key].count += 1;
        if (transaction.amount) {
          acc[key].totalAmount += parseFloat(transaction.amount) || 0;
        }

        // Track status counts - IMPORTANT: Use payment_status for revenue-related statuses
        if (transaction.payment_status === "Completed") {
          acc[key].completed += 1;
        } else if (transaction.payment_status === "Pending") {
          acc[key].pending += 1;
        } else if (transaction.payment_status === "Refunded") {
          acc[key].failed += 1;
        }

        // Track transaction types
        if (transaction.transaction_type === "rental") {
          acc[key].rental += 1;
        } else if (transaction.transaction_type === "sell") {
          acc[key].sell += 1;
        }

        return acc;
      }, {});

      // Sort by the sortKey we stored
      const sortedKeys = Object.keys(groupedData).sort((a, b) => {
        return groupedData[a].sortKey - groupedData[b].sortKey;
      });

      let datasets = [];

      if (metric === "count") {
        datasets = [
          {
            label: "Total Transactions",
            data: sortedKeys.map((key) => groupedData[key].count),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "Completed",
            data: sortedKeys.map((key) => groupedData[key].completed),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
          {
            label: "Pending",
            data: sortedKeys.map((key) => groupedData[key].pending),
            backgroundColor: "rgba(255, 206, 86, 0.6)",
          },
        ];
      } else if (metric === "revenue") {
        datasets = [
          {
            label: "Revenue (₱)",
            data: sortedKeys.map((key) => groupedData[key].totalAmount),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            yAxisID: "y1",
            type: "line",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
            fill: false,
          },
        ];
      } else if (metric === "type") {
        datasets = [
          {
            label: "Rental",
            data: sortedKeys.map((key) => groupedData[key].rental),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "Sell",
            data: sortedKeys.map((key) => groupedData[key].sell),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
        ];
      }

      setChartData({
        labels: sortedKeys,
        datasets,
      });
    };

    processData();
  }, [transactions, timeframe, metric]);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Transactions Growth</h5>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            style={{ width: "150px" }}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <select
            className="form-select"
            style={{ width: "150px" }}
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="count">Transaction Count</option>
            <option value="revenue">Revenue</option>
            <option value="type">By Type</option>
          </select>
        </div>
      </div>

      <div style={{ height: "350px" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text:
                    metric === "revenue"
                      ? "Revenue (₱)"
                      : "Number of Transactions",
                },
              },
              y1: {
                beginAtZero: true,
                position: "right",
                title: {
                  display: true,
                  text: "Revenue (₱)",
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    if (metric === "revenue") {
                      label += `₱${context.raw.toFixed(2)}`;
                    } else {
                      label += context.raw;
                    }
                    return label;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export const PaymentModeDistribution = ({ transactions }) => {
  // Aggregate payment methods
  const paymentData = transactions.reduce((acc, transaction) => {
    const method = transaction.payment_mode || "Unknown"; // Default if missing
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  // Total transactions
  const total = transactions.length;

  // Assign colors dynamically
  const paymentColors = {
    "payment upon meetup": "#007bff",
    gcash: "#ff9900",
    Unknown: "#6c757d",
  };

  // Convert data into an array with percentages
  const paymentPercentages = Object.entries(paymentData).map(
    ([method, count]) => ({
      method,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    })
  );

  const chartData = {
    labels: Object.keys(paymentData),
    datasets: [
      {
        data: Object.values(paymentData),
        backgroundColor: Object.keys(paymentData).map(
          (method) => paymentColors[method] || "#8a2be2" // Default color
        ),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-3">
      <h5 className="mb-3 text-center">Payment Mode Distribution</h5>
      <p className="text-muted text-center">
        Total Transactions: <strong>{total}</strong>
      </p>

      <div className="d-flex justify-content-center">
        <div style={{ width: "300px" }}>
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    padding: 10,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const percentage = paymentPercentages.find(
                        (item) => item.method === context.label
                      )?.percentage;
                      return `${context.label}: ${context.raw} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <h6>Payment Summary</h6>
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Method</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {paymentPercentages.map(({ method, count, percentage }) => (
              <tr key={method}>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: paymentColors[method] || "#8a2be2",
                      color: "#fff",
                      padding: "6px 10px",
                    }}
                  >
                    {method}
                  </span>
                </td>
                <td>{count}</td>
                <td>{percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TransactionFunnelAnalysis = ({ transactions }) => {
  const funnelSteps = [
    { name: "Requested", statuses: ["Requested"] },
    { name: "Accepted", statuses: ["Accepted"] },
    { name: "Handed Over", statuses: ["HandedOver"] },
    { name: "Completed", statuses: ["Completed"] },
  ];

  const funnelData = funnelSteps.map((step) => {
    const count = transactions.filter((t) =>
      step.statuses.includes(t.status)
    ).length;
    return { ...step, count };
  });

  const funnelWithRates = funnelData.map((step, index) => {
    const previousCount =
      index === 0 ? transactions.length : funnelData[index - 1].count;
    const conversionRate =
      previousCount > 0 ? ((step.count / previousCount) * 100).toFixed(1) : 0;
    const overallRate = ((step.count / transactions.length) * 100).toFixed(1);

    return {
      ...step,
      conversionRate,
      overallRate,
      dropOff: index === 0 ? 0 : funnelData[index - 1].count - step.count,
    };
  });

  return (
    <div className="p-4 bg-white rounded shadow mb-3">
      <h5 className="mb-3 text-center">Transaction Funnel Analysis</h5>

      {/* Chart at the top */}
      <div className="mb-4">
        <Bar
          data={{
            labels: funnelWithRates.map((step) => step.name),
            datasets: [
              {
                label: "Transactions",
                data: funnelWithRates.map((step) => step.count),
                backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"],
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    const step = funnelWithRates[context.dataIndex];
                    return [
                      `Step Conversion: ${step.conversionRate}%`,
                      `Overall Conversion: ${step.overallRate}%`,
                      `Drop-off: ${step.dropOff}`,
                    ];
                  },
                },
              },
            },
          }}
        />
      </div>

      {/* Breakdown list in a 2x2 grid */}
      <div className="row g-3">
        {funnelWithRates.map((step) => (
          <div key={step.name} className="col-md-6">
            <div className="p-3 border rounded shadow-sm bg-light">
              <div className="d-flex justify-content-between">
                <strong>{step.name}</strong>
                <span className="badge bg-primary rounded-pill">
                  {step.count}
                </span>
              </div>
              <div className="mt-2">
                <small className="text-muted d-block">
                  Step Conversion: {step.conversionRate}%
                </small>
                <small className="text-muted d-block">
                  Overall: {step.overallRate}%
                </small>
                {step.dropOff > 0 && (
                  <small className="text-danger d-block">
                    Drop-off: {step.dropOff}
                  </small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
