import React, { useState, useEffect, useMemo } from "react";
import { Bar, Pie, Doughnut, Line, Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement
);

export const PostsByCategory = ({ posts }) => {
  const [timeRange, setTimeRange] = useState("all");

  const filteredPosts = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "day":
        return posts.filter(
          (post) =>
            new Date(post.createdAt) > new Date(now.setDate(now.getDate() - 1))
        );
      case "week":
        return posts.filter(
          (post) =>
            new Date(post.createdAt) > new Date(now.setDate(now.getDate() - 7))
        );
      case "month":
        return posts.filter(
          (post) =>
            new Date(post.createdAt) >
            new Date(now.setMonth(now.getMonth() - 1))
        );
      default:
        return posts;
    }
  }, [posts, timeRange]);

  // Process posts to get total and approved counts per category
  const categoryData = filteredPosts.reduce((acc, post) => {
    const category = post.category || "Unknown";
    acc[category] = acc[category] || { total: 0, approved: 0 };
    acc[category].total++;
    if (post.status === "approved") {
      acc[category].approved++;
    }
    return acc;
  }, {});

  // Convert to an array and sort by total posts
  const sortedCategories = Object.entries(categoryData)
    .map(([category, counts]) => ({ category, ...counts }))
    .sort((a, b) => b.total - a.total);

  // Calculate totals
  const totalPosts = sortedCategories.reduce(
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
        label: "Total Posts",
        data: sortedCategories.map((item) => item.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Approved Posts",
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
            const percentage = ((value / totalPosts) * 100).toFixed(2);
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

  // Check if there are posts but none in the filtered time range
  const hasPostsButNoneInRange = posts.length > 0 && filteredPosts.length === 0;

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h5 className="mb-2 mb-md-0">Posts by Category</h5>
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
          Total: {totalPosts} | Approved: {totalApproved} (
          {totalPosts > 0 ? Math.round((totalApproved / totalPosts) * 100) : 0}
          %)
        </p>
      </div>

      <div className="d-flex justify-content-center">
        <div style={{ position: "relative", width: "100%", height: "300px" }}>
          {filteredPosts.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : hasPostsButNoneInRange ? (
            <div className="text-center h-100 d-flex flex-column justify-content-center">
              <p className="text-muted mb-2">
                <i className="bi bi-calendar-x fs-4"></i>
              </p>
              <p className="text-muted">
                No posts created in {getTimeRangeLabel()}.
              </p>
              <p className="text-muted small">
                You have {posts.length} post{posts.length !== 1 ? "s" : ""}{" "}
                total.
              </p>
            </div>
          ) : (
            <div className="text-center h-100 d-flex flex-column justify-content-center">
              <p className="text-muted mb-2">
                <i className="bi bi-file-earmark-text fs-4"></i>
              </p>
              <p className="text-muted">No posts available yet.</p>
              <p className="text-muted small">
                Create your first post to see analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PostsGrowth = ({ posts }) => {
  // Get current year
  const currentYear = new Date().getFullYear();

  // Create an array of months (Jan - Dec) with their short names
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(currentYear, i).toLocaleString("default", { month: "short" })
  );

  // Aggregate posts by month & year
  const growthData = posts.reduce((acc, post) => {
    const date = new Date(post.created_at);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const key = `${month} ${year}`; // Format: "Jan 2024"

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Generate full dataset with zero-filled months
  const labels = months.map((month) => `${month} ${currentYear}`);
  const dataValues = labels.map((label) => growthData[label] || 0);

  // Chart Data
  const chartData = {
    labels,
    datasets: [
      {
        label: "Posts Created",
        data: dataValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Posts Growth</h5>
      {posts.length > 0 ? (
        <div style={{ height: "250px" }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 },
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="text-muted">No post data available.</p>
      )}
    </div>
  );
};

export const PostStatusDistribution = ({ posts }) => {
  const statusData = posts.reduce((acc, post) => {
    const status = post.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Total transactions
  const total = posts.length;

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
      <h5 className="mb-3 text-center">Post Status Distribution</h5>
      <p className="text-muted text-center">
        Total Post: <strong>{total}</strong>
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

export const TopPostUsers = ({ posts }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const filteredPosts = filterPostsByTimeRange(posts, timeRange);
    const approvedPosts = filteredPosts.filter(
      (post) => post.status === "approved"
    );

    const userActivity = calculateTopUsers(approvedPosts);
    setTopUsers(userActivity);
  }, [timeRange, posts]);

  // Function to filter posts based on selected time range
  const filterPostsByTimeRange = (posts, range) => {
    const now = new Date();

    switch (range) {
      case "daily":
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        return posts.filter((post) => new Date(post.created_at) >= todayStart);

      case "weekly":
        const firstDayOfWeek = new Date(
          now.setDate(now.getDate() - now.getDay())
        ); // Start of the week (Sunday)
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return posts.filter(
          (post) => new Date(post.created_at) >= firstDayOfWeek
        );

      case "monthly":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        return posts.filter(
          (post) => new Date(post.created_at) >= firstDayOfMonth
        );

      case "all":
        return posts; // No filtering, includes all posts ever made

      default:
        return posts;
    }
  };

  // Function to calculate top users
  const calculateTopUsers = (approvedPosts) => {
    const userCounts = approvedPosts.reduce((acc, post) => {
      const userId = post.user_id; // Fix: Use user_id instead of renter_id
      const fullName = post.renter
        ? `${post.renter.first_name} ${post.renter.last_name}`
        : `User ${userId}`; // Fallback name

      if (!acc[userId]) acc[userId] = { count: 0, name: fullName };
      acc[userId].count++;

      return acc;
    }, {});

    // Sort by post count and return top 5
    return Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Users of Posts</h5>

      {/* Time Range Selector */}
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="form-select mb-3"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="all">All Time</option> {/* New All Time Option */}
      </select>

      {topUsers.length > 0 ? (
        <ol className="list-group list-group-numbered">
          {topUsers.map((user, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{user.name}</span>
              <span>{user.count} Approved Posts</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No approved posts available for the selected time range.</p>
      )}
    </div>
  );
};

export const PostStatusTrends = ({ posts }) => {
  const [timeRange, setTimeRange] = useState("monthly");

  // Function to group posts based on selected time range
  const aggregatePosts = (range) => {
    return posts.reduce((acc, post) => {
      const date = new Date(post.created_at);
      let period;

      if (range === "daily") {
        period = date.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else if (range === "weekly") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Get start of week (Sunday)
        period = startOfWeek.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else {
        period = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      }

      const status = post.status || "Other";

      if (!acc[period]) {
        acc[period] = { Approved: 0, Pending: 0, Flagged: 0, Other: 0 };
      }

      if (status === "approved") acc[period].Approved += 1;
      else if (status === "pending") acc[period].Pending += 1;
      else if (status === "flagged") acc[period].Flagged += 1;
      else acc[period].Other += 1;

      return acc;
    }, {});
  };

  const statusTrends = aggregatePosts(timeRange);
  const labels = Object.keys(statusTrends);
  const data = {
    labels,
    datasets: [
      {
        label: "Approved",
        data: labels.map((l) => statusTrends[l].Approved),
        borderColor: "#28a745",
        fill: false,
      },
      {
        label: "Pending",
        data: labels.map((l) => statusTrends[l].Pending),
        borderColor: "#ffc107",
        fill: false,
      },
      {
        label: "Flagged",
        data: labels.map((l) => statusTrends[l].Flagged),
        borderColor: "#dc3545",
        fill: false,
      },
      {
        label: "Other",
        data: labels.map((l) => statusTrends[l].Other),
        borderColor: "#17a2b8",
        fill: false,
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Post Status Trends Over Time</h5>

      {/* Time Range Selector */}
      <select
        className="form-select mb-3"
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <div style={{ height: "300px" }}>
        <Line
          data={data}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

export const PostCategoryTrends = ({ posts }) => {
  const [timeRange, setTimeRange] = useState("monthly");

  // Function to group posts based on selected time range
  const aggregatePosts = (range) => {
    return posts.reduce((acc, post) => {
      const date = new Date(post.created_at);
      let period;

      if (range === "daily") {
        period = date.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else if (range === "weekly") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Get start of week (Sunday)
        period = startOfWeek.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else {
        period = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      }

      const category = post.category || "Unknown";

      if (!acc[period]) {
        acc[period] = {};
      }
      acc[period][category] = (acc[period][category] || 0) + 1;

      return acc;
    }, {});
  };

  const categoryTrends = aggregatePosts(timeRange);

  // Extract unique categories
  const uniqueCategories = [
    ...new Set(posts.map((post) => post.category || "Unknown")),
  ];

  // Prepare chart data
  const labels = Object.keys(categoryTrends);
  const datasets = uniqueCategories.map((category, index) => ({
    label: category,
    data: labels.map((l) => categoryTrends[l][category] || 0),
    backgroundColor: `hsl(${index * 50}, 70%, 50%)`, // Generate different colors dynamically
  }));

  const data = { labels, datasets };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Post Category Popularity Over Time</h5>

      {/* Time Range Selector */}
      <select
        className="form-select mb-3"
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <div style={{ height: "300px" }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" } },
            scales: { x: { stacked: true }, y: { stacked: true } },
          }}
        />
      </div>
    </div>
  );
};

export const UserActivityHeatmap = ({ posts }) => {
  // Aggregate posts by day of the week and hour
  const heatmapData = Array(7)
    .fill(null)
    .map(() => Array(24).fill(0));

  posts.forEach((post) => {
    const date = new Date(post.created_at);
    const day = date.getDay(); // 0 (Sunday) - 6 (Saturday)
    const hour = date.getHours(); // 0-23
    heatmapData[day][hour]++;
  });

  // Labels for chart axes
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Prepare data for Bubble chart (each point represents a time slot)
  const data = {
    labels: hours,
    datasets: days.map((day, i) => ({
      label: day,
      data: heatmapData[i].map((count, hour) => ({
        x: hour,
        y: i, // Day index (0-6)
        r: Math.sqrt(count) * 3, // Bubble size based on activity
      })),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
    })),
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>User Activity Heatmap</h5>
      <div style={{ height: "350px" }}>
        <Bubble
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: "Hour of the Day" },
                ticks: { autoSkip: false },
              },
              y: {
                title: { display: true, text: "Day of the Week" },
                ticks: { callback: (v) => days[v] },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
