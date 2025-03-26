import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";


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
});

// PDF Component with Comprehensive Reporting
const MonthlyReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>
            RenTUPeers - Peer-to-peer Rental and Buy&Sell Platform
          </Text>
          <Text style={styles.companyTagline}>
            Comprehensive Monthly Platform Report
          </Text>
        </View>
      </View>

      {/* Report Title */}
      <Text style={styles.reportTitle}>
        Monthly Platform Report - March 2025
      </Text>

      {/* 1. Users Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Users Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Users:</Text>
          <Text style={styles.value}>{data.usersStats.total_users}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Admins:</Text>
          <Text style={styles.value}>{data.usersStats.total_admins}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Students:</Text>
          <Text style={styles.value}>{data.usersStats.total_students}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Verified Users:</Text>
          <Text style={styles.value}>{data.usersStats.verified_users}</Text>
        </View>
      </View>

      {/* 2. Audit Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Actions:</Text>
          <Text style={styles.value}>{data.auditStats.totalActions}</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Actions by Type
        </Text>
        {data.auditStats.actionsByType.map((action, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{action.action}:</Text>
            <Text style={styles.value}>{action.count}</Text>
          </View>
        ))}
      </View>

      {/* 3. Cart Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cart Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Items:</Text>
          <Text style={styles.value}>{data.cartStats.totalItems}</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Transaction Types
        </Text>
        {data.cartStats.transactionTypeCounts.map((type, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{type.transaction_type}:</Text>
            <Text style={styles.value}>{type.count}</Text>
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.label}>Total Revenue:</Text>
          <Text style={styles.value}>
            ${data.cartStats.totalRevenue.toFixed(2)}
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
      </View>

      {/* 5. Follow Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Follow Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Follows:</Text>
          <Text style={styles.value}>{data.followStats.totalFollows}</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Most Followed Users
        </Text>
        {data.followStats.mostFollowedUsers.map((user, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>User {user.followee_id}:</Text>
            <Text style={styles.value}>{user.follower_count} followers</Text>
          </View>
        ))}
      </View>

      {/* 6. Item for Sale Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item for Sale Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Items:</Text>
          <Text style={styles.value}>{data.itemForSaleStats.totalItems}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Approved Items:</Text>
          <Text style={styles.value}>
            {data.itemForSaleStats.approvedItems}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Price:</Text>
          <Text style={styles.value}>
            ${data.itemForSaleStats.averagePrice}
          </Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Popular Categories
        </Text>
        {data.itemForSaleStats.popularCategories.map((cat, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{cat.category}:</Text>
            <Text style={styles.value}>{cat.count} items</Text>
          </View>
        ))}
      </View>

      {/* 7. Listing Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Listing Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Listings:</Text>
          <Text style={styles.value}>{data.listingStats.totalListings}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Rate:</Text>
          <Text style={styles.value}>${data.listingStats.avgRate}</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Listing Categories
        </Text>
        {data.listingStats.categoryCounts.map((cat, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{cat.category}:</Text>
            <Text style={styles.value}>{cat.count} listings</Text>
          </View>
        ))}
      </View>

      {/* 8. Post Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Post Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Posts:</Text>
          <Text style={styles.value}>{data.postStats.totalPosts}</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Posts by Category
        </Text>
        {data.postStats.postsByCategory.map((cat, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{cat.category}:</Text>
            <Text style={styles.value}>{cat.count} posts</Text>
          </View>
        ))}
      </View>

      {/* 9. Rental Transaction Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rental Transaction Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Transactions:</Text>
          <Text style={styles.value}>
            {data.rentalTransactionStats.totalTransactions}
          </Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Transaction Types
        </Text>
        {data.rentalTransactionStats.transactionTypeCounts.map(
          (type, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{type.transaction_type}:</Text>
              <Text style={styles.value}>{type.count}</Text>
            </View>
          )
        )}
      </View>

      {/* 10. Report Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Reports:</Text>
          <Text style={styles.value}>{data.reportStats.totalReports}</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Reports by Entity Type
        </Text>
        {data.reportStats.reportsByEntityType.map((entity, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>
              {entity.entity_type || "Unspecified"}:
            </Text>
            <Text style={styles.value}>{entity.count} reports</Text>
          </View>
        ))}
      </View>

      {/* 11. Review Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Reviews:</Text>
          <Text style={styles.value}>{data.reviewStats.totalReviews}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Rating:</Text>
          <Text style={styles.value}>{data.reviewStats.averageRating} / 5</Text>
        </View>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Most Reviewed Users
        </Text>
        {data.reviewStats.mostReviewedUsers.map((user, index) => (
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
      </View>

      {/* 12. Student Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Statistics</Text>
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Students per College
        </Text>
        {data.studentStats.studentsPerCollege.map((college, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{college.college}:</Text>
            <Text style={styles.value}>{college.count} students</Text>
          </View>
        ))}
        <Text style={{ ...styles.sectionTitle, marginTop: 10, fontSize: 12 }}>
          Students per Course
        </Text>
        {data.studentStats.studentsPerCourse.map((course, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{course.course || "Unspecified"}:</Text>
            <Text style={styles.value}>{course.count} students</Text>
          </View>
        ))}
      </View>

      {/* 13. Transaction Report Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Report Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Reports:</Text>
          <Text style={styles.value}>
            {data.transactionReportStats.totalReports}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Resolution Time:</Text>
          <Text style={styles.value}>
            {data.transactionReportStats.averageResolutionTime} hrs
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Response Rate:</Text>
          <Text style={styles.value}>
            {data.transactionReportStats.responseRate}%
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ fontSize: 8, color: "#7F8C8D" }}>
          © 2025 TUP Materials Exchange Platform
        </Text>
        <Text style={{ fontSize: 8, color: "#7F8C8D" }}>
          Generated on: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  </Document>
);

// Main Component
const MonthlyReportGenerator = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/admin/report");
        setReportData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const openPdfInNewTab = async () => {
    if (!reportData) {
      alert("Report data is not yet loaded");
      return;
    }

    try {
      const blob = await pdf(<MonthlyReportPDF data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF");
    }
  };

  if (loading) return <div>Loading report data...</div>;
  if (error) return <div>Error fetching report data: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Comprehensive Monthly Platform Report Generator
      </h1>
      <button
        onClick={openPdfInNewTab}
        className="btn btn-primary"
      >
        Open PDF in New Tab
      </button>
    </div>
  );
};

export default MonthlyReportGenerator;
