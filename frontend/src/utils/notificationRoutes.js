export const notificationRoutes = {
  student_status: "/profile/dashboard",
  listing_status: (notification) => `/rent/${notification.listing_id}`,
  post_status: "/profile/my-posts",
  "new-listing": (notification) => `/rent/${notification.listing_id}`,
  "new-post": (notification) => `/posts/${notification.post_id}`,
  item_status: "/profile/my-for-sale",
  "new-item-for-sale": (notification) => `/shop/${notification.item_id}`,
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
  user_followed: (notification) => `/user/${notification.sender_id}`,
  default: "/profile/transactions/owner/requests", // Default fallback route
};

export const determineRoute = (
  rental,
  type,
  isOwner,
  isRenter,
  notification
) => {
  // For debugging
  // console.log("Determining route for:", {
  //   type,
  //   notification,
  //   sender_id: notification?.sender_id,
  // });

  // Special case for user_followed - handle it directly
  if (type === "user_followed" && notification && notification.sender_id) {
    // console.log(
    //   "User followed route determined:",
    //   `/user/${notification.sender_id}`
    // );
    return `/user/${notification.sender_id}`;
  }

  if (type === "student_status") {
    return "/profile";
  }

  if (type === "listing_status" && notification && notification.listing_id) {
    return `/rent/${notification.listing_id}`;
  }

  // Define special notification types that don't require rental data
  const specialTypes = [
    "listing_status",
    "post_status",
    "new-listing",
    "new-post",
    "item_status",
    "new-item-for-sale",
    "listing_reviewed",
    "purchase_accepted",
    "purchase_declined",
    "purchase_cancelled",
    "purchase_request",
    "transaction_report",
    "transaction_report_response",
    "report_resolved",
    "report_escalated",
    "admin_report_update",
    "user_followed",
  ];

  // Handle cases where rental data isn't required
  if (!rental && !specialTypes.includes(type)) {
    console.warn(
      `No rental data available for routing type: ${type}, using default.`
    );

    // Attempt to handle routes directly if possible
    const directRoute = notificationRoutes[type];

    if (typeof directRoute === "string") {
      return directRoute;
    }

    return notificationRoutes.default;
  }

  // Get the route handler
  const route = notificationRoutes[type];

  // If no route handler exists for this type
  if (!route) {
    console.warn(`No route handler for notification type: ${type}`);
    return notificationRoutes.default;
  }

  // If route is a function, call it with appropriate parameters
  if (typeof route === "function") {
    if (
      type === "new-listing" ||
      type === "new-post" ||
      type === "new-item-for-sale" ||
      type === "listing_status" ||
      type === "user_followed"
    ) {
      return route(notification);
    } else if (type === "handover_confirmed") {
      return route(isRenter);
    } else if (
      type === "return_confirmed" ||
      type === "rental_completed" ||
      type === "purchase_completed" ||
      type === "purchase_receipt_confirmed"
    ) {
      return route(isOwner);
    }

    // For any other function route
    return route(isOwner, isRenter, notification);
  }

  // If route is a string, return it directly
  return route;
};
