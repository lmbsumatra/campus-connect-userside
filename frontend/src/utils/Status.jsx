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
      default:
        return { label: "Unknown", className: "bg-light text-dark" };
    }
  };
  