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
import { ShoppingCart, Handshake, Crown } from "lucide-react";

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

export const CompletedTransactionsAndPopularCategories = ({
  transactions,
  listings,
}) => {
  // Filter completed transactions
  const completedTransactions = transactions.filter(
    (transaction) => transaction.status === "Completed"
  );

  // Calculate completed rentals and sales
  const completedRentals = completedTransactions.filter(
    (transaction) => transaction.transaction_type === "rental"
  ).length;

  const completedSales = completedTransactions.filter(
    (transaction) => transaction.transaction_type === "sell"
  ).length;

  // Calculate popular categories from listings
  const categoryCounts = listings.reduce((acc, listing) => {
    const category = listing.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Sort categories by count and limit to top 5
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
    .slice(0, 5) // Limit to top 5 categories
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="chart-card">
      <h3>Completed Transactions & Popular Categories</h3>

      {/* Improved Counters for Completed Transactions */}
      <div className="counters-grid">
        <div className="counter-card" style={{ backgroundColor: "#3498db" }}>
          <Handshake size={24} color="#fff" />
          <span className="counter-label">Completed Rentals</span>
          <span className="counter-value">{completedRentals}</span>
        </div>
        <div className="counter-card" style={{ backgroundColor: "#27ae60" }}>
          <ShoppingCart size={24} color="#fff" />
          <span className="counter-label">Completed Sales</span>
          <span className="counter-value">{completedSales}</span>
        </div>
      </div>

      {/* Popular Categories (Limited to Top 5) */}
      <div>
        <h4>Top 5 Popular Categories</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCategories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TopTransactionUsers = ({ transactions, users }) => {
  const [timeInterval, setTimeInterval] = useState("all"); // Default to "all time"

  // Filter only completed transactions
  const completedTransactions = transactions.filter(
    (t) => t.status === "Completed"
  );

  // Filter transactions based on selected time interval
  const filterTransactionsByTime = (transactions) => {
    const now = new Date();
    return transactions.filter((t) => {
      const transactionDate = new Date(t.createdAt || t.created_at);

      switch (timeInterval) {
        case "daily":
          return transactionDate.toDateString() === now.toDateString();
        case "weekly":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return transactionDate >= weekStart;
        case "monthly":
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        case "yearly":
          return transactionDate.getFullYear() === now.getFullYear();
        default: // "all"
          return true;
      }
    });
  };

  const filteredTransactions = filterTransactionsByTime(completedTransactions);

  // Process data to find top owners (sellers/renters) and top buyers/renters
  const processLeaderboard = () => {
    const ownerCounts = {};
    const buyerCounts = {};

    filteredTransactions.forEach((transaction) => {
      // Count for owners (sellers/renters)
      const ownerId = transaction.owner_id;
      if (ownerId) {
        ownerCounts[ownerId] = (ownerCounts[ownerId] || 0) + 1;
      }

      // Count for buyers/renters
      const buyerId = transaction.renter_id || transaction.buyer_id;
      if (buyerId) {
        buyerCounts[buyerId] = (buyerCounts[buyerId] || 0) + 1;
      }
    });

    // Convert to arrays and sort
    const topOwners = Object.entries(ownerCounts)
      .map(([userId, count]) => {
        const user = users.find((u) => u.user_id === parseInt(userId));
        return {
          user,
          count,
          type: "Owner",
          name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 owners

    const topBuyers = Object.entries(buyerCounts)
      .map(([userId, count]) => {
        const user = users.find((u) => u.user_id === parseInt(userId));
        return {
          user,
          count,
          type: "Buyer/Renter",
          name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 buyers

    return { topOwners, topBuyers };
  };

  const { topOwners, topBuyers } = processLeaderboard();

  const renderLeaderboard = (title, leaderboardData) => (
    <div className="leaderboard-section">
      <h4>{title}</h4>
      <div className="leaderboard-grid">
        {leaderboardData.map((item, index) => {
          const rankClass = index < 3 ? `rank-${index + 1}` : "";
          return (
            <div
              key={`${title}-${index}`}
              className={`leaderboard-item ${rankClass}`}
              title={item.name} // This adds a tooltip on hover
            >
              {index < 3 && <Crown className="crown-icon" />}
              <div className="leaderboard-content">
                <div className="leaderboard-rank">{index + 1}</div>
                <div className="leaderboard-name">{item.name}</div>
                <div className="leaderboard-count">
                  <ShoppingCart size={16} />
                  <span>{item.count} Transactions</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="transaction-leaderboard">
      <div className="leaderboard-header">
        <h3>Transaction Leaderboard</h3>
        <div className="time-interval-selector">
          <select
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>
      <div className="leaderboard-container">
        {renderLeaderboard("Top Owners", topOwners)}
        {renderLeaderboard("Top Buyers/Renters", topBuyers)}
      </div>
    </div>
  );
};
