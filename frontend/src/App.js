import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import React, { useEffect } from "react";
import "./App.css";
import "./styles/buttons.css";
import "./styles/icons.css";
import "./styles/cards.css";
import "./styles/containers.css";
import "./styles/status.css";
import "./trials/Trial.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "../src/store/store";

import LoginSignUp from "./pages/public/login-signup/LoginSignup.js";
import Home from "./pages/public/Home.js";
import Profile from "./pages/private/users/student-profile/Profile.js";
import MessagePage from "./pages/private/users/message-inbox/MessagePage.js";
import RentProgress from "./components/myrentals/RentProgress.jsx";
import UserProfileVisit from "./components/User/BorrowerPOV/UserProfileVisit.jsx";
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
import ReportItemView from "./pages/private/admin/ReportManagement/ReportItemView.js";
import AdminTransactionDashboard from "./pages/private/admin/TransactionManagement/AdminTransactionDashboard.js";
import AdminTransactionOverview from "./pages/private/admin/TransactionManagement/AdminTransactionOverview.js";
import ViewTransaction from "./pages/private/admin/TransactionManagement/ViewTransaction.js";

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
import Trial from "./pages/public/login-signup/Trial.js";
import ChatAndNotif from "./trialOnMessage&Notification/ChatAndNotif.jsx";
import Trial2 from "./pages/public/login-signup/Trial2.js";
import FAB from "./components/common/fab/FAB.jsx";
import Cart from "./pages/private/users/cart/Cart.js";
import PostDetail from "./pages/public/post/PostDetail.js";
import ListingDetail from "./pages/public/listing/listing-detail/ListingDetail.js";
import ItemForSaleDetail from "./pages/public/item-for-sale/ItemForSaleDetail.js";
import Shop from "./pages/public/Shop.js";
import AddNewLItem from "./pages/private/users/item/AddNewItem.js";
import AddNewPost from "./pages/private/users/post/AddNewPost.js";
import EditItem from "./pages/private/users/item/EditItem.js";
import VerifyEmail from "./components/emails/VerfiyEmail.jsx";
import { fetchUser } from "./redux/user/userSlice.js";
import TopBar from "./components/topbar/TopBar.jsx";
import { selectStudentUser } from "./redux/auth/studentAuthSlice.js";

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

  return (
    <>
      <Routes>
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route element={<PublicLayout />}>
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
          <Route path="/shop" element={<Shop />} />

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
            path="/profile/my-posts/new"
            element={
              <StudentProtectedRoute allowedRoles="student">
                <AddNewPost />
              </StudentProtectedRoute>
            }
          />
          <Route
            path="/post/edit/:id"
            element={
              <StudentProtectedRoute allowedRoles="student">
                <EditItem />
              </StudentProtectedRoute>
            }
          />

          <Route
            path="/profile/my-listings/add"
            element={
              <StudentProtectedRoute allowedRoles="student">
                <AddNewLItem />
              </StudentProtectedRoute>
            }
          />

          <Route
            path="/profile/my-listings/edit/:id"
            element={
              <StudentProtectedRoute allowedRoles="student">
                <EditItem />
              </StudentProtectedRoute>
            }
          />

          <Route
            path="/profile/my-for-sale/edit/:id"
            element={
              <StudentProtectedRoute allowedRoles="student">
                <EditItem />
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
        </Route>

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
            <Route path="my-for-sale" element={<MyForSale />} />
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
          <Route path="reports" element={<ReportDashboard />} />
          <Route path="reports/report-overview" element={<ReportOverview />} />
          <Route path="reports/:entity_type/:reported_entity_id" element={<ReportItemView />} />

          {/* TRANSACTION MANAGEMENT */}
          <Route path="transactions" element={<AdminTransactionDashboard />} />
          <Route
            path="transactions/overview"
            element={<AdminTransactionOverview />}
          />
          <Route path="transactions/view/:id" element={<ViewTransaction />} />

          {/* ADMIN MANAGEMENT */}
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
      </Routes>
    </>
  );
}

// Public Layout with NavBar and Footer
function PublicLayout() {
  const dispatch = useDispatch();
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const studentUser = useSelector(selectStudentUser);

  useEffect(() => {
    if (studentUser?.userId) {
      dispatch(fetchUser(studentUser.userId));
    }
  }, [dispatch, studentUser?.userId]);

  const isVerified = user?.user?.emailVerified ?? false; // Default to false if undefined

  // if (loadingFetchUser) {
  //   return <div>Loading...</div>; // Show a loading indicator while fetching user data
  // }

  return (
    <>
      {studentUser?.userId && <TopBar isVerified={isVerified} user={user?.user} />}
      <NavBar2 />
      <FAB icon="+" />
      <Outlet />
      <Footer />
    </>
  );
}


// Admin Layout without NavBar and Footer
function AdminLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

const baseApiUrl = `localhost`;
const baseApiPort = 3001;

export const baseApi = `http://${baseApiUrl}:${baseApiPort}`;
console.log(baseApi);

export default App;
