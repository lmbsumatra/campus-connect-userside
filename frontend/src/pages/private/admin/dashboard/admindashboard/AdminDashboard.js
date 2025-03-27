import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/swiper-bundle.css";
import "../adminDashboardStyles.css";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  FilePlus,
  ShoppingCart,
  FileText,
  Handshake,
  Flag,
} from "lucide-react";

import useFetchAllUsersData from "../../../../../utils/FetchAllUsersData";
import useFetchAllListingsData from "../../../../../utils/FetchAllListingsData";
import useFetchAllPostsData from "../../../../../utils/FetchAllPostsData";
import useFetchAllReportsData from "../../../../../utils/FetchAllReportsData";
import useFetchAllRentalTransactionsData from "../../../../../utils/FetchAllRentalTransactionsData";
import useFetchAllItemsForSaleData from "../../../../../utils/FetchAllItemsForSaleData";
import useFetchRecentActivities from "../../../../../utils/FetchRecentActivities";

import {
  GrowthData,
  TotalRegisteredUser,
  CompletedTransactionsAndPopularCategories,
  TopTransactionUsers,
} from "../../../../../components/Analytics/AdminDashboardAnalytics";

const AdminDashboard = () => {
  const { activities } = useFetchRecentActivities();
  // Fetching data using the custom hooks
  const { users } = useFetchAllUsersData();
  const { listings } = useFetchAllListingsData();
  const { posts } = useFetchAllPostsData();
  const { reports } = useFetchAllReportsData();
  const { transactions } = useFetchAllRentalTransactionsData();
  const sale = useFetchAllItemsForSaleData();
  const navigate = useNavigate();

  // State to store fetched values for status cards
  const [statusData, setStatusData] = useState({
    activeUsers: 0,
    activeListings: 0,
    upPosts: 0,
    averageTransactions: 0,
    reports: 0,
    sales: 0,
  });

  useEffect(() => {
    setStatusData((prevState) => ({
      ...prevState,
      activeUsers: users?.length || prevState.activeUsers,
      activeListings: listings?.length || prevState.activeListings,
      upPosts: posts?.length || prevState.upPosts,
      averageTransactions:
        transactions?.length || prevState.averageTransactions,
      reports: reports?.length || prevState.reports,
      sales: sale?.items?.length || prevState.sales,
    }));
  }, [
    users?.length,
    listings?.length,
    posts?.length,
    transactions?.length,
    reports?.length,
    sale?.items?.length,
  ]);

  const statusCards = [
    {
      title: "Active Users",
      value: `${statusData.activeUsers}`,
      icon: <Users size={30} color="#3498db" />,
      color: "#3498db",
    },
    {
      title: "Active Listings",
      value: `${statusData.activeListings}`,
      icon: <FilePlus size={30} color="#f39c12" />,
      color: "#f39c12",
    },
    {
      title: "Up Posts",
      value: `${statusData.upPosts}`,
      icon: <FileText size={30} color="#e74c3c" />,
      color: "#e74c3c",
    },
    {
      title: "Transactions",
      value: `${statusData.averageTransactions}`,
      icon: <Handshake size={30} color="#27ae60" />,
      color: "#27ae60",
    },
    {
      title: "Reports",
      value: `${statusData.reports}`,
      icon: <Flag size={30} color="#c0392b" />,
      color: "#c0392b",
    },
    {
      title: "Sales",
      value: `${statusData.sales}`,
      icon: <ShoppingCart size={30} color="#8e44ad" />,
      color: "#8e44ad",
    },
  ];

  // Function to handle navigation based on activity type
  const handleViewActivity = (activity) => {
    let route = "";

    switch (activity.type) {
      case "New User":
        route = `/admin/users`;
        break;
      case "New Listing":
        route = `/admin/listings`;
        break;
      case "New Post":
        route = `/admin/posts`;
        break;
      case "New Transaction":
        route = `/admin/transaction`;
        break;
      case "New Report":
        route = `/admin/reports`;
        break;
      case "New Sale":
        route = `/admin/sales`;
        break;
      default:
        return;
    }

    navigate(route);
  };

  return (
    <div className="dashboard">
      <div className="status-section">
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 2 },
            480: { slidesPerView: 2 }, // Mobile: Show 1 per row
            768: { slidesPerView: 3 }, // Tablets: Show 3 per row
            1024: { slidesPerView: 6 }, // Desktop: Show 6 per row
          }}
        >
          {statusCards.map((card, index) => (
            <SwiperSlide key={index}>
              <div className="status-card">
                <div className="status-content">
                  {card.icon} {/* Directly render the React component */}
                  <div>
                    <h6>{card.title}</h6>
                    <span
                      className="status-value"
                      style={{ color: card.color }}
                    >
                      {card.value}
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="recent-activities-section">
        <h3 className="section-title">Recent Activities</h3>
        <div className="activities-table-container">
          <table className="activities-table">
            <thead>
              <tr>
                <th>ACTIVITY</th>
                <th>DESCRIPTION</th>
                <th>DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={index}>
                  <td>
                    {activity.type === "New User" && (
                      <User size={20} color="#3498db" />
                    )}
                    {activity.type === "New Listing" && (
                      <FilePlus size={20} color="#f39c12" />
                    )}
                    {(activity.type === "New Rental Transaction" ||
                      activity.type === "New Sale Transaction") && (
                      <Handshake size={20} color="#27ae60" />
                    )}

                    {activity.type === "New Post" && (
                      <FileText size={20} color="#e74c3c" />
                    )}
                    {activity.type === "New Sale" && (
                      <ShoppingCart size={20} color="#8e44ad" />
                    )}
                    {activity.type === "New Report" && (
                      <Flag size={20} color="#c0392b" />
                    )}
                    {activity.type}
                  </td>
                  <td>{activity.description}</td>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewActivity(activity)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <GrowthData
            users={users}
            listings={listings}
            posts={posts}
            sales={sale.items}
          />
        </div>
        <div className="chart-card">
          <TotalRegisteredUser users={users} />
        </div>
        <div className="chart-card">
          <CompletedTransactionsAndPopularCategories
            transactions={transactions}
            listings={listings}
          />
        </div>
        <div className="chart-card">
          <TopTransactionUsers transactions={transactions} users={users} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
