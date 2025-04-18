import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import { InputGroup, FormSelect, FormControl, Button } from "react-bootstrap";

// Create styles (enhanced for more sections)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1 solid #E0E0E0",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  companyTagline: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 5,
  },
  reportTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: "1 solid #E0E0E0",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    borderBottom: "1 solid #E0E0E0",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#34495E",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2980B9",
  },
  smallSection: {
    fontSize: 8,
    marginBottom: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: "1 solid #E0E0E0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  analysisSection: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB", // Light gray border
    backgroundColor: "#F3F4F6", // Light gray background
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937", // Darker shade for better readability
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 12,
    color: "#4B5563", // Medium gray text for better contrast
    lineHeight: 1.5,
    textAlign: "justify",
  },
});

// PDF Component with Comprehensive Reporting
const MonthlyReportPDF = ({ data, month, year }) => {
  // Format the month and year
  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });
  const reportTitle = `Monthly Platform Report - ${monthName} ${year}`;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>RenTUPeers</Text>
          </View>
        </View>

        {/* Report Title */}
        <Text style={styles.reportTitle}>{reportTitle}</Text>

        {/* Report Context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Context</Text>
          <Text style={styles.paragraph}>
            This report provides a comprehensive overview of the platform’s
            activity for the month of {monthName} {year}. It includes statistics
            on student engagement, listing trends, transaction statuses, and
            other key metrics to help evaluate platform growth and usage. The
            data compiled in this report is intended to guide future
            improvements and highlight user behavior patterns across the
            platform.
          </Text>
        </View>

        {/* 1. Users Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users Statistics</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Users (Past Month):</Text>
            <Text style={styles.value}>
              {data.usersStats.pastMonth.total_users || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Users (Current Month):</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth.total_users}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>{monthName} {year} Users Breakdown</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Admins:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth.total_admins || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Students:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth.total_students || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Superadmins:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth.total_superadmins || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Verified Users:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth.verified_users || 0}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Stripe Completed Users:</Text>
            <Text style={styles.value}>
              {data.usersStats.currentMonth.stripe_completed_users || 0}
            </Text>
          </View>

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The comparison between the current month and the past month shows{" "}
              {data.usersStats.currentMonth.total_users >
              (data.usersStats.pastMonth.total_users || 0)
                ? "a positive growth"
                : data.usersStats.currentMonth.total_users <
                  (data.usersStats.pastMonth.total_users || 0)
                ? "a decrease"
                : "no significant change"}{" "}
              in user registrations. This indicates that the platform's user
              engagement{" "}
              {data.usersStats.currentMonth.total_users >
              (data.usersStats.pastMonth.total_users || 0)
                ? "is increasing effectively."
                : data.usersStats.currentMonth.total_users <
                  (data.usersStats.pastMonth.total_users || 0)
                ? "has faced some decline."
                : "remains stable without much fluctuation."}
              To enhance growth, consider implementing strategies like improved
              user verification processes, better promotional efforts, or
              enhancing user experience to encourage more sign-ups and
              engagements.
            </Text>
          </View>
        </View>

        {/* 2. Audit Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Statistics</Text>

          {/* Total Actions */}
          <View style={styles.row}>
            <Text style={styles.label}>Total Actions (Current Month):</Text>
            <Text style={styles.value}>{data.auditStats.totalActions}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Actions (Past Month):</Text>
            <Text style={styles.value}>
              {data.auditStats.actionsLastMonth.length > 0
                ? data.auditStats.actionsLastMonth.reduce(
                    (sum, action) => sum + action.count,
                    0
                  )
                : 0}
            </Text>
          </View>

          {/* Actions by Type */}
          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Actions by Type
          </Text>
          {data.auditStats.actionsByType.map((action, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{action.action}:</Text>
              <Text style={styles.value}>{action.count}</Text>
            </View>
          ))}

          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total actions recorded for the current month are{" "}
              {data.auditStats.totalActions}, which is{" "}
              {data.auditStats.totalActions >
              (data.auditStats.actionsLastMonth.length > 0
                ? data.auditStats.actionsLastMonth.reduce(
                    (sum, action) => sum + action.count,
                    0
                  )
                : 0)
                ? "higher"
                : data.auditStats.totalActions <
                  (data.auditStats.actionsLastMonth.length > 0
                    ? data.auditStats.actionsLastMonth.reduce(
                        (sum, action) => sum + action.count,
                        0
                      )
                    : 0)
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month. This indicates that the platform's
              usage{" "}
              {data.auditStats.totalActions >
              (data.auditStats.actionsLastMonth.length > 0
                ? data.auditStats.actionsLastMonth.reduce(
                    (sum, action) => sum + action.count,
                    0
                  )
                : 0)
                ? "has increased, suggesting higher engagement or more administrative actions."
                : data.auditStats.totalActions <
                  (data.auditStats.actionsLastMonth.length > 0
                    ? data.auditStats.actionsLastMonth.reduce(
                        (sum, action) => sum + action.count,
                        0
                      )
                    : 0)
                ? "has decreased, which may indicate reduced activity or stricter control of administrative actions."
                : "remains steady with no significant change."}
              Evaluating specific actions such as login attempts, post
              submissions, and modifications can help identify areas that
              require further attention or improvements.
            </Text>
          </View>
        </View>

        {/* 4. Conversations Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversations Statistics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Conversations:</Text>
            <Text style={styles.value}>
              {data.conversationStats.totalConversations}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Active Conversations:</Text>
            <Text style={styles.value}>
              {data.conversationStats.activeConversations}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Avg Members per Conversation:</Text>
            <Text style={styles.value}>
              {data.conversationStats.avgMembersPerConversation}
            </Text>
          </View>
          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total conversations recorded for the current month are{" "}
              {data.conversationStats.currentMonth.totalConversations}, which is{" "}
              {data.conversationStats.currentMonth.totalConversations >
              data.conversationStats.pastMonth.totalConversations
                ? "higher"
                : data.conversationStats.currentMonth.totalConversations <
                  data.conversationStats.pastMonth.totalConversations
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month. This suggests that user
              interaction{" "}
              {data.conversationStats.currentMonth.totalConversations >
              data.conversationStats.pastMonth.totalConversations
                ? "has increased, indicating improved engagement or heightened communication between users."
                : data.conversationStats.currentMonth.totalConversations <
                  data.conversationStats.pastMonth.totalConversations
                ? "has decreased, which may suggest a decline in user engagement or changes in user behavior."
                : "remains consistent with previous performance, showing stable user interaction."}
              Additionally, the average number of members per conversation is{" "}
              {data.conversationStats.avgMembersPerConversation}. Monitoring
              trends in user communication patterns can help in enhancing the
              platform's usability and fostering a more engaging user
              experience.
            </Text>
          </View>
        </View>

        {/* 6. Item for Sale Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item for Sale Statistics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Items:</Text>
            <Text style={styles.value}>
              {data.itemForSaleStats.currentMonth.totalItems}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Approved Items:</Text>
            <Text style={styles.value}>
              {data.itemForSaleStats.currentMonth.statusCounts.find(
                (status) => status.status === "approved"
              )?.count || 0}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Price:</Text>
            <Text style={styles.value}>
              ${data.itemForSaleStats.currentMonth.averagePrice}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Popular Categories
          </Text>
          {data.itemForSaleStats.currentMonth.popularCategories.map(
            (cat, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{cat.category}:</Text>
                <Text style={styles.value}>{cat.count} items</Text>
              </View>
            )
          )}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Payment Modes
          </Text>
          {data.itemForSaleStats.currentMonth.paymentModes.map(
            (mode, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{mode.payment_mode}:</Text>
                <Text style={styles.value}>{mode.count} transactions</Text>
              </View>
            )
          )}
          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total items listed for sale this month are{" "}
              {data.itemForSaleStats.currentMonth.totalItems}, which is{" "}
              {data.itemForSaleStats.currentMonth.totalItems >
              data.itemForSaleStats.pastMonth.totalItems
                ? "higher"
                : data.itemForSaleStats.currentMonth.totalItems <
                  data.itemForSaleStats.pastMonth.totalItems
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month. This suggests that item listings{" "}
              {data.itemForSaleStats.currentMonth.totalItems >
              data.itemForSaleStats.pastMonth.totalItems
                ? "have increased, indicating growing interest or activity in the marketplace."
                : data.itemForSaleStats.currentMonth.totalItems <
                  data.itemForSaleStats.pastMonth.totalItems
                ? "have decreased, potentially due to reduced user engagement or item availability."
                : "have remained stable, showing consistent user activity."}
              The average price of items is $
              {data.itemForSaleStats.currentMonth.averagePrice}, which can
              provide insights into the overall affordability of listed items.
              Monitoring popular categories like{" "}
              {data.itemForSaleStats.currentMonth.popularCategories
                .map((cat) => cat.category)
                .join(", ")}{" "}
              can help identify high-demand product types and improve user
              satisfaction by promoting relevant items.
            </Text>
          </View>
        </View>

        {/* 7. Listing Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Statistics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Listings:</Text>
            <Text style={styles.value}>
              {data.listingStats.currentMonth.totalListings}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Rate:</Text>
            <Text style={styles.value}>
              ${data.listingStats.currentMonth.avgRate}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Listing Categories
          </Text>
          {data.listingStats.currentMonth.categoryCounts.map((cat, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{cat.category}:</Text>
              <Text style={styles.value}>{cat.count} listings</Text>
            </View>
          ))}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Payment Modes
          </Text>
          {data.listingStats.currentMonth.paymentModeCounts.map(
            (mode, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{mode.payment_mode}:</Text>
                <Text style={styles.value}>{mode.count} transactions</Text>
              </View>
            )
          )}
          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total listings for the current month are{" "}
              {data.listingStats.currentMonth.totalListings}, which is{" "}
              {data.listingStats.currentMonth.totalListings >
              data.listingStats.pastMonth.totalListings
                ? "higher"
                : data.listingStats.currentMonth.totalListings <
                  data.listingStats.pastMonth.totalListings
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month. This suggests that listing
              activity{" "}
              {data.listingStats.currentMonth.totalListings >
              data.listingStats.pastMonth.totalListings
                ? "has increased, indicating a higher volume of items or services being offered for rent or sale."
                : data.listingStats.currentMonth.totalListings <
                  data.listingStats.pastMonth.totalListings
                ? "has decreased, potentially indicating reduced user engagement or availability of items."
                : "remains consistent, showing steady user activity."}
              The average rate of items is $
              {data.listingStats.currentMonth.avgRate}, providing insight into
              typical pricing within the marketplace. Monitoring popular
              categories like{" "}
              {data.listingStats.currentMonth.categoryCounts
                .map((cat) => cat.category)
                .join(", ")}{" "}
              can help identify trending items or services. Additionally,
              tracking preferred payment modes ( "Online Payment, Payment upon
              Meetup" ) offers insight into user payment preferences.
            </Text>
          </View>
        </View>

        {/* 8. Post Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post Statistics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Posts:</Text>
            <Text style={styles.value}>
              {data.postStats.currentMonth.totalPosts}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Posts by Category
          </Text>
          {data.postStats.currentMonth.postsByCategory.map((cat, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{cat.category}:</Text>
              <Text style={styles.value}>{cat.count} posts</Text>
            </View>
          ))}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Posts by Status
          </Text>
          {data.postStats.currentMonth.postsByStatus.map((status, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{status.status}:</Text>
              <Text style={styles.value}>{status.count} posts</Text>
            </View>
          ))}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Posts by Type
          </Text>
          {data.postStats.currentMonth.postsByType.map((type, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{type.post_type}:</Text>
              <Text style={styles.value}>{type.count} posts</Text>
            </View>
          ))}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Posts by User
          </Text>
          {data.postStats.currentMonth.postsByUser.map((user, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>User {user.user_id}:</Text>
              <Text style={styles.value}>{user.count} posts</Text>
            </View>
          ))}
          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              {(() => {
                const currentPosts =
                  data.postStats.currentMonth.totalPosts || 0;
                const pastPosts = data.postStats.pastMonth.totalPosts || 0;
                const categories =
                  data.postStats.currentMonth.postsByCategory || [];
                const statuses =
                  data.postStats.currentMonth.postsByStatus || [];

                const popularCategories =
                  categories
                    .sort((a, b) => b.count - a.count)
                    .map((cat) => cat.category)
                    .join(", ") || "N/A";

                const postStatuses =
                  statuses.map((status) => status.status).join(", ") || "N/A";

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
          <Text style={styles.sectionTitle}>Rental Transaction Statistics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Transactions:</Text>
            <Text style={styles.value}>
              {data.rentalTransactionStats.currentMonth.totalTransactions}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Transaction Types
          </Text>
          {data.rentalTransactionStats.currentMonth.transactionTypeCounts.map(
            (type, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{type.transaction_type}:</Text>
                <Text style={styles.value}>{type.count}</Text>
              </View>
            )
          )}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Transaction Statuses
          </Text>
          {data.rentalTransactionStats.currentMonth.transactionStatusCounts.map(
            (status, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{status.status}:</Text>
                <Text style={styles.value}>{status.count}</Text>
              </View>
            )
          )}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Payment Statuses
          </Text>
          {data.rentalTransactionStats.currentMonth.paymentStatusCounts.map(
            (payment, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{payment.payment_status}:</Text>
                <Text style={styles.value}>{payment.count}</Text>
              </View>
            )
          )}

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
            Delivery Methods
          </Text>
          {data.rentalTransactionStats.currentMonth.deliveryMethodCounts.map(
            (method, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{method.delivery_method}:</Text>
                <Text style={styles.value}>{method.count}</Text>
              </View>
            )
          )}
          {/* Insight Analysis */}
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total transactions recorded for the current month are{" "}
              {data.rentalTransactionStats.currentMonth.totalTransactions},
              which is{" "}
              {data.rentalTransactionStats.currentMonth.totalTransactions >
              data.rentalTransactionStats.pastMonth.totalTransactions
                ? "higher"
                : data.rentalTransactionStats.currentMonth.totalTransactions <
                  data.rentalTransactionStats.pastMonth.totalTransactions
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month.{" "}
              {(() => {
                const transactionTypeCounts =
                  data.rentalTransactionStats.currentMonth
                    .transactionTypeCounts || [];
                const sortedTypes = [...transactionTypeCounts].sort(
                  (a, b) => b.count - a.count
                );

                const mostCommon = sortedTypes[0] || {
                  transaction_type: "N/A",
                  count: 0,
                };
                const secondMostCommon = sortedTypes[1] || {
                  transaction_type: "N/A",
                  count: 0,
                };

                return `${mostCommon.transaction_type} transactions (${mostCommon.count}) are more common than ${secondMostCommon.transaction_type} transactions (${secondMostCommon.count}), suggesting that users prefer ${mostCommon.transaction_type} rather than ${secondMostCommon.transaction_type}.`;
              })()}
              The most frequently used delivery method is{" "}
              {data.rentalTransactionStats.currentMonth.deliveryMethodCounts.sort(
                (a, b) => b.count - a.count
              )[0]?.delivery_method || "N/A"}
              , highlighting user preference for a convenient transaction
              process. Additionally, the high number of pending payments (
              {data.rentalTransactionStats.currentMonth.paymentStatusCounts.find(
                (p) => p.payment_status === "Pending"
              )?.count || 0}
              ) could indicate delays in transaction completions or user
              indecision. Monitoring this trend can help improve payment
              processes or provide better guidance to users.
            </Text>
          </View>
        </View>

        {/* 10. Report Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Statistics</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Reports:</Text>
            <Text style={styles.value}>
              {data.reportStats.currentMonth.totalReports}
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total number of reports recorded this month is{" "}
              {data.reportStats.currentMonth.totalReports}, which is{" "}
              {data.reportStats.currentMonth.totalReports >
              data.reportStats.pastMonth.totalReports
                ? "higher"
                : data.reportStats.currentMonth.totalReports <
                  data.reportStats.pastMonth.totalReports
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month. The most reported entity type is{" "}
              {data.reportStats.currentMonth.reportsByEntityType.sort(
                (a, b) => b.count - a.count
              )[0]?.entity_type || "Unspecified"}
              , indicating potential issues or disputes related to that
              category. The majority of reports are marked as{" "}
              {data.reportStats.currentMonth.reportsByStatus.sort(
                (a, b) => b.count - a.count
              )[0]?.status || "N/A"}
              , which suggests{" "}
              {data.reportStats.currentMonth.reportsByStatus.sort(
                (a, b) => b.count - a.count
              )[0]?.status === "pending"
                ? "a backlog of unresolved reports that may require further attention"
                : "most reports are being processed effectively"}
              . Additionally, there are{" "}
              {data.reportStats.currentMonth.disputesCount} disputes recorded,
              reflecting the overall user satisfaction and conflict resolution
              efficiency of the platform.
            </Text>
          </View>
        </View>

        {/* 11. Review Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review Statistics</Text>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              The total number of reviews recorded this month is{" "}
              {data.reviewStats.currentMonth.totalReviews}, which is{" "}
              {data.reviewStats.currentMonth.totalReviews >
              data.reviewStats.pastMonth.totalReviews
                ? "higher"
                : data.reviewStats.currentMonth.totalReviews <
                  data.reviewStats.pastMonth.totalReviews
                ? "lower"
                : "approximately the same"}{" "}
              compared to the previous month. The average rating for this month
              is {data.reviewStats.currentMonth.averageRating} out of 5,
              indicating{" "}
              {data.reviewStats.currentMonth.averageRating >= 4
                ? "a generally positive response from users"
                : data.reviewStats.currentMonth.averageRating >= 3
                ? "a mixed response, suggesting areas for improvement"
                : "significant dissatisfaction, which should be addressed promptly"}
              . The most common rating given was{" "}
              {data.reviewStats.currentMonth.ratingDistribution.sort(
                (a, b) => b.count - a.count
              )[0]?.rate || "N/A"}
              , with a total of{" "}
              {data.reviewStats.currentMonth.ratingDistribution.sort(
                (a, b) => b.count - a.count
              )[0]?.count || "N/A"}{" "}
              reviews. Identifying the most reviewed users can help recognize
              valuable contributors or address potential concerns if negative
              reviews are prevalent.
            </Text>
          </View>
        </View>

        {/* 12. Student Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Statistics</Text>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
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
                  return `Student growth over time shows recent registrations of ${growth
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
          <Text style={styles.sectionTitle}>Transaction Report Statistics</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Reports:</Text>
            <Text style={styles.value}>
              {data.transactionReportStats.currentMonth.totalReports}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Resolution Time:</Text>
            <Text style={styles.value}>
              {data.transactionReportStats.currentMonth.averageResolutionTime}{" "}
              hrs
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Response Rate:</Text>
            <Text style={styles.value}>
              {data.transactionReportStats.currentMonth.responseRate}%
            </Text>
          </View>

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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

          <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
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
            <Text style={styles.analysisTitle}>Insight Analysis:</Text>
            <Text style={styles.analysisText}>
              During this month, there has been a total of{" "}
              {data.transactionReportStats.currentMonth.totalReports}{" "}
              transaction report(s). The most common report type is related to "
              {data.transactionReportStats.currentMonth.reportsByType[0]
                ?.transaction_type || "Unknown"}
              ", with{" "}
              {data.transactionReportStats.currentMonth.reportsByType[0]
                ?.count || 0}{" "}
              report(s). The average resolution time is{" "}
              {data.transactionReportStats.currentMonth.averageResolutionTime}{" "}
              hours, which suggests either efficient or pending handling of
              reports. The response rate is currently{" "}
              {data.transactionReportStats.currentMonth.responseRate}%,
              indicating a need for improvement if it's below expectations. Most
              reports are under the status of "
              {data.transactionReportStats.currentMonth
                .reportStatusDistribution[0]?.status || "N/A"}
              ", with a count of{" "}
              {data.transactionReportStats.currentMonth
                .reportStatusDistribution[0]?.count || 0}
              . The most reported user this month is User ID{" "}
              {data.transactionReportStats.currentMonth.mostReportedUsers[0]
                ?.reported_id || "N/A"}{" "}
              with{" "}
              {data.transactionReportStats.currentMonth.mostReportedUsers[0]
                ?.count || 0}{" "}
              report(s).
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 8, color: "#7F8C8D" }}>
            © 2025 RenTUPeers
          </Text>
          <Text style={{ fontSize: 8, color: "#7F8C8D" }}>
            Generated on: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const MonthlyReportGenerator = () => {
  const [reportData, setReportData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [lastGeneratedMonth, setLastGeneratedMonth] = useState(null);
  const [lastGeneratedYear, setLastGeneratedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:3001/admin/report", {
        month,
        year,
      });
      setReportData(response.data);
      setLastGeneratedMonth(month);
      setLastGeneratedYear(year);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const openPdfInNewTab = async () => {
    if (!reportData) {
      alert("Report data is not yet loaded");
      return;
    }

    try {
      const blob = await pdf(
        <MonthlyReportPDF data={reportData} month={month} year={year} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF");
    }
  };

  const isReportUpToDate =
    reportData && lastGeneratedMonth === month && lastGeneratedYear === year;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Monthly Platform Report Generator
      </h1>

      <div style={{ maxWidth: "500px" }}>
        <InputGroup className="d-flex gap-0 m-0">
          <FormSelect
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </FormSelect>
          <FormControl
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="Year"
          />
          <Button
            variant="secondary"
            onClick={fetchReportData}
            disabled={loading}
            className="d-flex gap-0 m-0"
          >
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </InputGroup>
      </div>

      {loading && <div className="mt-2">Loading report data...</div>}
      {error && <div className="mt-2 text-danger">Error: {error.message}</div>}

      {isReportUpToDate && (
        <button onClick={openPdfInNewTab} className="btn btn-primary mt-3">
          Open PDF in New Tab
        </button>
      )}
    </div>
  );
};

export default MonthlyReportGenerator;
