// src/components/Analytics/SaleAnalyticsComponent.js
import React, { useState, useEffect, useMemo } from "react";
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
  const [timeRange, setTimeRange] = useState("all");

  const filteredItems = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "day":
        return items.filter(
          (item) =>
            new Date(item.createdAt) > new Date(now.setDate(now.getDate() - 1))
        );
      case "week":
        return items.filter(
          (item) =>
            new Date(item.createdAt) > new Date(now.setDate(now.getDate() - 7))
        );
      case "month":
        return items.filter(
          (item) =>
            new Date(item.createdAt) >
            new Date(now.setMonth(now.getMonth() - 1))
        );
      default:
        return items;
    }
  }, [items, timeRange]);

  // Process items to get total and approved counts per category
  const categoryData = filteredItems.reduce((acc, item) => {
    const category = item.category || "Unknown";
    acc[category] = acc[category] || { total: 0, approved: 0 };
    acc[category].total++;
    if (item.status === "approved") {
      acc[category].approved++;
    }
    return acc;
  }, {});

  // Convert to an array and sort by total items
  const sortedCategories = Object.entries(categoryData)
    .map(([category, counts]) => ({ category, ...counts }))
    .sort((a, b) => b.total - a.total);

  // Calculate totals
  const totalItems = sortedCategories.reduce(
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
        label: "Total Items",
        data: sortedCategories.map((item) => item.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Approved Items",
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
            const percentage = ((value / totalItems) * 100).toFixed(2);
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

  // Check if there are items but none in the filtered time range
  const hasItemsButNoneInRange = items.length > 0 && filteredItems.length === 0;

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h5 className="mb-2 mb-md-0">Items by Category</h5>
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
          Total: {totalItems} | Approved: {totalApproved} (
          {totalItems > 0 ? Math.round((totalApproved / totalItems) * 100) : 0}
          %)
        </p>
      </div>

      <div className="d-flex justify-content-center">
        <div style={{ position: "relative", width: "100%", height: "300px" }}>
          {filteredItems.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : hasItemsButNoneInRange ? (
            <div className="text-center h-100 d-flex flex-column justify-content-center">
              <p className="text-muted mb-2">
                <i className="bi bi-calendar-x fs-4"></i>
              </p>
              <p className="text-muted">
                No items created in {getTimeRangeLabel()}.
              </p>
              <p className="text-muted small">
                You have {items.length} item{items.length !== 1 ? "s" : ""}{" "}
                total.
              </p>
            </div>
          ) : (
            <div className="text-center h-100 d-flex flex-column justify-content-center">
              <p className="text-muted mb-2">
                <i className="bi bi-box-seam fs-4"></i>
              </p>
              <p className="text-muted">No items available yet.</p>
              <p className="text-muted small">
                Add your first item to see analytics.
              </p>
            </div>
          )}
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

  // Total transactions
  const total = items.length;

  // Assign colors dynamically for better readability
  const statusColors = {
    approved: "#28a745", // Green
    pending: "#ffc107", // Yellow
    declined: "#fd7e14", // Orange
    revoked: "#ff5733", // Red-Orange
    removed: "#dc3545", // Red
    flagged: "#6f42c1", // Purple
    unknown: "#17a2b8", // Blue (fallback)
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
      <h5 className="mb-3 text-center">Item Status Distribution</h5>
      <p className="text-muted text-center">
        Total Item: <strong>{total}</strong>
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
