// Profile.js
import React, { useState, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useMatch,
} from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.js";
import ProfileSidebar from "../../../../components/User/sidebar/ProfileSidebar.jsx";
import EditProfile from "./EditProfile.jsx";
import ProfileHeader from "../../../../components/User/header/ProfileHeader.jsx";
import MyRentals from "./MyRentals.jsx";
import MyForSale from "./MyForSale.jsx";
import MyPosts from "./MyPosts.jsx";
import MyListings from "./MyListings.jsx";
import MyTransactions from "./MyTransactions.jsx";
import BreadCrumb from "../../../../components/breadcrumb/BreadCrumb.jsx";
import "./profileStyles.css";
import { useDispatch } from "react-redux";
import { clearNotification } from "../../../../redux/alert-popup/alertPopupSlice.js";
import socket from "../../../../hooks/socket.js";
import { fetchRentalTransactions } from "../../../../redux/transactions/rentalTransactionsSlice.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import MyFollowings from "./MyFollowings.js";
import Reviews from "./Reviews.jsx";
import MyTransactionReports from "./Reports.jsx";

const Profile = () => {
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};
  const location = useLocation();
  const navigate = useNavigate();

  // This will match URLs like "/profile/transactions/:option/:tab"
  const match = useMatch("/profile/transactions/:option/:tab");
  const currentOption = match ? match.params.option.toLowerCase() : "renter";
  const currentTab = match ? match.params.tab.toLowerCase() : "requests";

  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(currentOption);
  const [selectedTab, setSelectedTab] = useState(currentTab);

  const dispatch = useDispatch();

  // trigger update rental status
  useEffect(() => {
    if (!socket || !userId) return;
    // console.log("Registering user with socket:", userId); // Debugging
    socket.emit("registerUser", userId);
  }, [socket, userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveRentalUpdate", (data) => {
      // console.log("Received rental update:", data);
      dispatch(fetchRentalTransactions(userId));

      toast.info(`🔔 Rental Update: ${data.status}`, {
        position: "top-right",
        autoClose: 3000, // Closes after 3s
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });

    return () => {
      socket.off("receiveRentalUpdate");
    };
  }, [dispatch, userId, location]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveUpdate", (data) => {
      // console.log("Received rental update:", data);
      dispatch(fetchRentalTransactions(userId));

      toast.info(`🔔 Rental Update: ${data.status}`, {
        position: "top-right",
        autoClose: 3000, // Closes after 3s
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });

    return () => {
      socket.off("receiveUpdate");
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (location.state?.redirecting) {
      dispatch(clearNotification());
    }
  }, [location.state?.redirecting, dispatch]);

  useEffect(() => {
    if (userId) setLoading(false);
  }, [userId]);

  // Whenever the URL changes, update the state so that
  // ProfileHeader and MyRentals receive the correct values.
  useEffect(() => {
    setSelectedOption(currentOption);
    setSelectedTab(currentTab);
  }, [currentOption, currentTab]);

  // Handler for when the dropdown in ProfileHeader changes
  const handleOptionChange = (option) => {
    const newOption = option.toLowerCase();
    setSelectedOption(newOption);
    navigate(`/profile/transactions/${newOption}/${selectedTab}`);
  };

  // Handler for when MyRentals changes tabs (via RentalFilters)
  const handleTabChange = (newTab) => {
    const newTabLower = newTab.toLowerCase();
    setSelectedTab(newTabLower);
    navigate(`/profile/transactions/${selectedOption}/${newTabLower}`);
  };

  const getBreadcrumbs = () => {
    const pathToBreadcrumb = {
      "my-posts": "My Posts",
      "my-listings": "My Listings",
      "my-for-sale": "My For Sale Items",
      dashboard: "Dashboard",
      transactions: "Transactions",
      "edit-profile": "Edit Profile",
      followings: "Followings",
      reviews: "Reviews",
      reports: "Reports",
    };

    const currentPath = location.pathname;
    const breadcrumb = [
      { label: "Home", href: "/" },
      { label: "Profile", href: "/profile" },
    ];

    Object.keys(pathToBreadcrumb).forEach((key) => {
      if (currentPath.includes(key)) {
        breadcrumb.push({
          label: pathToBreadcrumb[key],
          href: `/profile/${key}`,
        });
      }
    });

    return breadcrumb;
  };

  if (loading) return <div>Loading user information...</div>;

  return (
    <div className="container-content profile-detail">
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
      <BreadCrumb breadcrumbs={getBreadcrumbs()} />
      <div className="profile-container">
        {userId && <ProfileSidebar />}
        <div className="profile-content">
          <ProfileHeader
            userId={userId}
            isProfileVisit={false}
            selectedOption={selectedOption}
            onOptionChange={handleOptionChange}
          />
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route
              path="transactions/:option/:tab"
              element={
                <MyRentals
                  selectedOption={selectedOption}
                  selectedTab={selectedTab}
                  onTabChange={handleTabChange}
                />
              }
            />
            <Route path="dashboard" element={<MyTransactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-for-sale" element={<MyForSale />} />
            <Route path="followings" element={<MyFollowings />} />
            <Route path="reviews" element={<Reviews />} />
            <Route
              path="transaction-reports"
              element={<MyTransactionReports />}
            />
            <Route path="/" element={<Navigate to="my-listings" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Profile;
