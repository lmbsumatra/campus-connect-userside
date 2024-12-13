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

// 1. Posts by Category
export const PostsByCategory = ({ posts }) => {
  const categoryData = posts.reduce((acc, post) => {
    const category = post.category || "Unknown";
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
      <h5>Posts by Category</h5>
      <div style={{ height: "300px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

// 2. Posts Growth
export const PostsGrowth = ({ posts }) => {
  const growthData = posts.reduce((acc, post) => {
    const month = new Date(post.created_at).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: "Posts Created",
        data: Object.values(growthData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Posts Growth</h5>
      <div style={{ height: "200px" }}>
        <Bar
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

// 3. Post Status Distribution
export const PostStatusDistribution = ({ posts }) => {
  const statusData = posts.reduce((acc, post) => {
    const status = post.status || "Unknown";
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
        ],
      },
    ],
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Post Status Distribution</h5>
      <div style={{ height: "300px" }}>
        <Doughnut data={chartData} />
      </div>
    </div>
  );
};
//TOP USER FOR POSTS
export const TopPostUsers = ({ posts }) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    //console.log("Posts Data:", posts);
    const filteredPosts = filterPostsByTimeRange(posts, timeRange);
    const approvedPosts = filteredPosts.filter(
      (posts) => posts.status === "approved"
    );
    const userActivity = calculateTopUsers(approvedPosts);
    setTopUsers(userActivity); // No need to slice here; calculateTopUsers already limits to top 5
  }, [timeRange, posts]);

  // Filter posts by time range
  const filterPostsByTimeRange = (posts, range) => {
    const now = new Date();

    switch (range) {
      case "daily":
        now.setHours(7, 0, 0, 0);
        const todayStart = new Date(now);
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        return posts.filter((posts) => {
          const createdAt = new Date(posts.created_at);
          return createdAt >= todayStart && createdAt <= todayEnd;
        });

      case "weekly":
        const dayOfWeek = now.getDay();
        const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        const sundayStart = new Date(now.setDate(now.getDate() - diffToSunday));
        sundayStart.setHours(0, 0, 0, 0);
        return posts.filter((posts) => {
          const createdAt = new Date(posts.created_at);
          return createdAt >= sundayStart;
        });

      case "monthly":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        return posts.filter((posts) => {
          const createdAt = new Date(posts.created_at);
          return createdAt >= firstDayOfMonth;
        });

      default:
        return posts;
    }
  };

  // Calculate the top users
  const calculateTopUsers = (approvedposts) => {
    const userCounts = {};

    approvedposts.forEach((posts) => {
      if (posts.renter_id && posts.renter) {
        const userId = posts.renter_id;

        // Combine first_name and last_name to create the full name
        const fullName = `${posts.renter.first_name} ${posts.renter.last_name}`;

        if (!userCounts[userId]) {
          userCounts[userId] = { count: 0, name: fullName };
        }

        userCounts[userId].count++;
      } else {
        console.log("Missing owner_id or owner data for listing:", posts);
      }
    });

    // Sort the user counts and return the top 5
    return Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm mb-2">
      <h5>Top Users of Posts</h5>
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
