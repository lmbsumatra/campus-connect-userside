export const notificationRoutes = {
  listing_status: "/profile/my-listings",
  post_status: "/profile/my-posts",
  "new-listing": (notification) => `/rent/${notification.listing_id}`,
  "new-post": (notification) => `/posts/${notification.post_id}`,
  item_status: "/profile/my-for-sale",
  "new-item-for-sale": (notification) =>
    `/buy/${notification.item_for_sale_id}`,
  listing_reviewed: "/profile/reviews",
  rental_request: "/profile/transactions/owner/requests",
  rental_accepted: "/profile/transactions/renter/to receive",
  rental_declined: "/profile/transactions/renter/cancelled",
  rental_cancelled: "/profile/transactions/owner/cancelled",
  handover_confirmed: (isRenter) =>
    isRenter
      ? "/profile/transactions/renter/to return"
      : "/profile/transactions/owner/to receive",
  return_confirmed: (isOwner) =>
    isOwner
      ? "/profile/transactions/owner/completed"
      : "/profile/transactions/renter/to complete",
  rental_completed: (isOwner) =>
    isOwner
      ? "/profile/transactions/owner/to review"
      : "/profile/transactions/renter/to review",
  purchase_completed: (isOwner) =>
    isOwner
      ? "/profile/transactions/owner/to review"
      : "/profile/transactions/buyer/to review",
  purchase_receipt_confirmed: (isOwner) =>
    isOwner
      ? "/profile/transactions/owner/completed"
      : "/profile/transactions/buyer/to receive",
  purchase_request: "/profile/transactions/owner/requests",
  purchase_accepted: "/profile/transactions/buyer/to receive",
  purchase_declined: "/profile/transactions/buyer/cancelled",
  purchase_cancelled: "/profile/transactions/owner/cancelled",
  default: "/profile/transactions/owner/requests", // Default fallback route
};

export const determineRoute = (
  rental,
  type,
  isOwner,
  isRenter,
  notification
) => {
  if (
    !rental &&
    ![
      "listing_status",
      "post_status",
      "new-listing",
      "new-post",
      "item_status", // Added item_status here as it doesn't need rental
      "new-item-for-sale", // Added new-item-for-sale here
      "listing_reviewed",
      "purchase_accepted", // Added direct purchase routes
      "purchase_declined",
      "purchase_cancelled",
      "purchase_request",
      // Report routes also don't strictly need rental data for the route itself
      "transaction_report",
      "transaction_report_response",
      "report_resolved",
      "report_escalated",
      "admin_report_update",
    ].includes(type)
  ) {
    console.warn(
      `No rental data available for routing type: ${type}, using default.`
    );
    // Attempt to handle non-rental routes directly if possible
    const directRoute = notificationRoutes[type];
    if (typeof directRoute === "string") return directRoute;
    if (
      typeof directRoute === "function" &&
      (type === "new-listing" ||
        type === "new-post" ||
        type === "new-item-for-sale")
    ) {
      return directRoute(notification);
    }
    // Fallback if no direct route or rental data
    return notificationRoutes.default;
  }

  const route = notificationRoutes[type];

  if (typeof route === "function") {
    if (
      type === "new-listing" ||
      type === "new-post" ||
      type === "new-item-for-sale"
    ) {
      return route(notification);
    } else if (type === "handover_confirmed") {
      return route(isRenter);
    } else if (
      type === "return_confirmed" ||
      type === "rental_completed" ||
      type === "purchase_completed" ||
      type === "purchase_receipt_confirmed" // Added purchase receipt confirm
    ) {
      return route(isOwner);
    }
    // Default function case (might need adjustment based on specific functions)
    // This assumes other function routes might need isOwner/isRenter/notification
    // Ensure functions in notificationRoutes are defined to handle these parameters if needed
    return route(isOwner, isRenter, notification);
  }

  return route || notificationRoutes.default;
};
