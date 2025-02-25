// frontend/src/components/Notification/Notification.jsx
import React, { useEffect, useMemo } from "react";
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

      case "listing_status": {
        return (
          <>
            <br />
            <span className="item-name">{message}</span>
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

  useEffect(() => {
    if (!studentUser?.userId) return;

    const fetchAndSubscribe = async () => {
      try {
        await dispatch(fetchNotifications(studentUser.userId)).unwrap();
        // Register the user with the socket
        const userIdStr = studentUser.userId.toString();
        socket.emit("registerUser", userIdStr);

        const handler = (notification) => {
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

  const determineRoute = (rental, type, isOwner, isRenter) => {
    const baseRoute = "/profile/transactions";

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
      case "listing_status":
        return `${baseRoute}/profile/my-listings`;
      default:
        return `${baseRoute}/owner/requests`;
    }
  };

  const handleNotificationClick = async (
    notifId,
    type,
    rentalId,
    listingId
  ) => {
    try {
      await dispatch(markNotificationAsRead(notifId)).unwrap();

      if (type === "listing_status") {
        toggleNotifications();
        navigate(`/profile/my-listings`, { state: { highlight: listingId } });
        return;
      }

      // Existing rental handling logic...
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
      const route = determineRoute(rental, type, isOwner, isRenter);

      toggleNotifications();
      navigate(route, {
        state: { notificationType: type, highlight: rentalId },
      });
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const handleMarkAllAsRead = () => {
    if (studentUser?.userId) {
      dispatch(markAllRead(studentUser.userId.toString()));
    }
  };

  const memoizedNotifications = useMemo(
    () => notifications,
    [notifications.length, unreadCount, notifications]
  );

  const renderedNotifications = useMemo(() => {
    return memoizedNotifications.length > 0 ? (
      memoizedNotifications.map((notif) => (
        <a
          href="#"
          key={notif.id}
          className={`notification-item ${notif.is_read ? "read" : "unread"}`}
          onClick={(e) => {
            e.preventDefault();
            handleNotificationClick(
              notif.id,
              notif.type,
              notif.rental_id,
              notif.listing_id
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
              <NotificationMessage message={notif.message} type={notif.type} />
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
    );
  }, [memoizedNotifications, handleNotificationClick]);

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
