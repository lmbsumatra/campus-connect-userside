import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import React from "react";
import "./App.css";
import "./styles/buttons.css";
import "./styles/icons.css";
import "./styles/cards.css";
import "./styles/containers.css";
import "./styles/status.css";
import "./trials/Trial.css";
import { Provider } from "react-redux";
import store from "../src/store/store";

import LoginSignUp from "./pages/public/login-signup/LoginSignup.js";
import Home from "./pages/public/Home.js";
import Profile from "./pages/private/users/student-profile/Profile.js";
import AddPost from "./pages/private/users/new-post/AddPost.js";
import MessagePage from "./pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/RentProgress.jsx";
import UserProfileVisit from "./components/User/BorrowerPOV/UserProfileVisit.jsx";
import AddListing from "./pages/private/users/new-item/AddListing.js";
import NavBar2 from "./components/navbar/navbar/NavBar2.jsx";
import Footer from "./components/users/footer/Footer.jsx";
import Admin from "./pages/private/admin/Admin.js";
import AdminDashboard from "./pages/private/admin/dashboard/admindashboard/AdminDashboard.js";
import Rent from "./pages/public/Rent.js";
import Lend from "./pages/public/Lend.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminSettings from "./pages/private/admin/settings/AdminSettings.js";
import AdminLogin from "./pages/private/admin/login/AdminLogin.js";

// Post Management Dashboard - ADMIN
import PostDashboard from "./pages/private/admin/PostManagement/PostDashboard.js";
import PostOverview from "./pages/private/admin/PostManagement/PostOverview.js";
import PostApproval from "./pages/private/admin/PostManagement/PostApproval.js";

import ForSaleManagement from "./pages/private/admin/SaleManagement/ForSaleManagement.js";
import SaleOverview from "./pages/private/admin/SaleManagement/SaleOverview.js";
import ItemForSaleApproval from "./pages/private/admin/SaleManagement/ItemSaleApproval.js";
import ListingDashboard from "./pages/private/admin/listing-management/ListingDashboard.js";
import ListingOverview from "./pages/private/admin/listing-management/ListingOverview.js";
import ListingApproval from "./pages/private/admin/listing-management/ListingApproval.js";
import UserDashboard from "./pages/private/admin/user-management/UserDashboard.js";
import UserOverview from "./pages/private/admin/user-management/UserOverview.js";
import UserVerification from "./pages/private/admin/user-management/student-profile/UserVerification.js";
import ReportDashboard from "./pages/private/admin/ReportManagement/ReportDashboard.js";
import ReportOverview from "./pages/private/admin/ReportManagement/ReportOverview.js";

import ProtectedRoute from "./components/Protected Route/ProtectedRoute.js";
import { AuthProvider } from "./context/AuthContext.js";
import StudentProtectedRoute from "./components/Protected Route/StudentProtectedRoute.js";
import EditProfile from "./pages/private/users/student-profile/EditProfile.jsx";
import MyForSale from "./pages/private/users/student-profile/MyForSale.jsx";
import MyPosts from "./pages/private/users/student-profile/MyPosts.jsx";
import MyListings from "./pages/private/users/student-profile/MyListings.jsx";
import MyTransactions from "./pages/private/users/student-profile/MyTransactions.jsx";
import MyRentals from "./components/myrentals/MyRentals.jsx";
import { SocketProvider } from "./context/SocketContext.js";
import Trial from "./trials/Trial.js";
import ChatAndNotif from "./trialOnMessage&Notification/ChatAndNotif.jsx";
import Trial2 from "./trials/Trial2.js";
import FAB from "./components/common/fab/FAB.jsx";
import Cart from "./pages/private/users/cart/Cart.js";
import PostDetail from "./pages/private/users/post/PostDetail.js";
import ListingDetail from "./pages/private/users/listing/listing-detail/ListingDetail.js";
import ItemForSaleDetail from "./pages/private/users/item-for-sale/ItemForSaleDetail.js";
import Shop from "./pages/public/Shop.js";
import AddNewLItem from "./pages/private/users/new-item/AddNewItem.js";
import AddNewPost from "./pages/private/users/new-post/AddNewPost.js";

function App() {
  console.log(baseApi);
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <GoogleOAuthProvider clientId="474440031362-3ja3qh8j5bpn0bfs1t7216u8unf0ogat.apps.googleusercontent.com">
              <Content baseApi={baseApi} />
            </GoogleOAuthProvider>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  );
}

function Content() {
  const location = useLocation();
  const showNavbarAndFooter = !location.pathname.startsWith("/admin");

  // Handle click on FAB (Floating Action Button) for different actions
  const handleFabClick = (action) => {
    if (action === "add-item") {
      console.log("Add Item button clicked");
    } else if (action === "create-post") {
      console.log("Create Post button clicked");
    }
  };

  const cartItems = {
    "Seller X": [
      {
        name: "Plant APlant APlant APlant APlant APlant APlant APlant APlant APlant APlant APlant A",
        type: "To buy",
        specs: ["Gray", "Brand x"],
        price: 100,
        owner: "Seller X",
        availability: "In Stock",
      },
      {
        name: "Plant B",
        type: "To buy",
        specs: ["Green", "Brand z"],
        price: 120,
        owner: "Seller X",
        availability: "In Stock",
      },
    ],
    "Seller Y": [
      {
        name: "Tool B",
        type: "To rent",
        specs: ["Blue", "Brand y"],
        price: 15,
        rentalAvailability: "Available from 1st Jan",
        owner: "Seller Y",
        availability: "Available",
      },
      {
        name: "Shovel",
        type: "To rent",
        specs: ["Metal", "Brand z"],
        price: 10,
        rentalAvailability: "Available from 15th Jan",
        owner: "Seller Y",
        availability: "Available",
      },
    ],
    "Seller Z": [
      {
        name: "Cactus",
        type: "To buy",
        specs: ["Small", "Brand x"],
        price: 50,
        owner: "Seller Z",
        availability: "In Stock",
      },
      {
        name: "Rake",
        type: "To rent",
        specs: ["Wooden", "Brand w"],
        price: 12,
        rentalAvailability: "Available from 20th Jan",
        owner: "Seller Z",
        availability: "Available",
      },
    ],
  };

  return (
    <>
      {showNavbarAndFooter && <NavBar2 className="bg-dark" />}
      {/* Floating Action Button (FAB) */}
      <FAB icon="+" onClick={handleFabClick} />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/trial2" element={<Trial2 />} />
        <Route path="/trial" element={<Trial />} />
        <Route path="/trialChatAndNotif" element={<ChatAndNotif />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login-signup" element={<LoginSignUp />} />
        <Route path="/*" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="/lend" element={<Lend />} />
        <Route path="/lend" element={<Shop />} />
       

        {/* PRIVATE ROUTES */}

        {/* PRIVATE STUDENT ROUTES */}
        <Route
          path="/post/:id"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <PostDetail />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/rent/:id"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <ListingDetail />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/shop/:id"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <ItemForSaleDetail />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/new-post"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <AddPost />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/new-post2"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <AddNewPost />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/add-listing"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <AddListing />
            </StudentProtectedRoute>
          }
        />
       
        <Route
          path="/add-listing2"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <AddNewLItem />
            </StudentProtectedRoute>
          }
        />
       
        <Route
          path="/messages"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <MessagePage />
            </StudentProtectedRoute>
          }
        />

        {/* USER PROFILE */}
        <Route
          path="/profile/*"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <Profile />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/rent-progress/:id"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <RentProgress />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <StudentProtectedRoute allowedRoles="student">
              <UserProfileVisit />
            </StudentProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* USER MANAGEMENT */}
          <Route path="users" element={<UserDashboard />} />
          <Route path="users/user-overview" element={<UserOverview />} />
          <Route
            path="users/user-verification/:id"
            element={<UserVerification />}
          >
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="transactions" element={<MyTransactions />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-forsale-items" element={<MyForSale />} />
            <Route index path="*" element={<MyListings />} />
          </Route>

          {/* LISTINGS */}
          <Route path="listings" element={<ListingDashboard />} />
          <Route
            path="listings/listing-overview"
            element={<ListingOverview />}
          />
          <Route
            path="listings/listing-approval/:id"
            element={<ListingApproval />}
          />

          {/* POSTS */}
          <Route path="posts" element={<PostDashboard />} />
          <Route path="posts/post-overview" element={<PostOverview />} />
          <Route path="posts/post-approval/:id" element={<PostApproval />} />

          {/* ITEM FOR SALE */}
          <Route path="sales" element={<ForSaleManagement />} />
          <Route path="sales/sales-overview" element={<SaleOverview />} />
          <Route
            path="sales/item-approval/:id"
            element={<ItemForSaleApproval />}
          />

          {/* REPORT MANAGEMENT */}
          <Route path="reports" element={<ReportDashboard />}/>
          <Route path="reports/report-overview" element={<ReportOverview />} />
         

          {/* ADMIN MANAGEMENT */}
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
      </Routes>
      {showNavbarAndFooter && <Footer />}
    </>
  );
}

const baseApiUrl = `localhost`;
const baseApiPort = 3001;

export const baseApi = `http://${baseApiUrl}:${baseApiPort}`;
console.log(baseApi);

export default App;
