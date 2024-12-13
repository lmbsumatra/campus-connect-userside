// src/components/Analytics/UserAnalyticsComponents.js
import React from "react";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
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

// Register required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const UserAnalytics = ({ users }) => {
  const growthData = users.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "New Users",
        data: Object.values(growthData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>User Growth</h5>
      <div style={{ height: "200px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

export const ActiveUsersByCollege = ({ users }) => {
  const collegeData = users.reduce((acc, user) => {
    const college = user.student?.college || "Unknown";
    acc[college] = (acc[college] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(collegeData),
    datasets: [
      {
        data: Object.values(collegeData),
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
      <h5>Active Users by College</h5>
      <div style={{ height: "300px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export const VerificationRate = ({ users }) => {
  const verifiedUsers = users.filter(
    (user) => user.status === "verified"
  ).length;
  const verificationRate = ((verifiedUsers / users.length) * 100).toFixed(1);

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>User Verification Rate</h5>
      <div className="progress" style={{ height: "20px" }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{ width: `${verificationRate}%` }}
          aria-valuenow={verificationRate}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {verificationRate}%
        </div>
      </div>
      <small>{`${verifiedUsers} out of ${users.length} users verified`}</small>
    </div>
  );
};
