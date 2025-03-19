import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import { formatDistanceToNow } from "date-fns";
import {
  fetchNotifications,
  markAllRead,
  addNotification,
  selectNotifications,
  selectUnreadCount,
  markNotificationAsRead,
} from "../../../redux/notif/notificationSlice";

// Updated notification routes configuration including purchase-related routes
const notificationRoutes = {
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
      : "/profile/transactions/owner/to hand over",
  return_confirmed: (isOwner) =>
    isOwner
      ? "/profile/transactions/owner/to receive"
      : "/profile/transactions/renter/to receive",
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
  default: "/profile/transactions/owner/requests",
};

const determineRoute = (rental, type, isOwner, isRenter, notification) => {
  if (
    !rental &&
    ![
      "listing_status",
      "post_status",
      "new-listing",
      "new-post",
      "listing_reviewed",
    ].includes(type)
  ) {
    console.warn("No rental data available for routing");
    return notificationRoutes.default;
  }

  const route = notificationRoutes[type];

  if (typeof route === "function") {
    if (type === "new-listing" || type === "new-post") {
      return route(notification);
    } else if (type === "handover_confirmed") {
      return route(isRenter);
    } else if (
      type === "return_confirmed" ||
      type === "rental_completed" ||
      type === "purchase_completed"
    ) {
      return route(isOwner);
    }

    return route(isOwner, isRenter, notification);
  }

  return route || notificationRoutes.default;
};

const NotificationMessage = ({ message, type }) => {
  const getFormattedMessage = () => {
    switch (type) {
      case "rental_accepted": {
        const match = message.match(
          /(.*?)\shas accepted your rental request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">accepted</span> your rental
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="success-text">{message}</span>;
      }
      case "rental_declined": {
        const match = message.match(
          /(.*?)\shas declined your rental request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">declined</span> your rental
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "rental_cancelled": {
        const match = message.match(
          /(.*?)\shas cancelled the rental request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">cancelled</span> the rental
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "handover_confirmed": {
        const match = message.match(
          /(.*?)\shas confirmed (?:handover|receipt) of\s(.*?)\.\s?(.*)/
        );
        if (match) {
          const [, sender, item, action] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">confirmed</span>{" "}
                {action ? "handover of" : "receipt of"}
              </span>
              <br />
              <span className="item-name">{item}</span>
              {action && (
                <>
                  <br />
                  <span className="action-text">{action}</span>
                </>
              )}
            </>
          );
        }
        return (
          <>
            <span className="highlight-text">{message}</span>
            <br />
            <span className="action-text">Tap to confirm.</span>
          </>
        );
      }
      case "return_confirmed": {
        const match = message.match(
          /(.*?)\shas confirmed (?:receiving|return of)\s(.*?)\.\s(.*)/
        );
        if (match) {
          const [, sender, item, action] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">confirmed</span> return of
              </span>
              <br />
              <span className="item-name">{item}</span>
              <br />
              <span className="action-text">{action}</span>
            </>
          );
        }
        return (
          <>
            <span className="highlight-text">{message}</span>
            <br />
            <span className="action-text">Tap to confirm.</span>
          </>
        );
      }
      case "rental_completed": {
        const match = message.match(
          /Rental transaction with\s(.*?)\shas been completed/
        );
        if (match) {
          const [, sender] = match;
          return (
            <>
              <span className="font-large success-text">
                Rental Transaction Complete
              </span>
              <span className="default-text"> with</span>
              <br />
              <span className="item-name">{sender}</span>
            </>
          );
        }
        break;
      }
      case "rental_request": {
        const match = message.match(/(.*?)\swants to rent\s(.*)/);
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">wants to rent</span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return message;
      }
      case "purchase_request": {
        const match = message.match(/(.*?)\swants to buy\s(.*)/);
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">wants to buy</span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return message;
      }
      case "purchase_accepted": {
        const match = message.match(
          /(.*?)\shas accepted your purchase request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">accepted</span> your purchase
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="success-text">{message}</span>;
      }
      case "purchase_receipt_confirmed": {
        const match = message.match(
          /(.*?)\shas confirmed receipt of purchased item:\s(.*)/
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">confirmed</span> receipt of
                purchased item:
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return (
          <>
            <span className="highlight-text">{message}</span>
            <br />
            <span className="action-text">Tap to confirm.</span>
          </>
        );
      }
      case "purchase_declined": {
        const match = message.match(
          /(.*?)\shas declined your purchase request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">declined</span> your purchase
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "purchase_cancelled": {
        const match = message.match(
          /(.*?)\shas cancelled the purchase request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">cancelled</span> the purchase
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "purchase_completed": {
        // Check for buyer's message format
        let match = message.match(
          /Purchase of\s(.*?)\sfrom\s(.*?)\shas been completed/
        );

        if (!match) {
          // Check for seller's message format
          match = message.match(
            /Sale of\s(.*?)\sto\s(.*?)\shas been completed/
          );
        }

        if (match) {
          const [, item, sender] = match;
          return (
            <>
              <span className="font-large success-text">
                Purchase Transaction Complete
              </span>
              <br />
              <span className="default-text">with {sender}</span>
            </>
          );
        }
        return message; // Fallback to showing the raw message
      }
      case "listing_status": {
        return (
          <>
            <span className="font-medium success-text">{message}</span>
            <br />
            <span className="default-text">
              It's now live and visible to all.
            </span>
          </>
        );
      }
      case "item_status": {
        if (message.includes("approved")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                It's now live and visible to all.
              </span>
            </>
          );
        }
      }
      case "new-item-for-sale": {
        return (
          <>
            <span className="font-large">New Item Available</span>
            <br />
            <span className="item-name">{message}</span>
          </>
        );
      }
      case "post_status": {
        if (message.includes("approved")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                It's now live and visible to all.
              </span>
            </>
          );
        } else if (
          message.includes("declined") ||
          message.includes("removed") ||
          message.includes("flagged")
        ) {
          return (
            <>
              <span className="font-medium error-text">{message}</span>
              <br />
              <span className="default-text">
                Check your post status for details.
              </span>
            </>
          );
        } else if (message.includes("reinstated")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                Your post is now available again.
              </span>
            </>
          );
        }
        return (
          <>
            <span className="font-medium">{message}</span>
            <br />
            <span className="default-text">
              Check your post status for details.
            </span>
          </>
        );
      }
      // New case for report-related notifications:
      case "rental_report":
      case "report_response": {
        return (
          <>
            <span className="font-large">Report Notification</span>
            <br />
            <span className="default-text">{message}</span>
          </>
        );
      }
      case "new-listing": {
        return (
          <>
            <span className="font-large">New Listing Available</span>
            <br />
            <span className="item-name">{message}</span>
          </>
        );
      }
      case "new-post": {
        return (
          <>
            <span className="font-large">New Post Looking for:</span>
            <br />
            <span className="item-name">{message}</span>
            <br />
            <span className="action-text">Click to offer an item.</span>
          </>
        );
      }
      default:
        return message;
    }
  };

  return <div className="notification-message">{getFormattedMessage()}</div>;
};

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

  useEffect(() => {
    if (!studentUser?.userId) return;

    const fetchAndSubscribe = async () => {
      try {
        await dispatch(fetchNotifications(studentUser.userId)).unwrap();
        // Register the user with the socket
        const userIdStr = studentUser.userId.toString();
        socket.emit("registerUser", userIdStr);

        const handler = (notification) => {
          // For new listing or post, show a temporary pop-up alert
          if (
            notification.type === "new-listing" ||
            notification.type === "new-post"
          ) {
            setTempAlert(
              `New ${
                notification.type === "new-listing" ? "listing" : "post"
              } "${notification.message}" available!`
            );
            setTimeout(() => setTempAlert(null), 5000);
          }
          dispatch(addNotification(notification));
        };
        socket.on("receiveNotification", handler);

        return () => socket.off("receiveNotification", handler);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    fetchAndSubscribe();
  }, [socket, studentUser, dispatch]);

  const handleNotificationClick = useCallback(
    async (notif) => {
      try {
        // Mark the notification as read
        await dispatch(markNotificationAsRead(notif.id)).unwrap();

        // Handle listing_status notifications
        if (notif.type === "listing_status") {
          toggleNotifications();
          navigate(notificationRoutes.listing_status);
          return;
        }

        // Handle post_status notifications
        if (notif.type === "post_status") {
          toggleNotifications();
          // Check if post_id exists before navigating
          if (notif.post_id) {
            navigate(`/post/${notif.post_id}`);
          } else {
            // Fall back to the default route if post_id isn't available
            navigate(notificationRoutes.post_status);
          }
          return;
        }

        // Handle new_listing notifications
        if (notif.type === "new-listing") {
          toggleNotifications();
          navigate(`/rent/${notif.listing_id}`);
          return;
        }

        // Handle new_post notifications
        if (notif.type === "new-post") {
          toggleNotifications();
          navigate(`/post/${notif.post_id}`);
          return;
        }

        if (notif.type === "item_status") {
          toggleNotifications();
          navigate(notificationRoutes.item_status);
          return;
        }

        if (notif.type === "new-item-for-sale") {
          toggleNotifications();
          navigate(`/buy/${notif.item_for_sale_id}`);
          return;
        }

        // Handle listing_reviewed notifications
        if (notif.type === "listing_reviewed") {
          toggleNotifications();
          navigate(notificationRoutes.listing_reviewed);
          return;
        }

        // Handle report-related notifications
        if (
          notif.type === "transaction_report" ||
          notif.type === "transaction_report_response" ||
          notif.type === "report_resolved" ||
          notif.type === "report_escalated"
        ) {
          toggleNotifications();
          navigate(`/reports/${notif.transaction_report_id}`, {
            state: { notificationType: notif.type },
          });
          return;
        }

        // Handle direct purchase notification types (without rental_id)
        if (notif.type === "purchase_accepted" && !notif.rental_id) {
          toggleNotifications();
          navigate(notificationRoutes.purchase_accepted);
          return;
        }

        if (notif.type === "purchase_declined" && !notif.rental_id) {
          toggleNotifications();
          navigate(notificationRoutes.purchase_declined);
          return;
        }

        if (notif.type === "purchase_cancelled" && !notif.rental_id) {
          toggleNotifications();
          navigate(notificationRoutes.purchase_cancelled);
          return;
        }

        if (notif.type === "purchase_request" && !notif.rental_id) {
          toggleNotifications();
          navigate(notificationRoutes.purchase_request);
          return;
        }

        // Handle rental- and purchase-related notifications with rental_id
        if (notif.rental_id) {
          const rentalRes = await axios.get(
            `http://localhost:3001/rental-transaction/${notif.rental_id}`
          );
          const rental = rentalRes.data.rental;
          if (!rental) {
            console.error("❌ No rental data received");
            return;
          }

          const isOwner = studentUser.userId === rental.owner_id;
          const isRenter = studentUser.userId === rental.renter_id;

          // Handle purchase-related notifications
          if (notif.type === "purchase_accepted") {
            toggleNotifications();
            navigate(notificationRoutes.purchase_accepted, {
              state: { notificationType: notif.type, highlight: rental.id },
            });
            return;
          }

          if (notif.type === "purchase_declined") {
            toggleNotifications();
            navigate(notificationRoutes.purchase_declined, {
              state: { notificationType: notif.type, highlight: rental.id },
            });
            return;
          }

          if (notif.type === "purchase_cancelled") {
            toggleNotifications();
            navigate(notificationRoutes.purchase_cancelled, {
              state: { notificationType: notif.type, highlight: rental.id },
            });
            return;
          }

          if (notif.type === "purchase_request") {
            toggleNotifications();
            navigate(notificationRoutes.purchase_request, {
              state: { notificationType: notif.type, highlight: rental.id },
            });
            return;
          }

          // Handle rental-related notifications
          const route = determineRoute(
            rental,
            notif.type,
            isOwner,
            isRenter,
            notif
          );

          toggleNotifications();
          navigate(route, {
            state: { notificationType: notif.type, highlight: rental.id },
          });
          return;
        }
      } catch (error) {
        console.error("Error handling notification:", error);
      }
    },
    [dispatch, navigate, studentUser, toggleNotifications]
  );

  const renderedNotifications = useMemo(() => {
    return notifications.length > 0 ? (
      notifications.map((notif) => (
        <a
          href="#"
          key={notif.id}
          className={`notification-item ${notif.is_read ? "read" : "unread"}`}
          onClick={(e) => {
            e.preventDefault();
            handleNotificationClick(notif);
          }}
        >
          <img
            src={UserIcon}
            className="notification-avatar"
            alt="User Avatar"
          />
          <div className="notification-content">
            <p>
              <NotificationMessage message={notif.message} type={notif.type} />
            </p>
            <span className="time">
              {notif.createdAt &&
                formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                })}
            </span>
          </div>
        </a>
      ))
    ) : (
      <p>No new notifications</p>
    );
  }, [notifications, handleNotificationClick]);

  const handleMarkAllAsRead = () => {
    if (studentUser?.userId) {
      dispatch(markAllRead(studentUser.userId.toString()));
    }
  };

  return (
    <div className="notification-container" id="notif-popup">
      <a
        className={`icon-link ${isDarkTheme ? "dark" : "light"}`}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleNotifications();
        }}
        data-count={unreadCount}
      >
        <img src={icon || Bell} alt="Notification Icon" />
      </a>
      {tempAlert && <div className="temp-alert">{tempAlert}</div>}
      {showNotifications && (
        <div className={`notifications-user ${isDarkTheme ? "dark-mode" : ""}`}>
          <div className="notifications-header">
            <h5>Notifications</h5>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
            <button className="close-btn" onClick={toggleNotifications}>
              ×
            </button>
          </div>
          <div className="notification-list" key={notifications.length}>
            {renderedNotifications}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
