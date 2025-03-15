import React from "react";
import { format, subDays, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
);

// Common chart options to control height
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        boxWidth: 10,
        padding: 10,
      },
    },
  },
};

export const UserAnalytics = ({ users }) => {
  const growthData = users.reduce((acc, user) => {
    const date = toZonedTime(user.createdAt, "Asia/Singapore"); // Convert to local time
    const month = format(date, "MMM yyyy"); // Format as "Oct 2023"
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "New Users Per Month",
        data: Object.values(growthData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>User Growth</h5>
      <div style={{ height: "150px" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export const ActiveUsersByCollege = ({ users }) => {
  const collegeData = users.reduce((acc, user) => {
    const college = user.student?.college || "Unassigned"; // Use "Unassigned" instead of "Unknown"
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
      <div style={{ height: "150px" }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export const VerificationRate = ({ users }) => {
  const verificationData = users.reduce((acc, user) => {
    const date = format(
      toZonedTime(user.createdAt, "Asia/Singapore"),
      "yyyy-MM-dd"
    ); // Convert to local time
    acc[date] = acc[date] || { verified: 0, total: 0 };
    acc[date].total += 1;
    if (user.student?.status === "verified") acc[date].verified += 1;
    return acc;
  }, {});

  const labels = Object.keys(verificationData);
  const verifiedCounts = labels.map(
    (date) =>
      (verificationData[date].verified / verificationData[date].total) * 100
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Verification Rate (%)",
        data: verifiedCounts,
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Verification Rate Over Time</h5>
      <div style={{ height: "150px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export const RetentionRate = ({ users }) => {
  const calculateRetentionRate = (users) => {
    const cutoffDate = subDays(new Date(), 30); // Last 30 days
    const activeUsers = users.filter((user) => {
      if (!user.lastlogin) return false;
      const lastLogin = toZonedTime(user.lastlogin, "Asia/Singapore"); // Convert to local time
      return lastLogin >= cutoffDate;
    }).length;

    return ((activeUsers / users.length) * 100).toFixed(2);
  };

  const retentionRate = calculateRetentionRate(users);

  const chartData = {
    labels: Array.from(
      { length: 30 },
      (_, i) => format(subDays(new Date(), 30 - i), "MMM d") // Convert to readable format
    ),
    datasets: [
      {
        label: "Retention Rate (%)",
        data: Array.from({ length: 30 }, (_, i) => {
          const cutoffDate = subDays(new Date(), 30 - i);
          const activeUsers = users.filter((user) => {
            if (!user.lastlogin) return false;
            const lastLogin = toZonedTime(user.lastlogin, "Asia/Singapore"); // Convert to local time
            return lastLogin >= cutoffDate;
          }).length;
          return ((activeUsers / users.length) * 100).toFixed(2);
        }),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Retention Rate Over Time</h5>
      <div style={{ height: "150px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
      <small>{`${retentionRate}% of users active in the last 30 days`}</small>
    </div>
  );
};
