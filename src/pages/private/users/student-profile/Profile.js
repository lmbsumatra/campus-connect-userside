import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.js";
import ProfileSidebar from "../../../../components/User/sidebar/ProfileSidebar.jsx";
import EditProfile from "./EditProfile.jsx";
import ProfileHeader from "../../../../components/User/header/ProfileHeader.jsx";
import MyRentals from "../../../../components/myrentals/MyRentals.jsx";
import MyForSale from "./MyForSale.jsx";
import MyPosts from "./MyPosts.jsx";
import MyListings from "./MyListings.jsx";
import MyTransactions from "./MyTransactions.jsx";

function Profile() {
  const { studentUser } = useAuth();
  const { userId } = studentUser || {}; // Get userId from auth context
  const location = useLocation();
  const navigate = useNavigate(); // To navigate programmatically

  // Create a URLSearchParams instance to extract query parameters from the location's search string
  const queryParams = new URLSearchParams(location.search);

  // Get the values of the query parameters
  const currentPage = queryParams.get("currentPage");
  const currentTab = queryParams.get("currentTab");

  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("Renter"); // Default value "Renter"
  const [selectedTab, setSelectedTab] = useState("Requests"); // Default value "Requests"

  useEffect(() => {
    if (userId) {
      setLoading(false); // Once userId is available, stop loading
    }
  }, [userId]); // Only re-run when userId changes

  useEffect(() => {
    // Check URL parameters on initial load or refresh
    if (currentPage) {
      setSelectedOption(currentPage);
    }
    if (currentTab) {
      setSelectedTab(currentTab);
    }
  }, [currentPage, currentTab]); // Re-run when currentPage or currentTab changes in query params

  // Don't return early with loading state. Let the hooks always be called in the same order.
  if (loading) {
    return <div>Loading user information...</div>; // Show loading state if still fetching userId
  }

  // Function to handle option change (update the query parameters and state)
  const handleOptionChange = (option) => {
    // Update the URL with new query parameters
    navigate(`/profile/transactions?currentPage=${option}&currentTab=${currentTab}`);

    // Update the selectedOption state
    setSelectedOption(option);
  };

  // Function to handle tab change (update the query parameters and state)
  const handleTabChange = (newSelectedTab) => {
    // Update the URL with new query parameters
    navigate(`/profile/transactions?currentPage=${selectedOption}&currentTab=${newSelectedTab}`);
    
    // Update the selectedTab state
    setSelectedTab(newSelectedTab);
  };

  console.log(`/profile/transactions?currentPage=${currentPage}&currentTab=${currentTab}`);

  return (
    <div className="container-content d-flex gap-3">
      {userId && (
        <ProfileSidebar className="profile-sidebar m-0 p-0 lh-0 bg-dark h-100 " />
      )}

      <div className="profile-content m-0 p-0 lh-0 w-50">
        <ProfileHeader
          userId={userId}
          isProfileVisit={false}
          selectedOption={selectedOption} // Pass selectedOption to ProfileHeader
          onOptionChange={handleOptionChange} // Pass handleOptionChange to ProfileHeader
          className="m-0 p-0"
        />
        <div className="m-0 p-0">
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route
              path="transactions"
              element={<MyRentals selectedOption={selectedOption} selectedTab={selectedTab} onTabChange={handleTabChange} />} // Pass onTabChange to MyRentals
            />
            <Route path="my-rentals" element={<MyTransactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-forsale-items" element={<MyForSale />} />
            <Route path="/" element={<Navigate to="my-listings" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Profile;
