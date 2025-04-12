import React, { useState, useEffect, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
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
  const [timeRange, setTimeRange] = useState("all");

  const filteredListings = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "day":
        return listings.filter(
          (listing) =>
            new Date(listing.createdAt) >
            new Date(now.setDate(now.getDate() - 1))
        );
      case "week":
        return listings.filter(
          (listing) =>
            new Date(listing.createdAt) >
            new Date(now.setDate(now.getDate() - 7))
        );
      case "month":
        return listings.filter(
          (listing) =>
            new Date(listing.createdAt) >
            new Date(now.setMonth(now.getMonth() - 1))
        );
      default:
        return listings;
    }
  }, [listings, timeRange]);

  // Process listings to get total and approved counts per category
  const categoryData = filteredListings.reduce((acc, listing) => {
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
    .sort((a, b) => b.total - a.total);

  // Calculate totals
  const totalListings = sortedCategories.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const totalApproved = sortedCategories.reduce(
    (sum, item) => sum + item.approved,
    0
  );

  // Chart data
  const chartData = {
    labels: sortedCategories.map((item) => `${item.category} (${item.total})`),
    datasets: [
      {
        label: "Total Listings",
        data: sortedCategories.map((item) => item.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Approved Listings",
        data: sortedCategories.map((item) => item.approved),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            const percentage = ((value / totalListings) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  // Get time range label for empty state messages
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "day":
        return "the last 24 hours";
      case "week":
        return "the last week";
      case "month":
        return "the last month";
      default:
        return "any time";
    }
  };

  // Check if there are listings but none in the filtered time range
  const hasListingsButNoneInRange =
    listings.length > 0 && filteredListings.length === 0;

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h5 className="mb-2 mb-md-0">Listings by Category</h5>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-select form-select-sm w-auto"
        >
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="week">Last Week</option>
          <option value="day">Last 24h</option>
        </select>
      </div>

      <div className="text-center mb-2">
        <p className="mb-0">
          Total: {totalListings} | Approved: {totalApproved} (
          {totalListings > 0
            ? Math.round((totalApproved / totalListings) * 100)
            : 0}
          %)
        </p>
      </div>

      <div className="d-flex justify-content-center">
        <div style={{ position: "relative", width: "100%", height: "300px" }}>
          {filteredListings.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : hasListingsButNoneInRange ? (
            <div className="text-center h-100 d-flex flex-column justify-content-center">
              <p className="text-muted mb-2">
                <i className="bi bi-calendar-x fs-4"></i>
              </p>
              <p className="text-muted">
                No listings created in {getTimeRangeLabel()}.
              </p>
              <p className="text-muted small">
                You have {listings.length} listing
                {listings.length !== 1 ? "s" : ""} total.
              </p>
            </div>
          ) : (
            <div className="text-center h-100 d-flex flex-column justify-content-center">
              <p className="text-muted mb-2">
                <i className="bi bi-box-seam fs-4"></i>
              </p>
              <p className="text-muted">No listings available yet.</p>
              <p className="text-muted small">
                Add your first listing to see analytics.
              </p>
            </div>
          )}
        </div>
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
  const [timeRange, setTimeRange] = useState("all");
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const filteredListings = filterListingsByTimeRange(listings, timeRange);
    const userActivity = calculateTopUsers(filteredListings);
    setTopUsers(userActivity);
  }, [timeRange, listings]);

  // Filter listings based on time range
  const filterListingsByTimeRange = (listings, range) => {
    if (range === "all") return listings;

    const now = new Date();
    let startDate = new Date();

    if (range === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "weekly") {
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return listings.filter(
      (listing) => new Date(listing.created_at) >= startDate
    );
  };

  // Compute top users based on listing statuses
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
          b.approved - a.approved ||
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
        <option value="all">All Time</option>
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
      .map((value, i) => `₱${value}-${priceRange[i + 1]}`),
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
