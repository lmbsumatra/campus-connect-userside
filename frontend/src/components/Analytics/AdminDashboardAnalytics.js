import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

export const GrowthData = ({ users, listings, posts, sales }) => {
  const [timeInterval, setTimeInterval] = useState("monthly");

  const calculateGrowthData = (data, interval) => {
    if (!data || data.length === 0) return [];

    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.created_at || item.createdAt);
      let key;

      if (interval === "daily") {
        key = date.toLocaleDateString();
      } else if (interval === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString();
      } else if (interval === "monthly") {
        key = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groupedData).map(([key, count]) => ({
      date: key,
      count,
    }));
  };

  const getGrowthData = (interval) => ({
    users: calculateGrowthData(users, interval),
    listings: calculateGrowthData(listings, interval),
    posts: calculateGrowthData(posts, interval),
    sales: calculateGrowthData(sales, interval),
  });

  const growthData = getGrowthData(timeInterval);

  const chartData = growthData.users.map((userData, index) => ({
    date: userData.date,
    users: userData.count,
    listings: growthData.listings[index]?.count || 0,
    posts: growthData.posts[index]?.count || 0,
    sales: growthData.sales[index]?.count || 0,
  }));

  return (
    <div className="chart-card">
      <h3>Growth Overview</h3>
      <select
        value={timeInterval}
        onChange={(e) => setTimeInterval(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          {/* Grid for better readability */}
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />

          <XAxis dataKey="date" tick={{ fill: "#333", fontSize: 12 }} />
          <YAxis tick={{ fill: "#333", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "white", borderRadius: "5px" }}
          />
          <Legend />

          {/* Thicker and more visible lines */}
          <Line
            type="monotone"
            dataKey="users"
            stroke="#4c6ef5"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="listings"
            stroke="#2ca02c"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="posts"
            stroke="#ffa726"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#d62728"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export const TotalRegisteredUser = ({ users }) => {
  const [selectedChart, setSelectedChart] = useState("userStatus");

  // Count users based on their status
  const totalVerifiedUsers = users.filter(
    (user) => user.student.status === "verified"
  ).length;
  const totalPendingUsers = users.filter(
    (user) => user.student.status === "pending"
  ).length;
  const totalFlaggedUsers = users.filter(
    (user) => user.student.status === "flagged"
  ).length;
  const totalBannedUsers = users.filter(
    (user) => user.student.status === "banned"
  ).length;

  // Generate last 7 days data
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }).reverse(); // Keep in chronological order

  // Active users per day (last 7 days)
  const activeUsersPerDay = last7Days.map((date) => ({
    date,
    count: users.filter(
      (user) => user.lastlogin && user.lastlogin.startsWith(date)
    ).length,
  }));

  // College Distribution (Grouping users by college)
  const collegeCounts = users.reduce((acc, user) => {
    const college = user.student.college || "Unknown";
    acc[college] = (acc[college] || 0) + 1;
    return acc;
  }, {});

  const collegeData = Object.keys(collegeCounts).map((college) => ({
    name: college,
    value: collegeCounts[college],
  }));

  // Pie chart data (User Status)
  const statusData = [
    { name: "Verified", value: totalVerifiedUsers },
    { name: "Pending", value: totalPendingUsers },
    { name: "Flagged", value: totalFlaggedUsers },
    { name: "Banned", value: totalBannedUsers },
  ];

  const COLORS = ["#3498db", "#f39c12", "#e74c3c", "#c0392b"];

  return (
    <div className="chart-container">
      <h3>Total Registered Users</h3>

      {/* Dropdown Menu to Select Chart Type */}
      <select
        className="chart-selector"
        onChange={(e) => setSelectedChart(e.target.value)}
        value={selectedChart}
      >
        <option value="userStatus">User Status Distribution</option>
        <option value="activeUsers">Active Users Over Time</option>
        <option value="collegeDistribution">College Distribution</option>
      </select>

      <div className="chart-card">
        {selectedChart === "userStatus" && (
          <>
            <h4>User Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}

        {selectedChart === "activeUsers" && (
          <>
            <h4>Active Users Over the Last 7 Days</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activeUsersPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3498db"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {selectedChart === "collegeDistribution" && (
          <>
            <h4>College Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={collegeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {collegeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};
