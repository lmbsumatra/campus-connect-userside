import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../../../assets/images/icons/notif.svg";
import "./style.css";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import {
  fetchNotifications,
  markAllRead,
  addNotification,
  selectNotifications,
  selectUnreadCount,
  markNotificationAsRead,
} from "../../../redux/notif/notificationSlice";
import { fetchRentalTransactions } from "../../../redux/transactions/rentalTransactionsSlice";
import { baseApi } from "../../../utils/consonants";
import {
  determineRoute,
  notificationRoutes,
} from "../../../utils/notificationRoutes";
import NotificationItem from "./NotificationItem";

const Notification = ({
  icon,
  isDarkTheme,
  showNotifications,
  toggleNotifications,
}) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const studentUser = useSelector(selectStudentUser);
  const { notifications, unreadCount } = useSelector((state) => ({
    notifications: selectNotifications(state),
    unreadCount: selectUnreadCount(state),
  }));
  const navigate = useNavigate();
  const [tempAlert, setTempAlert] = useState(null);

  // Effect for fetching initial data and setting up socket listeners
  useEffect(() => {
    if (!studentUser?.userId || !socket) return;

    const fetchAndSubscribe = async () => {
      try {
        await dispatch(fetchNotifications(studentUser.userId)).unwrap();

        if (socket) {
          const userIdStr = studentUser.userId.toString();
          socket.emit("registerUser", userIdStr); // Ensure user is registered for notifications

          const handler = (notification) => {
            // Optional: Refetch related data if needed
            if (
              notification.rental_id ||
              notification.type?.includes("rental") ||
              notification.type?.includes("purchase")
            ) {
              dispatch(fetchRentalTransactions(studentUser.userId));
            }

            // Temporary alert for specific types
            if (
              notification.type === "new-listing" ||
              notification.type === "new-post" ||
              notification.type === "new-item-for-sale"
            ) {
              let alertType = "item"; // Default
              if (notification.type === "new-listing") alertType = "listing";
              if (notification.type === "new-post") alertType = "post";

              setTempAlert(
                `New ${alertType} "${notification.message}" available!`
              );
              setTimeout(() => setTempAlert(null), 5000); // Alert disappears after 5 seconds
            }

            dispatch(addNotification(notification)); // Add notification to Redux state
          };

          socket.on("receiveNotification", handler);

          return () => {
            if (socket) {
              // Check if socket still exists on cleanup
              socket.off("receiveNotification", handler);
            }
          };
        }
      } catch (error) {
        console.error("Failed to load notifications or setup socket:", error);
      }
    };

    fetchAndSubscribe();

    // Dependency array includes socket, studentUser, and dispatch
  }, [socket, studentUser, dispatch]);

  // Callback for handling clicks on individual notifications
  const handleNotificationClick = useCallback(
    async (notif) => {
      if (!studentUser?.userId) return; // Guard clause

      try {
        if (!notif.is_read) {
          await dispatch(markNotificationAsRead(notif.id)).unwrap();
        }

        // --- Navigation Logic ---
        let route = null;
        let navigationState = {};

        if (notif.type === "user_followed" && notif.sender_id) {
          route = `/user/${notif.sender_id}`;
          toggleNotifications();
          navigate(route);
          return;
        }

        const nonRentalTypes = [
          "listing_status",
          "post_status",
          "new-listing",
          "new-post",
          "item_status",
          "new-item-for-sale",
          "listing_reviewed",
          "transaction_report",
          "transaction_report_response",
          "report_resolved",
          "report_escalated",
          "admin_report_update",
        ];

        if (nonRentalTypes.includes(notif.type)) {
          if (notif.type === "listing_status") {
            route = notificationRoutes.listing_status(notif);
          } else if (notif.type === "post_status") {
            route = notif.post_id
              ? `/post/${notif.post_id}`
              : notificationRoutes.post_status;
          } else if (notif.type === "new-listing") {
            route = `/rent/${notif.listing_id}`;
          } else if (notif.type === "new-post") {
            route = `/post/${notif.post_id}`;
          } else if (notif.type === "item_status") {
            route = notificationRoutes.item_status;
          } else if (notif.type === "new-item-for-sale") {
            route = `/shop/${notif.item_id}`;
          } else if (notif.type === "listing_reviewed") {
            route = notificationRoutes.listing_reviewed;
          } else if (notif.type.includes("report")) {
            // Handle all report types
            route = `/reports/${notif.transaction_report_id}`;
            navigationState = { notificationType: notif.type };
          }
        } else if (notif.rental_id) {
          // Fetch rental/transaction details for routing determination
          const transactionRes = await axios.get(
            `${baseApi}/rental-transaction/${notif.rental_id}`,
            { headers: { Authorization: `Bearer ${studentUser.token}` } }
          );
          const transaction = transactionRes.data.rental;

          if (!transaction) {
            console.error(
              "❌ No transaction data received for notification:",
              notif.id
            );
            route = notificationRoutes.default; // Fallback route
          } else {
            const isOwner = studentUser.userId === transaction.owner_id;
            // Check transaction_type to differentiate between renter and buyer
            const isRenter =
              transaction.transaction_type === "rent" &&
              studentUser.userId === transaction.renter_id;
            const isBuyer =
              transaction.transaction_type === "sell" &&
              studentUser.userId === transaction.buyer_id;

            // Determine the route using the utility function
            route = determineRoute(
              transaction,
              notif.type,
              isOwner,
              isRenter || isBuyer,
              notif
            ); // Pass isRenter or isBuyer
            navigationState = {
              notificationType: notif.type,
              highlight: transaction.id,
            };
          }
        } else {
          // Handle cases where rental_id might be missing but expected (e.g., older direct purchase notifs)
          // Or fallback if type isn't covered above
          const directRoute = notificationRoutes[notif.type];
          if (typeof directRoute === "string") {
            route = directRoute;
          } else {
            console.warn(
              `Unhandled notification type or missing ID: ${notif.type}, ID: ${notif.id}`
            );
            route = notificationRoutes.default; // Default fallback
          }
        }

        // Close the notification dropdown and navigate
        toggleNotifications();
        if (route) {
          navigate(route, { state: navigationState });
        } else {
          console.error("Could not determine route for notification:", notif);
        }
      } catch (error) {
        console.error("Error handling notification click:", error);
      }
    },
    [dispatch, navigate, studentUser, toggleNotifications]
  );

  // Memoized list of rendered notification items
  const renderedNotifications = useMemo(() => {
    return notifications.length > 0 ? (
      notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notif={notif}
          onClick={handleNotificationClick}
        />
      ))
    ) : (
      <p className="no-notifications-message">No new notifications</p>
    );
  }, [notifications, handleNotificationClick]);

  // Handler for marking all notifications as read
  const handleMarkAllAsRead = () => {
    if (studentUser?.userId && unreadCount > 0) {
      // Only dispatch if there are unread notifications
      dispatch(markAllRead(studentUser.userId.toString()));
    }
  };

  // Main component render
  return (
    <div className="notification-container" id="notif-popup">
      <a
        className={`icon-link ${isDarkTheme ? "dark" : "light"}`}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleNotifications();
        }}
        data-count={unreadCount > 0 ? unreadCount : null}
      >
        <img src={icon || Bell} alt="Notification Icon" />
      </a>
      {/* Temporary alert popup */}
      {tempAlert && <div className="temp-alert">{tempAlert}</div>}

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className={`notifications-user ${isDarkTheme ? "dark-mode" : ""}`}>
          <div className="notifications-header">
            <h5>Notifications</h5>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
            <button
              className="close-btn"
              onClick={toggleNotifications}
              aria-label="Close notifications"
            >
              &times;
            </button>
          </div>
          <div className="notification-list" role="list">
            {" "}
            {renderedNotifications}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
