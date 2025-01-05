import { useMemo } from "react";

const useAdminDashboardAnalytics = ({ users, listings, transactions }) => {
  const userGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];

    // Example logic to calculate growth data dynamically
    const groupedByMonth = users.reduce((acc, user) => {
      const month = new Date(user.createdAt).toLocaleString("default", { month: "short" });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groupedByMonth).map(([month, count]) => ({ month, users: count }));
  }, [users]);

  const listingActivityData = useMemo(() => {
    if (!listings || listings.length === 0) return [];

    // Example logic to calculate daily activity
    const groupedByDay = listings.reduce((acc, listing) => {
      const day = new Date(listing.createdAt).getDate();
      acc[day] = acc[day] || { added: 0, approved: 0, rejected: 0 };
      acc[day].added += 1;
      acc[day].approved += listing.status === "approved" ? 1 : 0;
      acc[day].rejected += listing.status === "rejected" ? 1 : 0;
      return acc;
    }, {});

    return Object.entries(groupedByDay).map(([day, values]) => ({ day, ...values }));
  }, [listings]);

  const transactionAnalytics = useMemo(() => {
    if (!transactions || transactions.length === 0) return { total: 0, ongoing: 0, cancelled: 0 };

    const total = transactions.length;
    const ongoing = transactions.filter((t) => t.status === "ongoing").length;
    const cancelled = transactions.filter((t) => t.status === "cancelled").length;

    return { total, ongoing, cancelled, ongoingPercent: (ongoing / total) * 100, cancelledPercent: (cancelled / total) * 100 };
  }, [transactions]);

  return { userGrowthData, listingActivityData, transactionAnalytics };
};

export default useAdminDashboardAnalytics;
