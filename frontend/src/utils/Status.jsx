export const ItemStatus = (status) => {
  switch (status) {
    case "approved":
      return { label: "Approved", className: "bg-success text-white" };
    case "declined":
      return { label: "Declined", className: "bg-warning text-dark" };
    case "revoked":
      return { label: "Removal Revoked", className: "bg-info text-white" };
    case "pending":
      return { label: "Pending", className: "bg-warning text-white" }; // Changed from text-dark
    case "removed":
      return { label: "Removed", className: "bg-danger text-white" };
    case "flagged":
      return { label: "Flagged", className: "bg-primary text-white" };
    default:
      return { label: "Unknown", className: "bg-light text-dark" };
  }
};

export const StudentStatus = (status) => {
  switch (status) {
    case "verified":
      return { label: "Verified", className: "bg-success text-white" }; // Changed label case
    case "banned":
      return { label: "Banned", className: "bg-danger text-white" }; // Changed class to danger
    case "pending":
      return { label: "Pending", className: "bg-warning text-dark" }; // Changed text color
    case "flagged":
      return { label: "Flagged", className: "bg-primary text-white" };
    default:
      return { label: "Unknown", className: "bg-light text-dark" };
  }
};

export const TransactionStatus = (status) => {
  switch (status) {
    case "Requested":
      return { label: "Requested", className: "bg-warning text-dark" };
    case "Accepted":
      return { label: "Accepted", className: "bg-success text-white" };
    case "Declined":
      return { label: "Declined", className: "bg-danger text-white" };
    case "Cancelled":
      return { label: "Cancelled", className: "bg-secondary text-white" };
    case "HandedOver":
      return { label: "HandedOver", className: "bg-info text-white" };
    case "Returned":
      return { label: "Returned", className: "bg-success text-white" };
    case "Completed":
      return { label: "Completed", className: "bg-primary text-white" };
    case "HandOver": // For BuyAndSellTransaction
      return { label: "HandOver", className: "bg-info text-white" };
    case "Review": // For BuyAndSellTransaction
      return { label: "Review", className: "bg-primary text-white" };
    default:
      return { label: "Unknown", className: "bg-light text-dark" };
  }
};

export const ReportStatus = (status) => {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-warning text-dark" };
    case "under_review": // Added missing status
      return { label: "Under Review", className: "bg-info text-white" };
    case "dismissed":
      return { label: "Dismissed", className: "bg-secondary text-white" };
    case "resolved":
      return { label: "Resolved", className: "bg-success text-white" }; // Changed class to success
    default:
      return { label: "Unknown", className: "bg-light text-dark" };
  }
};

// Status function for Transaction Reports
export const TransactionReportStatus = (status) => {
  const lowerStatus = status?.toLowerCase();

  switch (lowerStatus) {
    // Student-centric statuses
    case "open":
      return { label: "Open", className: "bg-warning text-dark" };
    case "under_review": // After first response
      return { label: "Under Review", className: "bg-info text-white" };
    case "resolved": // Resolved by reporter
      return { label: "Resolved", className: "bg-success text-white" };
    case "escalated": // Escalated to admin
      return { label: "Escalated", className: "bg-danger text-white" };

    // Admin-centric statuses
    case "admin_review":
      return { label: "Admin Review", className: "bg-primary text-white" };
    case "admin_resolved":
      return { label: "Admin Resolved", className: "bg-dark text-white" };
    case "admin_dismissed":
      return { label: "Admin Dismissed", className: "bg-secondary text-white" };

    default:
      return { label: status || "Unknown", className: "bg-light text-dark" };
  }
};
