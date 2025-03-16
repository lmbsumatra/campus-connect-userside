import { useMemo } from "react";

const useAdminDashboardAnalytics = ({ users, listings, posts, sales }) => {
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

  return { getGrowthData };
};

export default useAdminDashboardAnalytics;
