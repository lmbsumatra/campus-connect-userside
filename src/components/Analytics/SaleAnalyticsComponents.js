// src/components/Analytics/SaleAnalyticsComponent.js
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

// Items by Category Widget
export const ItemsByCategory = ({ items }) => {
  const categoryData = items.reduce((acc, item) => {
    const category = item.category || "Unknown";
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
      <h5>Items by Category</h5>
      <div style={{ height: "300px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

// Listing Growth Widget
export const ListingGrowth = ({ items }) => {
  const growthData = items.reduce((acc, item) => {
    const month = new Date(item.created_at).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "Listings Created",
        data: Object.values(growthData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listing Growth</h5>
      <div style={{ height: "200px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
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

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: ["#28a745", "#ffc107", "#dc3545", "#17a2b8"],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Item Status Distribution</h5>
      <div style={{ height: "300px" }}>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
};
//top seller widget
export const TopSellers = ({ items }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [topSellers, setTopSellers] = useState([]);

  useEffect(() => {
    const filteredItems = filterItemsByTimeRange(items, timeRange);
    const approvedItems = filteredItems.filter(
      (item) => item.status === "approved"
    );
    const sellerActivity = calculateTopSellers(approvedItems);
    setTopSellers(sellerActivity); // No need to slice here; calculateTopSellers already limits to top 5
  }, [timeRange, items]);

  // Filter items by time range
  const filterItemsByTimeRange = (items, range) => {
    const now = new Date();

    switch (range) {
      case "daily":
        now.setHours(7, 0, 0, 0);
        const todayStart = new Date(now);
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        return items.filter((item) => {
          const createdAt = new Date(item.created_at);
          return createdAt >= todayStart && createdAt <= todayEnd;
        });

      case "weekly":
        const dayOfWeek = now.getDay();
        const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        const sundayStart = new Date(now.setDate(now.getDate() - diffToSunday));
        sundayStart.setHours(0, 0, 0, 0);
        return items.filter((item) => {
          const createdAt = new Date(item.created_at);
          return createdAt >= sundayStart;
        });

      case "monthly":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        return items.filter((item) => {
          const createdAt = new Date(item.created_at);
          return createdAt >= firstDayOfMonth;
        });

      default:
        return items;
    }
  };

  // Calculate the top sellers
  const calculateTopSellers = (approvedItems) => {
    const sellerCounts = {};

    approvedItems.forEach((item) => {
      if (item.seller_id && item.seller) {
        const sellerId = item.seller_id;

        // Combine first_name and last_name to create the full name
        const fullName = `${item.seller.first_name} ${item.seller.last_name}`;

        if (!sellerCounts[sellerId]) {
          sellerCounts[sellerId] = { count: 0, name: fullName };
        }

        sellerCounts[sellerId].count++;
      } else {
        console.log("Missing seller_id or seller data for item:", item);
      }
    });

    // Sort the seller counts and return the top 5
    return Object.values(sellerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Sellers of Items</h5>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      {topSellers.length > 0 ? (
        <ol className="list-group list-group-numbered">
          {topSellers.map((seller, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{seller.name}</span>
              <span>{seller.count} Approved Items</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No approved items available for the selected time range.</p>
      )}
    </div>
  );
};
