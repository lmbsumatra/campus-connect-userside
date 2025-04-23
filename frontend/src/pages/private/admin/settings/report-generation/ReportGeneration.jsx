import React, { useState } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import axios from "axios";
import {
  InputGroup,
  FormSelect,
  FormControl,
  Button,
  Container,
  Card,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { baseApi } from "../../../../../utils/consonants";

// Enhanced styles with a more professional color scheme and improved layout
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFBFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: "2 solid #3498DB",
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  companyTagline: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 5,
  },
  reportTitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    padding: 10,
    backgroundColor: "#ECF0F1",
    borderRadius: 4,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    border: "1 solid #E0E0E0",
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "bold",
    color: "#34495E",
    borderBottom: "1 solid #E0E0E0",
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
    borderBottom: "0.5 solid #F5F5F5",
  },
  label: {
    fontSize: 11,
    color: "#34495E",
  },
  value: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#3498DB",
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#34495E",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1 solid #E0E0E0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  analysisSection: {
    marginTop: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 1.7,
    textAlign: "justify",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#7F8C8D",
  },
  watermark: {
    position: "absolute",
    opacity: 0.1,
    transform: "rotate(-45deg)",
    fontSize: 100,
    color: "#3498DB",
    top: "50%",
    left: "15%",
  },
});

// PDF Component with Comprehensive Reporting
const MonthlyReportPDF = ({ data, month, year }) => {
  // Format the month and year
  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });
  const reportTitle = `Monthly Platform Report - ${monthName} ${year}`;

  // Helper function for growth analysis text
  const getGrowthAnalysis = (current, past) => {
    const growthPercent = past
      ? Math.round(((current - past) / past) * 100)
      : 0;

    if (growthPercent > 0) {
      return `a positive growth of ${growthPercent}%`;
    } else if (growthPercent < 0) {
      return `a decrease of ${Math.abs(growthPercent)}%`;
    }
    return "no significant change (0%)";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>RenTUPeers</Text>
            <Text style={styles.companyTagline}>
              Platform Analytics Dashboard
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: "#7F8C8D" }}>
            Generated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Report Title */}
        <Text style={styles.reportTitle}>{reportTitle}</Text>

        {/* Report Context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Overview</Text>
          <Text style={styles.paragraph}>
            This comprehensive analysis provides insights into platform activity
            for {monthName} {year}. The report covers key metrics including user
            engagement, growth trends, and transaction patterns to help
            stakeholders make informed decisions about platform development and
            marketing strategies. All metrics are compared with previous periods
            to highlight growth trajectories and areas needing attention.
          </Text>
        </View>

        {/* Users Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Metrics Dashboard</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Users (Past Month):</Text>
            <Text style={styles.value}>
              {data.usersStats.pastMonth?.total_users || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Users (Current Month):</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth?.total_users || 0}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            {monthName} {year} Detailed User Breakdown
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Admin Users:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth?.total_admins || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Student Users:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth?.total_students || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Superadmin Users:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth?.total_superadmins || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Verified User Accounts:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth?.verified_users || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Stripe Integrated Users:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth?.stripe_completed_users || 0}
            </Text>
          </View>

          {/* Enhanced Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Growth Analysis</Text>
            <Text style={styles.analysisText}>
              Month-over-month comparison shows{" "}
              {getGrowthAnalysis(
                data.usersStats.currentMonth?.total_users || 0,
                data.usersStats.pastMonth?.total_users || 0
              )}{" "}
              in user registrations. The platform currently has a verification
              rate of{" "}
              {data.usersStats.currentMonth?.total_users
                ? Math.round(
                    ((data.usersStats.currentMonth?.verified_users || 0) /
                      data.usersStats.currentMonth.total_users) *
                      100
                  )
                : 0}
              %, and a payment integration rate of{" "}
              {data.usersStats.currentMonth?.total_users
                ? Math.round(
                    ((data.usersStats.currentMonth?.stripe_completed_users ||
                      0) /
                      data.usersStats.currentMonth.total_users) *
                      100
                  )
                : 0}
              %. Strategic recommendations include: enhancing the verification
              flow, implementing targeted user activation campaigns, and
              streamlining the payment integration process to improve conversion
              metrics.
            </Text>
          </View>
        </View>

        {/* 2. Audit Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Metrics Dashboard</Text>

          {/* Total Actions */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Actions (Current Month):</Text>
            <Text style={styles.value}>
              {data.auditStats?.totalActions || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Actions (Past Month):</Text>
            <Text style={styles.value}>
              {data.auditStats?.actionsLastMonth?.length > 0
                ? data.auditStats.actionsLastMonth.reduce(
                    (sum, action) => sum + (action.count || 0),
                    0
                  )
                : 0}
            </Text>
          </View>

          {/* Actions by Type Title */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            {monthName} {year} Action Type Breakdown
          </Text>

          {/* Actions by Type Rows */}
          {data.auditStats?.actionsByType?.map((action, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{action.action || "Unknown"}:</Text>
              <Text style={styles.value}>{action.count || 0}</Text>
            </View>
          )) || (
            <View style={styles.row}>
              <Text style={styles.label}>No action data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Activity Analysis</Text>
            <Text style={styles.analysisText}>
              The platform recorded {data.auditStats?.totalActions || 0} actions
              this month, which is{" "}
              {(data.auditStats?.totalActions || 0) >
              (data.auditStats?.actionsLastMonth?.length > 0
                ? data.auditStats.actionsLastMonth.reduce(
                    (sum, action) => sum + (action.count || 0),
                    0
                  )
                : 0)
                ? "higher"
                : (data.auditStats?.totalActions || 0) <
                  (data.auditStats?.actionsLastMonth?.length > 0
                    ? data.auditStats.actionsLastMonth.reduce(
                        (sum, action) => sum + (action.count || 0),
                        0
                      )
                    : 0)
                ? "lower"
                : "about the same"}{" "}
              compared to last month. This suggests that platform engagement{" "}
              {(data.auditStats?.totalActions || 0) >
              (data.auditStats?.actionsLastMonth?.length > 0
                ? data.auditStats.actionsLastMonth.reduce(
                    (sum, action) => sum + (action.count || 0),
                    0
                  )
                : 0)
                ? "has increased due to higher interaction or administrative activity."
                : (data.auditStats?.totalActions || 0) <
                  (data.auditStats?.actionsLastMonth?.length > 0
                    ? data.auditStats.actionsLastMonth.reduce(
                        (sum, action) => sum + (action.count || 0),
                        0
                      )
                    : 0)
                ? "has decreased, indicating reduced activity or streamlined workflows."
                : "remains consistent with previous usage levels."}{" "}
              Analyzing trends across actions like logins, content changes, and
              system interactions can help guide further optimizations.
            </Text>
          </View>
        </View>

        {/* 4. Conversations Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Conversations Metrics Dashboard
          </Text>

          {/* Total Conversations */}
          <View style={styles.row}>
            <Text style={styles.label}>
              Total Conversations (Current Month):
            </Text>
            <Text style={styles.value}>
              {data.conversationStats?.currentMonth?.totalConversations || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Conversations (Past Month):</Text>
            <Text style={styles.value}>
              {data.conversationStats?.pastMonth?.totalConversations || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Avg Members per Conversation:</Text>
            <Text style={styles.value}>
              {data.conversationStats?.avgMembersPerConversation || 0}
            </Text>
          </View>

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Communication Analysis</Text>
            <Text style={styles.analysisText}>
              The platform recorded{" "}
              {data.conversationStats?.currentMonth?.totalConversations || 0}{" "}
              conversations this month, which is{" "}
              {(data.conversationStats?.currentMonth?.totalConversations || 0) >
              (data.conversationStats?.pastMonth?.totalConversations || 0)
                ? "higher"
                : (data.conversationStats?.currentMonth?.totalConversations ||
                    0) <
                  (data.conversationStats?.pastMonth?.totalConversations || 0)
                ? "lower"
                : "about the same"}{" "}
              compared to last month. This indicates that user interaction{" "}
              {(data.conversationStats?.currentMonth?.totalConversations || 0) >
              (data.conversationStats?.pastMonth?.totalConversations || 0)
                ? "has increased, suggesting better engagement or more communication between users."
                : (data.conversationStats?.currentMonth?.totalConversations ||
                    0) <
                  (data.conversationStats?.pastMonth?.totalConversations || 0)
                ? "has decreased, which may point to reduced engagement or changing user behavior."
                : "remains stable, reflecting consistent user activity."}{" "}
              Furthermore, the average number of members per conversation is{" "}
              {data.conversationStats?.avgMembersPerConversation || 0}. By
              analyzing communication patterns and trends, we can improve user
              interaction and further optimize the platform to foster better
              communication.
            </Text>
          </View>
        </View>

        {/* 6. Item for Sale Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Item for Sale Metrics Dashboard
          </Text>

          {/* Total Items */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Items:</Text>
            <Text style={styles.value}>
              {data.itemForSaleStats?.currentMonth?.totalItems || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Approved Items:</Text>
            <Text style={styles.value}>
              {data.itemForSaleStats?.currentMonth?.statusCounts?.find(
                (status) => status.status === "approved"
              )?.count || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Average Price:</Text>
            <Text style={styles.value}>
              ₱{data.itemForSaleStats?.currentMonth?.averagePrice || "0.00"}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Popular Categories
          </Text>
          {data.itemForSaleStats?.currentMonth?.popularCategories?.length >
          0 ? (
            data.itemForSaleStats.currentMonth.popularCategories.map(
              (cat, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {cat.category || "Uncategorized"}:
                  </Text>
                  <Text style={styles.value}>{cat.count || 0} items</Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No categories data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Payment Modes
          </Text>
          {data.itemForSaleStats?.currentMonth?.paymentModes?.length > 0 ? (
            data.itemForSaleStats.currentMonth.paymentModes.map(
              (mode, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {mode.payment_mode || "Unknown"}:
                  </Text>
                  <Text style={styles.value}>
                    {mode.count || 0} transactions
                  </Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No payment mode data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Marketplace Analysis</Text>
            <Text style={styles.analysisText}>
              The total items listed for sale this month are{" "}
              {data.itemForSaleStats?.currentMonth?.totalItems || 0}, which is{" "}
              {(data.itemForSaleStats?.currentMonth?.totalItems || 0) >
              (data.itemForSaleStats?.pastMonth?.totalItems || 0)
                ? "higher"
                : (data.itemForSaleStats?.currentMonth?.totalItems || 0) <
                  (data.itemForSaleStats?.pastMonth?.totalItems || 0)
                ? "lower"
                : "about the same"}{" "}
              compared to last month. This indicates that item listings{" "}
              {(data.itemForSaleStats?.currentMonth?.totalItems || 0) >
              (data.itemForSaleStats?.pastMonth?.totalItems || 0)
                ? "have increased, suggesting more user engagement or higher interest in the marketplace."
                : (data.itemForSaleStats?.currentMonth?.totalItems || 0) <
                  (data.itemForSaleStats?.pastMonth?.totalItems || 0)
                ? "have decreased, possibly due to lower user activity or reduced item availability."
                : "have remained consistent, showing steady market participation."}{" "}
              The average price of items is ₱
              {data.itemForSaleStats?.currentMonth?.averagePrice || "0.00"},
              which reflects the general affordability of listed products.
              Monitoring popular categories like{" "}
              {data.itemForSaleStats?.currentMonth?.popularCategories?.length >
              0
                ? data.itemForSaleStats.currentMonth.popularCategories
                    .map((cat) => cat.category)
                    .join(", ")
                : "N/A"}{" "}
              can help identify high-demand items, allowing for better targeted
              promotions and more relevant listings.
            </Text>
          </View>
        </View>

        {/* 7. Listing Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Metrics Dashboard</Text>

          {/* Total Listings */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Listings:</Text>
            <Text style={styles.value}>
              {data.listingStats?.currentMonth?.totalListings || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Average Rate:</Text>
            <Text style={styles.value}>
              ₱{data.listingStats?.currentMonth?.avgRate || "0.00"}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Listing Categories
          </Text>
          {data.listingStats?.currentMonth?.categoryCounts?.length > 0 ? (
            data.listingStats.currentMonth.categoryCounts.map((cat, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>
                  {cat.category || "Uncategorized"}:
                </Text>
                <Text style={styles.value}>{cat.count || 0} listings</Text>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No category data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Payment Modes
          </Text>
          {data.listingStats?.currentMonth?.paymentModeCounts?.length > 0 ? (
            data.listingStats.currentMonth.paymentModeCounts.map(
              (mode, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {mode.payment_mode || "Unknown"}:
                  </Text>
                  <Text style={styles.value}>
                    {mode.count || 0} transactions
                  </Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No payment mode data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>
              Marketplace Activity Analysis
            </Text>
            <Text style={styles.analysisText}>
              The total listings for the current month are{" "}
              {data.listingStats?.currentMonth?.totalListings || 0}, which is{" "}
              {(data.listingStats?.currentMonth?.totalListings || 0) >
              (data.listingStats?.pastMonth?.totalListings || 0)
                ? "higher"
                : (data.listingStats?.currentMonth?.totalListings || 0) <
                  (data.listingStats?.pastMonth?.totalListings || 0)
                ? "lower"
                : "about the same"}{" "}
              compared to last month. This indicates that listing activity{" "}
              {(data.listingStats?.currentMonth?.totalListings || 0) >
              (data.listingStats?.pastMonth?.totalListings || 0)
                ? "has increased, signaling a higher volume of items or services being offered."
                : (data.listingStats?.currentMonth?.totalListings || 0) <
                  (data.listingStats?.pastMonth?.totalListings || 0)
                ? "has decreased, potentially due to lower user engagement or reduced availability of listings."
                : "remains steady, showing consistent activity in the marketplace."}{" "}
              The average rate of listings is ₱
              {data.listingStats?.currentMonth?.avgRate || "0.00"}, providing
              insight into the typical pricing of items and services. Monitoring
              popular categories like{" "}
              {data.listingStats?.currentMonth?.categoryCounts?.length > 0
                ? data.listingStats.currentMonth.categoryCounts
                    .map((cat) => cat.category)
                    .join(", ")
                : "N/A"}{" "}
              can help identify trending product or service types. Additionally,
              tracking preferred payment modes provides valuable insight into
              user payment preferences and behavior.
            </Text>
          </View>
        </View>

        {/* 8. Post Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post Metrics Dashboard</Text>

          {/* Total Posts */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Posts:</Text>
            <Text style={styles.value}>
              {data.postStats?.currentMonth?.totalPosts || 0}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Posts by Category
          </Text>
          {data.postStats?.currentMonth?.postsByCategory?.length > 0 ? (
            data.postStats.currentMonth.postsByCategory.map((cat, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>
                  {cat.category || "Uncategorized"}:
                </Text>
                <Text style={styles.value}>{cat.count || 0} posts</Text>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No category data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Posts by Status
          </Text>
          {data.postStats?.currentMonth?.postsByStatus?.length > 0 ? (
            data.postStats.currentMonth.postsByStatus.map((status, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{status.status || "Unknown"}:</Text>
                <Text style={styles.value}>{status.count || 0} posts</Text>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No status data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Posts by Type
          </Text>
          {data.postStats?.currentMonth?.postsByType?.length > 0 ? (
            data.postStats.currentMonth.postsByType.map((type, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{type.post_type || "Unknown"}:</Text>
                <Text style={styles.value}>{type.count || 0} posts</Text>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No post type data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Posts by User
          </Text>
          {data.postStats?.currentMonth?.postsByUser?.length > 0 ? (
            data.postStats.currentMonth.postsByUser.map((user, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>
                  User {user.user_id || "Unknown"}:
                </Text>
                <Text style={styles.value}>{user.count || 0} posts</Text>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No user data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Post Activity Analysis</Text>
            <Text style={styles.analysisText}>
              {(() => {
                const currentPosts =
                  data.postStats?.currentMonth?.totalPosts || 0;
                const pastPosts = data.postStats?.pastMonth?.totalPosts || 0;
                const categories =
                  data.postStats?.currentMonth?.postsByCategory || [];
                const statuses =
                  data.postStats?.currentMonth?.postsByStatus || [];

                const popularCategories =
                  categories.length > 0
                    ? categories
                        .sort((a, b) => (b.count || 0) - (a.count || 0))
                        .map((cat) => cat.category)
                        .join(", ")
                    : "N/A";

                const postStatuses =
                  statuses.length > 0
                    ? statuses.map((status) => status.status).join(", ")
                    : "N/A";

                const trendComparison =
                  currentPosts > pastPosts
                    ? "has increased, indicating a growing interest in sharing items or services for sale or rent."
                    : currentPosts < pastPosts
                    ? "has decreased, potentially reflecting reduced engagement or fewer items being offered."
                    : "has remained consistent, showing steady activity.";

                return `The total posts for the current month are ${currentPosts}, which is ${
                  currentPosts > pastPosts
                    ? "higher"
                    : currentPosts < pastPosts
                    ? "lower"
                    : "approximately the same"
                } compared to the previous month. This indicates that posting activity ${trendComparison} Popular categories such as ${popularCategories} highlight areas of interest among users. Monitoring post status and types (${postStatuses}) also provides insights into what kind of posts are most commonly approved or sought after.`;
              })()}
            </Text>
          </View>
        </View>

        {/* 9. Rental Transaction Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Transaction Metrics</Text>

          {/* Total Transactions */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Transactions:</Text>
            <Text style={styles.value}>
              {data.rentalTransactionStats?.currentMonth?.totalTransactions ||
                0}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Transaction Types
          </Text>
          {data.rentalTransactionStats?.currentMonth?.transactionTypeCounts
            ?.length > 0 ? (
            data.rentalTransactionStats.currentMonth.transactionTypeCounts.map(
              (type, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {type.transaction_type || "Unknown"}:
                  </Text>
                  <Text style={styles.value}>{type.count || 0}</Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>
                No transaction type data available
              </Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Transaction Statuses
          </Text>
          {data.rentalTransactionStats?.currentMonth?.transactionStatusCounts
            ?.length > 0 ? (
            data.rentalTransactionStats.currentMonth.transactionStatusCounts.map(
              (status, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {status.status || "Unknown"}:
                  </Text>
                  <Text style={styles.value}>{status.count || 0}</Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No status data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Payment Statuses
          </Text>
          {data.rentalTransactionStats?.currentMonth?.paymentStatusCounts
            ?.length > 0 ? (
            data.rentalTransactionStats.currentMonth.paymentStatusCounts.map(
              (payment, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {payment.payment_status || "Unknown"}:
                  </Text>
                  <Text style={styles.value}>{payment.count || 0}</Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>No payment status data available</Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Delivery Methods
          </Text>
          {data.rentalTransactionStats?.currentMonth?.deliveryMethodCounts
            ?.length > 0 ? (
            data.rentalTransactionStats.currentMonth.deliveryMethodCounts.map(
              (method, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.label}>
                    {method.delivery_method || "Unknown"}:
                  </Text>
                  <Text style={styles.value}>{method.count || 0}</Text>
                </View>
              )
            )
          ) : (
            <View style={styles.row}>
              <Text style={styles.label}>
                No delivery method data available
              </Text>
              <Text style={styles.value}>0</Text>
            </View>
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>
              Transaction Activity Analysis
            </Text>
            <Text style={styles.analysisText}>
              {(() => {
                const currentTransactions =
                  data.rentalTransactionStats?.currentMonth
                    ?.totalTransactions || 0;
                const pastTransactions =
                  data.rentalTransactionStats?.pastMonth?.totalTransactions ||
                  0;

                const transactionTypeCounts =
                  data.rentalTransactionStats?.currentMonth
                    ?.transactionTypeCounts || [];
                const sortedTypes = [...transactionTypeCounts].sort(
                  (a, b) => (b.count || 0) - (a.count || 0)
                );

                const mostCommon = sortedTypes[0] || {
                  transaction_type: "N/A",
                  count: 0,
                };
                const secondMostCommon = sortedTypes[1] || {
                  transaction_type: "N/A",
                  count: 0,
                };

                const trendComparison =
                  currentTransactions > pastTransactions
                    ? "has increased, suggesting a higher volume of rental transactions."
                    : currentTransactions < pastTransactions
                    ? "has decreased, indicating a possible dip in rental activity."
                    : "has remained stable, showing consistent rental activity.";

                const deliveryMethods =
                  data.rentalTransactionStats?.currentMonth
                    ?.deliveryMethodCounts || [];
                const mostUsedDelivery =
                  deliveryMethods.length > 0
                    ? deliveryMethods.sort(
                        (a, b) => (b.count || 0) - (a.count || 0)
                      )[0]?.delivery_method || "N/A"
                    : "N/A";

                const pendingPayments =
                  data.rentalTransactionStats?.currentMonth?.paymentStatusCounts?.find(
                    (p) => p.payment_status === "Pending"
                  )?.count || 0;

                return `The total transactions for the current month are ${currentTransactions}, which is ${
                  currentTransactions > pastTransactions
                    ? "higher"
                    : currentTransactions < pastTransactions
                    ? "lower"
                    : "approximately the same"
                } compared to the previous month. This indicates that rental transaction activity ${trendComparison} The most common transaction type is ${
                  mostCommon.transaction_type
                } with ${mostCommon.count} occurrences, compared to ${
                  secondMostCommon.transaction_type
                } at ${
                  secondMostCommon.count
                }. Additionally, the most frequently used delivery method is ${mostUsedDelivery} which points to a preference for a specific delivery approach. Finally, there are ${pendingPayments} pending payments, which may indicate delays or indecision among users, warranting attention to improve the payment process.`;
              })()}
            </Text>
          </View>
        </View>

        {/* 10. Report Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Activity Metrics</Text>

          {/* Total Reports */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Reports:</Text>
            <Text style={styles.value}>
              {data.reportStats.currentMonth.totalReports}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Reports by Entity Type
          </Text>
          {data.reportStats.currentMonth.reportsByEntityType.map(
            (entity, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>
                  {entity.entity_type || "Unspecified"}:
                </Text>
                <Text style={styles.value}>{entity.count} reports</Text>
              </View>
            )
          )}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Reports by Status
          </Text>
          {data.reportStats.currentMonth.reportsByStatus.map(
            (status, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{status.status}:</Text>
                <Text style={styles.value}>{status.count}</Text>
              </View>
            )
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Report Analysis</Text>
            <Text style={styles.analysisText}>
              {(() => {
                const currentReports =
                  data.reportStats.currentMonth.totalReports || 0;
                const pastReports =
                  data.reportStats.pastMonth.totalReports || 0;

                const entityTypeCounts =
                  data.reportStats.currentMonth.reportsByEntityType || [];
                const sortedEntities = [...entityTypeCounts].sort(
                  (a, b) => b.count - a.count
                );
                const mostReportedEntity =
                  sortedEntities[0]?.entity_type || "Unspecified";

                const statusCounts =
                  data.reportStats.currentMonth.reportsByStatus || [];
                const sortedStatuses = [...statusCounts].sort(
                  (a, b) => b.count - a.count
                );
                const mostCommonStatus = sortedStatuses[0]?.status || "N/A";

                const trendComparison =
                  currentReports > pastReports
                    ? "has increased, indicating more reports are being filed."
                    : currentReports < pastReports
                    ? "has decreased, suggesting fewer issues or disputes."
                    : "has remained stable, showing consistent reporting activity.";

                return `The total reports for the current month are ${currentReports}, which is ${
                  currentReports > pastReports
                    ? "higher"
                    : currentReports < pastReports
                    ? "lower"
                    : "approximately the same"
                } compared to the previous month. This indicates that report activity ${trendComparison} The most reported entity type is ${mostReportedEntity}, which could point to frequent issues in that area. The most common report status is ${mostCommonStatus}, suggesting that reports are either pending resolution or being addressed efficiently. Additionally, the number of recorded disputes is ${
                  data.reportStats.currentMonth.disputesCount
                }, which reflects user satisfaction and the platform's conflict resolution efficiency.`;
              })()}
            </Text>
          </View>
        </View>

        {/* 11. Review Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review Activity Metrics</Text>

          {/* Total Reviews and Average Rating */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Reviews:</Text>
            <Text style={styles.value}>
              {data.reviewStats.currentMonth.totalReviews}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Rating:</Text>
            <Text style={styles.value}>
              {data.reviewStats.currentMonth.averageRating} / 5
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Most Reviewed Users
          </Text>
          {data.reviewStats.mostReviewedUsers?.map((user, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>
                {user
                  ? `${user["reviewee.first_name"]} ${user["reviewee.last_name"]}`
                  : "Unknown User"}
                :
              </Text>
              <Text style={styles.value}>{user.reviewCount} reviews</Text>
            </View>
          ))}

          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Rating Distribution
          </Text>
          {data.reviewStats.currentMonth.ratingDistribution.map(
            (rating, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>Rating {rating.rate}:</Text>
                <Text style={styles.value}>{rating.count} reviews</Text>
              </View>
            )
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Review Analysis</Text>
            <Text style={styles.analysisText}>
              {(() => {
                const currentReviews =
                  data.reviewStats.currentMonth.totalReviews || 0;
                const pastReviews =
                  data.reviewStats.pastMonth.totalReviews || 0;

                const ratingDistribution =
                  data.reviewStats.currentMonth.ratingDistribution || [];
                const sortedRatings = [...ratingDistribution].sort(
                  (a, b) => b.count - a.count
                );
                const mostCommonRating = sortedRatings[0]?.rate || "N/A";
                const mostCommonRatingCount = sortedRatings[0]?.count || "N/A";

                const trendComparison =
                  currentReviews > pastReviews
                    ? "has increased, showing more user engagement"
                    : currentReviews < pastReviews
                    ? "has decreased, indicating fewer reviews"
                    : "has remained stable, reflecting consistent review activity";

                return `The total number of reviews this month is ${currentReviews}, which is ${
                  currentReviews > pastReviews
                    ? "higher"
                    : currentReviews < pastReviews
                    ? "lower"
                    : "approximately the same"
                } compared to the previous month. The average rating is ${
                  data.reviewStats.currentMonth.averageRating
                } out of 5, indicating ${
                  data.reviewStats.currentMonth.averageRating >= 4
                    ? "a generally positive response from users"
                    : data.reviewStats.currentMonth.averageRating >= 3
                    ? "a mixed response, suggesting areas for improvement"
                    : "significant dissatisfaction, which should be addressed promptly"
                }. The most common rating was ${mostCommonRating}, with a total of ${mostCommonRatingCount} reviews. Identifying the most reviewed users can help recognize valuable contributors or address potential concerns if negative reviews are prevalent.`;
              })()}
            </Text>
          </View>
        </View>

        {/* 12. Student Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Demographics</Text>

          {/* Students per College */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Students per College
          </Text>
          {data.studentStats.currentMonth.studentsPerCollege.map(
            (college, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{college.college}:</Text>
                <Text style={styles.value}>{college.count} students</Text>
              </View>
            )
          )}

          {/* Students per Course */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Students per Course
          </Text>
          {data.studentStats.currentMonth.studentsPerCourse.map(
            (course, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>
                  {course.course || "Unspecified"}:
                </Text>
                <Text style={styles.value}>{course.count} students</Text>
              </View>
            )
          )}

          {/* Student Status Distribution */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Student Status Distribution
          </Text>
          {data.studentStats.currentMonth.studentStatusDistribution.map(
            (status, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{status.status}:</Text>
                <Text style={styles.value}>{status.count} students</Text>
              </View>
            )
          )}

          {/* Student Growth Over Time */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Student Growth Over Time
          </Text>
          {data.studentStats.currentMonth.studentGrowthOverTime.map(
            (entry, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{entry.day}:</Text>
                <Text style={styles.value}>{entry.count} students</Text>
              </View>
            )
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>
              Student Demographic Insights
            </Text>
            <Text style={styles.analysisText}>
              {(() => {
                const colleges =
                  data.studentStats.currentMonth.studentsPerCollege || [];
                const courses =
                  data.studentStats.currentMonth.studentsPerCourse || [];
                const statuses =
                  data.studentStats.currentMonth.studentStatusDistribution ||
                  [];
                const growth =
                  data.studentStats.currentMonth.studentGrowthOverTime || [];

                const topCollege = colleges.sort(
                  (a, b) => b.count - a.count
                )[0] || { college: "N/A", count: 0 };
                const secondCollege = colleges.sort(
                  (a, b) => b.count - a.count
                )[1] || { college: "N/A", count: 0 };

                const topCourse = courses.sort(
                  (a, b) => b.count - a.count
                )[0] || { course: "N/A", count: 0 };

                const verifiedCount =
                  statuses.find((s) => s.status === "verified")?.count || 0;
                const pendingCount =
                  statuses.find((s) => s.status === "pending")?.count || 0;

                const recentGrowth = growth.slice(0, 2);

                return `The statistics indicate that the majority of students this month are from the ${topCollege.college} with ${topCollege.count} students, followed by ${secondCollege.college} with ${secondCollege.count} students. Regarding courses, the ${topCourse.course} program has the highest enrollment with ${topCourse.count} students. The majority of students are verified (${verifiedCount}), with only a few still pending verification (${pendingCount}).`;
              })()}

              {(() => {
                const growth =
                  data.studentStats.currentMonth.studentGrowthOverTime || [];
                if (growth.length > 0) {
                  return `Recent student growth shows registrations of ${growth
                    .map((g) => `${g.count} students on ${g.day}`)
                    .join(" and ")}.`;
                } else {
                  return "No recent student growth data is available.";
                }
              })()}
            </Text>
          </View>
        </View>

        {/* 13. Transaction Report Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Report Overview</Text>

          {/* Total Reports */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Reports:</Text>
            <Text style={styles.value}>
              {data.transactionReportStats.currentMonth.totalReports}
            </Text>
          </View>

          {/* Average Resolution Time */}
          <View style={styles.row}>
            <Text style={styles.label}>Average Resolution Time:</Text>
            <Text style={styles.value}>
              {data.transactionReportStats.currentMonth.averageResolutionTime}{" "}
              hrs
            </Text>
          </View>

          {/* Response Rate */}
          <View style={styles.row}>
            <Text style={styles.label}>Response Rate:</Text>
            <Text style={styles.value}>
              {data.transactionReportStats.currentMonth.responseRate}%
            </Text>
          </View>

          {/* Reports by Type */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Reports by Type
          </Text>
          {data.transactionReportStats.currentMonth.reportsByType.map(
            (report, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{report.transaction_type}:</Text>
                <Text style={styles.value}>{report.count} reports</Text>
              </View>
            )
          )}

          {/* Report Status Distribution */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Report Status Distribution
          </Text>
          {data.transactionReportStats.currentMonth.reportStatusDistribution.map(
            (status, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{status.status}:</Text>
                <Text style={styles.value}>{status.count} reports</Text>
              </View>
            )
          )}

          {/* Most Reported Users */}
          <Text style={{ ...styles.sectionTitle, fontSize: 14, marginTop: 15 }}>
            Most Reported Users
          </Text>
          {data.transactionReportStats.currentMonth.mostReportedUsers.map(
            (user, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>User ID {user.reported_id}:</Text>
                <Text style={styles.value}>{user.count} reports</Text>
              </View>
            )
          )}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>
              Transaction Report Insights
            </Text>
            <Text style={styles.analysisText}>
              {(() => {
                const mostCommonReportType =
                  data.transactionReportStats.currentMonth.reportsByType[0]
                    ?.transaction_type || "Unknown";
                const reportCount =
                  data.transactionReportStats.currentMonth.reportsByType[0]
                    ?.count || 0;
                const resolutionTime =
                  data.transactionReportStats.currentMonth
                    .averageResolutionTime || "N/A";
                const responseRate =
                  data.transactionReportStats.currentMonth.responseRate || 0;
                const reportStatus =
                  data.transactionReportStats.currentMonth
                    .reportStatusDistribution[0]?.status || "N/A";
                const reportStatusCount =
                  data.transactionReportStats.currentMonth
                    .reportStatusDistribution[0]?.count || 0;
                const mostReportedUser =
                  data.transactionReportStats.currentMonth.mostReportedUsers[0]
                    ?.reported_id || "N/A";
                const mostReportedUserCount =
                  data.transactionReportStats.currentMonth.mostReportedUsers[0]
                    ?.count || 0;

                return `This month, a total of ${data.transactionReportStats.currentMonth.totalReports} transaction report(s) were filed. The most common report type was "${mostCommonReportType}" with ${reportCount} report(s). The average resolution time for these reports was ${resolutionTime} hours, and the response rate stands at ${responseRate}%. Most reports were marked with the status "${reportStatus}" (${reportStatusCount} reports). The most reported user this month is User ID ${mostReportedUser} with ${mostReportedUserCount} report(s).`;
              })()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 9, color: "#7F8C8D" }}>
            © {new Date().getFullYear()} RenTUPeers - Confidential Analytics
            Report
          </Text>
          {/* <Text style={{ fontSize: 9, color: "#7F8C8D" }}>Page 1</Text> */}
        </View>

        {/* Subtle watermark */}
        {/* <Text style={styles.watermark}>RenTUPeers</Text> */}
      </Page>
    </Document>
  );
};

const MonthlyReportGenerator = () => {
  const [reportData, setReportData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [lastGeneratedMonth, setLastGeneratedMonth] = useState(null);
  const [lastGeneratedYear, setLastGeneratedYear] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${baseApi}/admin/report`, {
        month,
        year,
      });
      setReportData(response.data);
      setShowPreview(true);
      setLastGeneratedMonth(month);
      setLastGeneratedYear(year);
    } catch (err) {
      setError(err.message || "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const openPdfInNewTab = async () => {
    if (!reportData) return alert("Generate the report first.");
    setLoading(true);
    try {
      const blob = await pdf(
        <MonthlyReportPDF data={reportData} month={month} year={year} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      setError("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportData) return alert("Generate the report first.");
    setLoading(true);
    try {
      const blob = await pdf(
        <MonthlyReportPDF data={reportData} month={month} year={year} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Report-${month}-${year}.pdf`;
      link.click();
    } catch (err) {
      setError("Failed to download PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value);
    setMonth(newMonth);
    // Hide preview if selection changed after generating report
    if (newMonth !== lastGeneratedMonth) {
      setShowPreview(false);
    }
  };

  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setYear(newYear);
    // Hide preview if selection changed after generating report
    if (newYear !== lastGeneratedYear) {
      setShowPreview(false);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  // Check if we should show results (report is generated and no changes to month/year)
  const showResults =
    showPreview &&
    month === lastGeneratedMonth &&
    year === lastGeneratedYear &&
    reportData;

  return (
    <div className="container py-4">
      {/* Month & Year Selection */}
      <div className="d-flex mb-3">
        <select
          value={month}
          onChange={handleMonthChange}
          className="form-select me-2"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={handleYearChange}
          placeholder="Year"
          min="2020"
          max="2030"
          className="form-control w-auto"
        />
      </div>

      {/* Generate Report Button */}
      <div className="mb-3">
        <button
          className="btn btn-primary w-100"
          onClick={fetchReportData}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Report Status - Only show when report is generated and no changes to month/year */}
      {showResults && (
        <div className="alert alert-success mb-3">
          <strong>Report Ready!</strong> {monthName} {year}
        </div>
      )}

      {/* Actions: Preview & Download PDF - Only show when report is generated and no changes to month/year */}
      {showResults && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary bg-white"
            onClick={openPdfInNewTab}
            disabled={loading}
            style={{ borderColor: "#0d6efd", color: "#0d6efd" }}
          >
            Preview PDF
          </button>
          <button
            className="btn btn-outline-success bg-white"
            onClick={downloadPdf}
            disabled={loading}
            style={{ borderColor: "#198754", color: "#198754" }}
          >
            Download PDF
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="text-center mt-4">Loading...</div>}
    </div>
  );
};

export default MonthlyReportGenerator;
