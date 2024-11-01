export const ItemStatus = (status) => {
    switch (status) {
      case "approved":
        return { label: "Approved", className: "bg-success text-white" };
      case "declined":
        return { label: "Declined", className: "bg-secondary text-white" };
      case "revoked":
        return { label: "Removal Revoked", className: "bg-info text-white" };
      case "pending":
        return { label: "Pending", className: "bg-muted text-dark" };
      case "removed":
        return { label: "Removed", className: "bg-danger text-white" };
      default:
        return { label: "Unknown", className: "bg-light text-dark" };
    }
  };
  