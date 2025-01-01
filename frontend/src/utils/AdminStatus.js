export const ItemStatus = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pending", className: "bg-warning text-dark" };
      case "approved":
        return { label: "Approved", className: "bg-success text-white" };
      case "declined":
        return { label: "Declined", className: "bg-danger text-white" };
      case "removed":
        return { label: "Removed", className: "bg-secondary text-white" };
      case "revoked":
        return { label: "Revoked", className: "bg-info text-white" };
      case "flagged":
        return { label: "Flagged", className: "bg-primary text-white" };
      default:
        return { label: "Unknown", className: "bg-light text-dark" };
    }
  };