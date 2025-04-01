// src/components/Analytics/SaleAnalyticsComponent.js
import React, { useState, useEffect } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Items by Category Widget
export const ItemsByCategory = ({ items }) => {
  const categoryData = items.reduce((acc, item) => {
    const category = item.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const totalItems = Object.values(categoryData).reduce(
    (sum, count) => sum + count,
    0
  );

  const chartData = {
    labels: Object.keys(categoryData).map(
      (category) => `${category} (${categoryData[category]})`
    ), // Category with count
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
          "#8BC34A",
          "#E91E63",
          "#3F51B5",
          "#009688",
          "#795548",
          "#607D8B",
        ], // Enhanced color palette
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const percentage = ((value / totalItems) * 100).toFixed(2);
            return `${value} Listings (${percentage}%)`;
          },
        },
      },
      legend: {
        position: "right",
        align: "start",
        labels: {
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2 d-flex flex-column align-items-center">
      <h5 className="text-center">Items by Category</h5>
      <p className="text-center">Total Listings: {totalItems}</p>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div style={{ width: "60%" }}>
          {" "}
          {/* Adjusts centering */}
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

// Listing Growth Widget
export const ListingGrowth = ({ items }) => {
  // Group data by month & week
  const growthData = {};
  items.forEach((item) => {
    const date = new Date(item.created_at);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const week = `Week ${Math.ceil(date.getDate() / 7)}`;

    if (!growthData[month]) {
      growthData[month] = { total: 0, weekly: {} };
    }

    growthData[month].total += 1;
    growthData[month].weekly[week] = (growthData[month].weekly[week] || 0) + 1;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(growthData).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  let cumulative = 0;
  const barData = [];
  const cumulativeData = [];

  sortedMonths.forEach((month) => {
    cumulative += growthData[month].total;
    barData.push(growthData[month].total);
    cumulativeData.push(cumulative);
  });

  const chartData = {
    labels: sortedMonths,
    datasets: [
      {
        type: "bar",
        label: "Monthly Listings",
        data: barData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        type: "line",
        label: "Cumulative Growth",
        data: cumulativeData,
        borderColor: "#FF6384",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Listings Count",
        },
      },
    },
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listing Growth</h5>
      <p className="text-muted">Monthly growth with cumulative trend</p>
      <div style={{ height: "300px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Item Status Distribution Widget
export const ItemStatusDistribution = ({ items }) => {
  const statusData = items.reduce((acc, item) => {
    const status = item.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const totalItems = Object.values(statusData).reduce(
    (sum, count) => sum + count,
    0
  );

  const chartData = {
    labels: Object.keys(statusData).map(
      (status) =>
        `${status} (${((statusData[status] / totalItems) * 100).toFixed(1)}%)`
    ),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: Object.keys(statusData).map((status) => {
          const colors = {
            approved: "#28a745", // Green
            pending: "#ffc107", // Yellow
            declined: "#dc3545", // Red
            removed: "#6c757d", // Gray
            revoked: "#6610f2", // Purple
          };
          return colors[status] || "#17a2b8"; // Default to Blue
        }),
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Item Status Distribution</h5>
      <p className="text-muted">Total Listings: {totalItems}</p>
      <div
        style={{
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  boxWidth: 15,
                },
              },
            },
            layout: {
              padding: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

//top seller widget
export const TopSellers = ({ items }) => {
  const [timeRange, setTimeRange] = useState("all-time");
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    const filteredItems = filterItemsByTimeRange(items, timeRange);
    const approvedItems = filteredItems.filter(
      (item) => item.status === "approved" && !isNaN(parseFloat(item.price))
    );
    const sellerActivity = calculateTopSellers(approvedItems);
    setTopSellers(sellerActivity);
  }, [timeRange, items]);

  const filterItemsByTimeRange = (items, range) => {
    const now = new Date();

    switch (range) {
      case "daily":
        now.setHours(0, 0, 0, 0);
        return items.filter((item) => new Date(item.created_at) >= now);

      case "weekly":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return items.filter((item) => new Date(item.created_at) >= oneWeekAgo);

      case "monthly":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return items.filter(
          (item) => new Date(item.created_at) >= firstDayOfMonth
        );

      case "all-time":
        return items;

      default:
        return items;
    }
  };

  const calculateTopSellers = (approvedItems) => {
    const sellerStats = {};

    approvedItems.forEach((item) => {
      if (item.seller_id && item.seller) {
        const sellerId = item.seller_id;
        const fullName = `${item.seller.first_name} ${item.seller.last_name}`;
        const itemPrice = parseFloat(item.price) || 0;

        if (!sellerStats[sellerId]) {
          sellerStats[sellerId] = { count: 0, revenue: 0, name: fullName };
        }

        sellerStats[sellerId].count++;
        sellerStats[sellerId].revenue += itemPrice;
      }
    });

    return Object.values(sellerStats)
      .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Sellers</h5>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="all-time">All Time</option>
      </select>
      {topSellers.length > 0 ? (
        <ol className="list-group list-group-numbered">
          {topSellers.map((seller, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{seller.name}</span>
              <span>
                {seller.count} {seller.count === 1 ? "Item" : "Items"} | ₱
                {seller.revenue.toFixed(2)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No approved items available for the selected time range.</p>
      )}
    </div>
  );
};

export const RevenueTrends = ({ items }) => {
  const [selectedChart, setSelectedChart] = useState("revenue");

  // 1️⃣ Group revenue data
  const revenueByMonth = {};
  const revenueByCategory = {};

  items.forEach((item) => {
    if (item.status !== "approved") return;

    const price = parseFloat(item.price) || 0;
    const date = new Date(item.created_at);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    // Revenue by Month
    revenueByMonth[month] = (revenueByMonth[month] || 0) + price;

    // Revenue by Category
    revenueByCategory[item.category] =
      (revenueByCategory[item.category] || 0) + price;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(revenueByMonth).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Chart Data
  const revenueTrendData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Revenue ($)",
        data: sortedMonths.map((month) => revenueByMonth[month] || 0),
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueCategoryData = {
    labels: Object.keys(revenueByCategory),
    datasets: [
      {
        label: "Revenue by Category ($)",
        data: Object.values(revenueByCategory),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC24A",
          "#FF5722",
          "#607D8B",
          "#9C27B0",
        ],
      },
    ],
  };

  const renderSelectedChart = () => {
    switch (selectedChart) {
      case "revenue":
        return (
          <Line
            data={revenueTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => ` ₱${context.parsed.y.toFixed(2)}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => ` ₱${value}`,
                  },
                },
              },
            }}
          />
        );
      case "category":
        return (
          <Bar
            data={revenueCategoryData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => ` ₱${context.parsed.y.toFixed(2)}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => ` ₱${value}`,
                  },
                },
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Revenue Analytics</h5>
        <select
          className="form-select form-select-sm w-auto"
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
        >
          <option value="revenue">Revenue Trend</option>
          <option value="category">By Category</option>
        </select>
      </div>

      <div style={{ height: "400px" }}>{renderSelectedChart()}</div>

      <p className="text-muted mt-2">
        {selectedChart === "revenue" && "Monthly revenue trend"}
        {selectedChart === "category" &&
          "Revenue distribution across product categories"}
      </p>
    </div>
  );
};
