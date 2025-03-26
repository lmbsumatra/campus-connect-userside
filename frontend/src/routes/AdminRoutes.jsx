import React from "react";
import { Route, Navigate } from "react-router-dom";
import Admin from "../pages/private/admin/Admin";
import AdminDashboard from "../pages/private/admin/dashboard/admindashboard/AdminDashboard";
import AdminLogin from "../pages/private/admin/login/AdminLogin";
import UserDashboard from "../pages/private/admin/user-management/UserDashboard";
import UserOverview from "../pages/private/admin/user-management/UserOverview";
import UserVerification from "../pages/private/admin/user-management/student-profile/UserVerification";
import EditProfile from "../pages/private/users/student-profile/EditProfile";
import MyRentals from "../pages/private/users/student-profile/MyRentals";
import MyTransactions from "../pages/private/users/student-profile/MyTransactions";
import MyListings from "../pages/private/users/student-profile/MyListings";
import MyPosts from "../pages/private/users/student-profile/MyPosts";
import MyForSale from "../pages/private/users/student-profile/MyForSale";
import ListingDashboard from "../pages/private/admin/listing-management/ListingDashboard";
import ListingOverview from "../pages/private/admin/listing-management/ListingOverview";
import ListingApproval from "../pages/private/admin/listing-management/ListingApproval";
import ItemForSaleApproval from "../pages/private/admin/SaleManagement/ItemSaleApproval";
import ProtectedRoute from "../components/Protected Route/ProtectedRoute";
import AdminSettings from "../pages/private/admin/settings/AdminSettings";
import ViewTransaction from "../pages/private/admin/TransactionManagement/ViewTransaction";
import AdminTransactionDashboard from "../pages/private/admin/TransactionManagement/AdminTransactionDashboard";
import AdminTransactionOverview from "../pages/private/admin/TransactionManagement/AdminTransactionOverview";
import ReportDashboard from "../pages/private/admin/ReportManagement/ReportDashboard";
import ReportItemView from "../pages/private/admin/ReportManagement/ReportItemView";
import ReportOverview from "../pages/private/admin/ReportManagement/ReportOverview";
import SaleOverview from "../pages/private/admin/SaleManagement/SaleOverview";
import ForSaleManagement from "../pages/private/admin/SaleManagement/ForSaleManagement";
import PostOverview from "../pages/private/admin/PostManagement/PostOverview";
import PostApproval from "../pages/private/admin/PostManagement/PostApproval";
import PostDashboard from "../pages/private/admin/PostManagement/PostDashboard";
import LogsDashboard from "../pages/private/admin/auditlogs/LogsDashboard";
import MonthlyReportGenerator from "../pages/private/admin/settings/report-generation/ReportGeneration";

const AdminRoutes = [
  <Route path="/admin-login" element={<AdminLogin />} />,
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
    <Route path="users/user-verification/:id" element={<UserVerification />}>
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
    <Route path="listings/listing-overview" element={<ListingOverview />} />
    <Route path="listings/listing-approval/:id" element={<ListingApproval />} />

    {/* POSTS */}
    <Route path="posts" element={<PostDashboard />} />
    <Route path="posts/post-overview" element={<PostOverview />} />
    <Route path="posts/post-approval/:id" element={<PostApproval />} />

    {/* ITEM FOR SALE */}
    <Route path="sales" element={<ForSaleManagement />} />
    <Route path="sales/sales-overview" element={<SaleOverview />} />
    <Route path="sales/item-approval/:id" element={<ItemForSaleApproval />} />

    {/* REPORT MANAGEMENT */}
    <Route path="reports" element={<ReportDashboard />} />
    <Route path="reports/report-overview" element={<ReportOverview />} />
    <Route
      path="reports/:entity_type/:reported_entity_id"
      element={<ReportItemView />}
    />

    {/* TRANSACTION MANAGEMENT */}
    <Route path="transactions" element={<AdminTransactionDashboard />} />
    <Route
      path="transactions/overview"
      element={<AdminTransactionOverview />}
    />
    <Route path="transactions/view/:id" element={<ViewTransaction />} />

    {/* ADMIN MANAGEMENT */}
    <Route path="logs" element={<LogsDashboard />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="*" element={<Navigate to="/admin/dashboard" />} />

    <Route path="generate-report" element={<MonthlyReportGenerator />} />
  </Route>,
];

export default AdminRoutes;
