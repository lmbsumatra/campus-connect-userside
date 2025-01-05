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
  const growthData = listings.reduce((acc, listing) => {
    const month = new Date(listing.created_at).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "Listings Added",
        data: Object.values(growthData),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listings Growth</h5>
      <div style={{ height: "200px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

export const ListingsByCategory = ({ listings }) => {
  const categoryData = listings.reduce((acc, listing) => {
    const category = listing.category || "Unknown";
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
      <h5>Listings by Category</h5>
      <div style={{ height: "300px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export const ListingStatusDistribution = ({ listings }) => {
  const statusData = listings.reduce((acc, listing) => {
    const status = listing.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: [
          "#28a745", // Approved
          "#ffc107", // Pending
          "#dc3545", // Flagged/Removed
          "#17a2b8", // Other statuses
          "#ff69b4", 
          "#ff4500", 
          "#1e90ff",  
          "#8a2be2", 
        ],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Listing Status Distribution</h5>
      <div style={{ height: "300px" }}>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
};

export const TopUsersForListings = ({ listings }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    //console.log("Listings Data:", listings);
    const filteredListings = filterListingsByTimeRange(listings, timeRange);
    const approvedListings = filteredListings.filter(
      (listing) => listing.status === "approved"
    );
    const userActivity = calculateTopUsers(approvedListings);
    setTopUsers(userActivity); // No need to slice here; calculateTopUsers already limits to top 5
  }, [timeRange, listings]);

  // Filter listings by time range
  const filterListingsByTimeRange = (listings, range) => {
    const now = new Date();

    switch (range) {
      case "daily":
        now.setHours(7, 0, 0, 0);
        const todayStart = new Date(now);
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        return listings.filter((listing) => {
          const createdAt = new Date(listing.created_at);
          return createdAt >= todayStart && createdAt <= todayEnd;
        });

      case "weekly":
        const dayOfWeek = now.getDay();
        const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        const sundayStart = new Date(now.setDate(now.getDate() - diffToSunday));
        sundayStart.setHours(0, 0, 0, 0);
        return listings.filter((listing) => {
          const createdAt = new Date(listing.created_at);
          return createdAt >= sundayStart;
        });

      case "monthly":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        return listings.filter((listing) => {
          const createdAt = new Date(listing.created_at);
          return createdAt >= firstDayOfMonth;
        });

      default:
        return listings;
    }
  };

  // Calculate the top users
  const calculateTopUsers = (approvedListings) => {
    const userCounts = {};

    approvedListings.forEach((listing) => {
      if (listing.owner_id && listing.owner) {
        const userId = listing.owner_id;

        // Combine first_name and last_name to create the full name
        const fullName = `${listing.owner.first_name} ${listing.owner.last_name}`;

        if (!userCounts[userId]) {
          userCounts[userId] = { count: 0, name: fullName };
        }

        userCounts[userId].count++;
      } else {
        console.log("Missing owner_id or owner data for listing:", listing);
      }
    });

    // Sort the user counts and return the top 5
    return Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Users of Listings</h5>
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
              <span>{user.count} Approved Listings</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No approved listings available for the selected time range.</p>
      )}
    </div>
  );
};
