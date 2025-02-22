export const ItemStatus = (status) => {
  switch (status) {
    case "approved":
      return { label: "Approved", className: "bg-success text-white" };
    case "declined":
      return { label: "Declined", className: "bg-warning text-dark" };
    case "revoked":
      return { label: "Removal Revoked", className: "bg-info text-white" };
    case "pending":
      return { label: "Pending", className: "bg-warning text-white" };
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
    case "approved":
      return { label: "Approved", className: "bg-success text-white" };
    case "banned":
      return { label: "Banned", className: "bg-warning text-dark" };
    case "pending":
      return { label: "Pending", className: "bg-warning text-white" };
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
    case "reviewed":
      return { label: "Reviewed", className: "bg-success text-white" };
    case "dismissed":
      return { label: "Dismissed", className: "bg-secondary text-white" };
      case "resolved":
        return { label: "Resolved", className: "bg-primary text-white" };
    default:
      return { label: "Unknown", className: "bg-light text-dark" };
  }
};