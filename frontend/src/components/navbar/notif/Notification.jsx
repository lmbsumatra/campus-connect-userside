import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bell from "../../../assets/images/icons/notif.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";
import { formatDistanceToNow } from "date-fns";

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

      case "transaction_completed": {
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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const studentUser = useSelector(selectStudentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !studentUser?.userId) return;

    socket.emit("registerUser", studentUser.userId);
    console.log(`✅ Registered user ${studentUser.userId} to socket`);

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/notifications/student/${studentUser.userId}`
        );
        setNotifications(res.data);
        const unread = res.data.filter((notif) => !notif.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const handleReceiveNotification = (newNotification) => {
      console.log("📩 Real-time notification received:", newNotification);
      setNotifications((prev) => {
        const exists = prev.some((notif) => notif.id === newNotification.id);
        return exists ? prev : [newNotification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("receiveNotification", handleReceiveNotification);

    return () => {
      socket.off("receiveNotification", handleReceiveNotification);
    };
  }, [socket, studentUser]);

  const determineRoute = (rental, type, isOwner, isRenter) => {
    const baseRoute = "/profile/transactions";

    // Early return for missing rental
    if (!rental) {
      console.warn("No rental data available for routing");
      return `${baseRoute}/owner/requests`;
    }

    switch (type) {
      case "rental_request":
        return `${baseRoute}/owner/requests`;
      case "rental_accepted":
        return `${baseRoute}/renter/to receive`;
      case "rental_declined":
        return `${baseRoute}/renter/cancelled`;
      case "rental_cancelled":
        return `${baseRoute}/owner/cancelled`;
      case "handover_confirmed":
        return isRenter
          ? `${baseRoute}/renter/to return`
          : `${baseRoute}/owner/to hand over`;
      case "return_confirmed":
        return isOwner
          ? `${baseRoute}/owner/to receive`
          : `${baseRoute}/renter/completed`;
      case "transaction_completed":
        return isOwner
          ? `${baseRoute}/owner/to review`
          : `${baseRoute}/renter/to review`;
      default:
        return `${baseRoute}/owner/requests`;
    }
  };

  const handleNotificationClick = async (notifId, rentalId, type) => {
    console.log("🔔 Notification Clicked!", { notifId, rentalId, type });

    if (!rentalId) {
      console.error("❌ Missing rental ID");
      return;
    }

    try {
      // Mark notification as read
      await axios.put(
        `http://localhost:3001/api/notifications/student/${notifId}/read`
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notifId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Fetch rental details
      const rentalRes = await axios.get(
        `http://localhost:3001/rental-transaction/${rentalId}`
      );

      const rental = rentalRes.data.rental;
      if (!rental) {
        console.error("❌ No rental data received");
        return;
      }

      const isOwner = studentUser.userId === rental.owner_id;
      const isRenter = studentUser.userId === rental.renter_id;

      // Determine the route
      const route = determineRoute(rental, type, isOwner, isRenter);
      console.log("🚀 Navigating to:", route);

      // Close notifications panel before navigation
      toggleNotifications();

      // Navigate with rental ID in state
      navigate(route, { state: { highlight: rentalId } });
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/notifications/student/mark-all-read/${studentUser.userId}`
      );
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="notification-container">
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
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <a
                  href="#"
                  key={notif.id}
                  className={`notification-item ${
                    notif.is_read ? "read" : "unread"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNotificationClick(
                      notif.id,
                      notif.rental_id,
                      notif.type
                    );
                  }}
                >
                  <img
                    src={UserIcon}
                    className="notification-avatar"
                    alt="User Avatar"
                  />
                  <div className="notification-content">
                    <p>
                      <NotificationMessage
                        message={notif.message}
                        type={notif.type}
                      />
                    </p>
                    <span className="time">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
