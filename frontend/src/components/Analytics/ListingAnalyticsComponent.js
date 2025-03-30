import React, { useState, useEffect } from "react";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
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

export const ListingsGrowth = ({ listings }) => {
  const [timeRange, setTimeRange] = useState("monthly");

  // Function to filter listings based on selected time range
  const filterListingsByTimeRange = (listings, range) => {
    const now = new Date();
    let filteredListings = [];

    switch (range) {
      case "weekly":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        filteredListings = listings.filter(
          (listing) => new Date(listing.created_at) >= oneWeekAgo
        );
        break;

      case "monthly":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        filteredListings = listings.filter(
          (listing) => new Date(listing.created_at) >= oneMonthAgo
        );
        break;

      case "yearly":
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        filteredListings = listings.filter(
          (listing) => new Date(listing.created_at) >= oneYearAgo
        );
        break;

      default:
        filteredListings = listings;
    }

    return filteredListings;
  };

  // Process listings to get the count of new & approved listings over time
  const getGrowthData = (filteredListings, range) => {
    const growthData = {};
    const approvedGrowthData = {};

    filteredListings.forEach((listing) => {
      const date = new Date(listing.created_at);
      let label;

      if (range === "weekly") {
        label = date.toLocaleString("default", { weekday: "short" });
      } else if (range === "monthly") {
        label = date.toLocaleString("default", { day: "2-digit" });
      } else if (range === "yearly") {
        label = date.toLocaleString("default", { month: "short" });
      }

      growthData[label] = (growthData[label] || 0) + 1;
      if (listing.status === "approved") {
        approvedGrowthData[label] = (approvedGrowthData[label] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(growthData),
      newListings: Object.values(growthData),
      approvedListings: Object.values(approvedGrowthData),
    };
  };

  // Filter listings based on the selected time range
  const filteredListings = filterListingsByTimeRange(listings, timeRange);
  const { labels, newListings, approvedListings } = getGrowthData(
    filteredListings,
    timeRange
  );

  // Prepare chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: "New Listings",
        data: newListings,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
      {
        label: "Approved Listings",
        data: approvedListings,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listings Growth Trends</h5>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <div style={{ height: "250px" }}>
        <Line
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

export const ListingsByCategory = ({ listings }) => {
  // Process listings to get total and approved counts per category
  const categoryData = listings.reduce((acc, listing) => {
    const category = listing.category || "Unknown";
    acc[category] = acc[category] || { total: 0, approved: 0 };
    acc[category].total++;
    if (listing.status === "approved") {
      acc[category].approved++;
    }
    return acc;
  }, {});

  // Convert to an array and sort by total listings
  const sortedCategories = Object.entries(categoryData)
    .map(([category, counts]) => ({ category, ...counts }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Get top 5 categories

  // Extract data for chart
  const chartData = {
    labels: sortedCategories.map((item) => item.category),
    datasets: [
      {
        label: "Total Listings",
        data: sortedCategories.map((item) => item.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Approved Listings",
        data: sortedCategories.map((item) => item.approved),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top 5 Categories - Listings Breakdown</h5>
      <div style={{ height: "300px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

export const ListingStatusTrends = ({ listings }) => {
  const [timeRange, setTimeRange] = useState("weekly");

  // Group listings by week or month and count statuses
  const processData = (listings, range) => {
    const statusColors = {
      approved: "#28a745",
      pending: "#ffc107",
      flagged: "#dc3545",
      removed: "#ff4500",
      revoked: "#ff69b4",
      declined: "#1e90ff",
      unavailable: "#8a2be2",
    };

    const groupedData = listings.reduce((acc, listing) => {
      const date = new Date(listing.created_at);
      const period =
        range === "weekly"
          ? `Week ${Math.ceil(date.getDate() / 7)}`
          : date.toLocaleString("default", { month: "short" });

      if (!acc[period]) acc[period] = {};
      acc[period][listing.status] = (acc[period][listing.status] || 0) + 1;
      return acc;
    }, {});

    // Prepare data for the stacked bar chart
    const labels = Object.keys(groupedData);
    const statuses = Object.keys(statusColors);

    const datasets = statuses.map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      data: labels.map((label) => groupedData[label][status] || 0),
      backgroundColor: statusColors[status],
    }));

    return { labels, datasets };
  };

  const chartData = processData(listings, timeRange);

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listing Status Trends</h5>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <div style={{ height: "300px" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
          }}
        />
      </div>
    </div>
  );
};

export const TopUsersForListings = ({ listings }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const filteredListings = filterListingsByTimeRange(listings, timeRange);
    const userActivity = calculateTopUsers(filteredListings);
    setTopUsers(userActivity);
  }, [timeRange, listings]);

  // Filter listings by time range
  const filterListingsByTimeRange = (listings, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "weekly":
        const dayOfWeek = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - dayOfWeek));
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return listings;
    }

    return listings.filter(
      (listing) => new Date(listing.created_at) >= startDate
    );
  };

  // Calculate top users with different listing statuses
  const calculateTopUsers = (filteredListings) => {
    const userCounts = {};

    filteredListings.forEach((listing) => {
      if (listing.owner_id && listing.owner) {
        const userId = listing.owner_id;
        const fullName = `${listing.owner.first_name} ${listing.owner.last_name}`;

        if (!userCounts[userId]) {
          userCounts[userId] = {
            name: fullName,
            approved: 0,
            pending: 0,
            removed: 0,
          };
        }

        if (listing.status === "approved") userCounts[userId].approved++;
        if (listing.status === "pending") userCounts[userId].pending++;
        if (listing.status === "removed") userCounts[userId].removed++;
      }
    });

    return Object.values(userCounts)
      .sort(
        (a, b) =>
          b.approved +
          b.pending +
          b.removed -
          (a.approved + a.pending + a.removed)
      )
      .slice(0, 5);
  };

  const chartData = {
    labels: topUsers.map((user) => user.name),
    datasets: [
      {
        label: "Approved",
        data: topUsers.map((user) => user.approved),
        backgroundColor: "#28a745",
      },
      {
        label: "Pending",
        data: topUsers.map((user) => user.pending),
        backgroundColor: "#ffc107",
      },
      {
        label: "Removed",
        data: topUsers.map((user) => user.removed),
        backgroundColor: "#dc3545",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Users with Most Listings</h5>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <div style={{ height: "300px" }}>
        {topUsers.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
              scales: { x: { stacked: true }, y: { stacked: true } },
            }}
          />
        ) : (
          <p>No listings available for the selected time range.</p>
        )}
      </div>
    </div>
  );
};

export const ListingPriceDistribution = ({ listings }) => {
  const prices = listings
    .map((listing) => listing.rate)
    .filter((rate) => rate > 0);
  const priceRange = [0, 100, 200, 500, 1000, 2000, 5000];
  const priceCounts = Array(priceRange.length).fill(0);

  prices.forEach((price) => {
    for (let i = 0; i < priceRange.length - 1; i++) {
      if (price >= priceRange[i] && price < priceRange[i + 1]) {
        priceCounts[i]++;
        break;
      }
    }
  });

  const chartData = {
    labels: priceRange
      .slice(0, -1)
      .map((value, i) => `${value}-${priceRange[i + 1]}`),
    datasets: [
      {
        label: "Number of Listings",
        data: priceCounts,
        backgroundColor: "#FFCE56",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listing Price Distribution</h5>
      <div style={{ height: "300px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};
