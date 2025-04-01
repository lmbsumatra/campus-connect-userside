import React, { useState, useEffect } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Reports by Category
export const ReportsByCategory = ({ reports }) => {
  const categoryData = reports.reduce((acc, report) => {
    // Use 'entity_type' as the category
    const category = report.entity_type || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Reports by Category</h5>
      <div style={{ height: "300px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

// Reports Growth
export const ReportsGrowth = ({ reports }) => {
  const growthData = reports.reduce((acc, report) => {
    const month = new Date(report.createdAt).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "Reports Created",
        data: Object.values(growthData),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Reports Growth</h5>
      <div style={{ height: "200px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

// Report Status Distribution
export const ReportStatusDistribution = ({ reports }) => {
  const statusData = reports.reduce((acc, report) => {
    const status = report.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: [
          "#28a745", // Resolved
          "#ffc107", // Pending
          "#dc3545", // Escalated
          "#17a2b8", // Other statuses
        ],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Report Status Distribution</h5>
      <div style={{ height: "300px" }}>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
};

// Top Users for Reports
export const TopReportUsers = ({ reports }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const filteredReports = filterReportsByTimeRange(reports, timeRange);
    const userActivity = calculateTopUsers(filteredReports);
    setTopUsers(userActivity);
  }, [timeRange, reports]);

  const filterReportsByTimeRange = (reports, range) => {
    const now = new Date();
    switch (range) {
      case "daily":
        now.setHours(0, 0, 0, 0);
        return reports.filter(
          (report) =>
            new Date(report.createdAt) >= now &&
            new Date(report.createdAt) <
              new Date(now).setDate(now.getDate() + 1)
        );
      case "weekly":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        return reports.filter(
          (report) => new Date(report.createdAt) >= startOfWeek
        );
      case "monthly":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return reports.filter(
          (report) => new Date(report.createdAt) >= startOfMonth
        );
      default:
        return reports;
    }
  };

  const calculateTopUsers = (reports) => {
    const userCounts = reports.reduce((acc, report) => {
      const user = report.reporter
        ? `${report.reporter.first_name} ${report.reporter.last_name}` // Concatenate first and last name
        : "Anonymous"; // Fallback to "Anonymous" if no reporter is available
      acc[user] = (acc[user] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(userCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Report Users</h5>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      {topUsers.length > 0 ? (
        <ol className="list-group list-group-numbered">
          {topUsers.map((user, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{user.name}</span>
              <span>{user.count} Reports</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No reports available for the selected time range.</p>
      )}
    </div>
  );
};
