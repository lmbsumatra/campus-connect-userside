import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const GrowthData = ({ users, listings, posts, sales }) => {
  const [timeInterval, setTimeInterval] = useState("monthly"); // Default to monthly

  const calculateGrowthData = (data, interval) => {
    if (!data || data.length === 0) return [];

    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.created_at || item.createdAt);
      let key;

      if (interval === "daily") {
        key = date.toLocaleDateString(); // Group by day
      } else if (interval === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of the week
        key = weekStart.toLocaleDateString(); // Group by week
      } else if (interval === "monthly") {
        key = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }); // Group by month
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groupedData).map(([key, count]) => ({
      date: key,
      count,
    }));
  };

  const getGrowthData = (interval) => {
    return {
      users: calculateGrowthData(users, interval),
      listings: calculateGrowthData(listings, interval),
      posts: calculateGrowthData(posts, interval),
      sales: calculateGrowthData(sales, interval),
    };
  };

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
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="users" stroke="#8884d8" />
          <Line type="monotone" dataKey="listings" stroke="#82ca9d" />
          <Line type="monotone" dataKey="posts" stroke="#ffc658" />
          <Line type="monotone" dataKey="sales" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
