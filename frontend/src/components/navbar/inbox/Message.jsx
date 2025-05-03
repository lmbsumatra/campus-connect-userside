import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import MessageIcon from "../../../assets/images/icons/message.svg";
import UserIcon from "../../../assets/images/icons/user-icon.svg";
import "./style.css";
import { io } from "socket.io-client";
import { useChat } from "../../../context/ChatContext";
import { formatDistanceToNow } from "date-fns";
import useSound from "use-sound";
import notificationSound from "../../../assets/audio/message.mp3";
import { baseApi } from "../../../utils/consonants";
import { decryptMessage } from "../../../utils/messageEncryption";

const Message = ({ icon, isDarkTheme, showDropdown, toggleDropdown }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Add badge count state
  const { studentUser } = useAuth();
  const { userId } = studentUser || {};
  const { setActiveChat } = useChat();
  const navigate = useNavigate();
  const socket = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [receiveNotification] = useSound(notificationSound, { volume: 0.5 });

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socket.current = io(
      process.env.REACT_APP_SOCKET_URL || `${baseApi}`
    );

    socket.current.on("connect", () => {
      socket.current.emit("registerUser", userId);
    });

    // Listen for badge count updates
    socket.current.on("updateBadgeCount", (count) => {
      // console.log("Received badge count update:", count);
      setUnreadCount(count); // Update badge count dynamically
    });

    // Update socket listener to refresh conversations
    socket.current.on("receiveMessage", () => {
      receiveNotification();
      fetchConversations();
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId]);

  // Fetch notifications when dropdown is toggled
  useEffect(() => {
    if (userId && showDropdown) {
      fetchConversations();
    }
  }, [userId, showDropdown]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `${baseApi}/api/conversations/preview/${userId}`
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();

      // Sort conversations based on the latest activity
      const sortedConversations = data.sort((a, b) => {
        const aTimestamp = a.latestMessage
          ? new Date(a.latestMessage.createdAt).getTime()
          : 0;
        const bTimestamp = b.latestMessage
          ? new Date(b.latestMessage.createdAt).getTime()
          : 0;

        if (a.hasUnread && !b.hasUnread) return -1; // Prioritize unread messages
        if (!a.hasUnread && b.hasUnread) return 1;

        if (a.recentlyAccessed && !b.recentlyAccessed) return -1; // Prioritize recently accessed
        if (!a.recentlyAccessed && b.recentlyAccessed) return 1;

        return bTimestamp - aTimestamp; // Default: Latest messages first
      });

      setConversations(sortedConversations);
      setUnreadCount(data.filter((conv) => conv.hasUnread).length);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // Update useEffect to fetch conversations
  useEffect(() => {
    if (userId && showDropdown) fetchConversations();
  }, [userId, showDropdown]);

  // Update click handler
  const handleConversationClick = async (conv) => {
    try {
      // Mark conversation as read
      await fetch(
        `${baseApi}/api/notifications/message/conversation/${conv.id}/user/${userId}/read`,
        { method: "PUT" }
      );

      // Add a flag to indicate it was recently accessed
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? { ...c, recentlyAccessed: true, hasUnread: false }
            : c
        )
      );

      // Navigate to conversation
      setActiveChat(conv);
      navigate(`/messages/${conv.id}`);
      toggleDropdown();
    } catch (err) {
      console.error("Error handling conversation click:", err);
    }
  };

  // const markMessageAsRead = async (notificationId) => {
  //   try {
  //     await fetch(
  //       `${
  //         process.env.REACT_APP_API_URL || `${baseApi}`
  //       }/api/notifications/message/${notificationId}/read`,
  //       {
  //         method: "PUT",
  //       }
  //     );

  //     // ✅ Instead of re-fetching, update the state to mark the message as read
  //     setNotifications((prev) =>
  //       prev.map((notif) =>
  //         notif.id === notificationId ? { ...notif, is_read: true } : notif
  //       )
  //     );

  //     // Decrease unread count dynamically
  //     setUnreadCount((prev) => Math.max(0, prev - 1));
  //   } catch (err) {
  //     console.error("Error marking notification as read:", err);
  //   }
  // };

  const markAllMessagesAsRead = async () => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/notifications/message/mark-all-read/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark all messages as read: ${response.statusText}`
        );
      }

      // Emit socket event to update badge count
      if (socket.current) {
        socket.current.emit("markMessagesAsRead", {
          userId,
          conversationId: "all",
        });
      }

      fetchConversations();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // const handleNotificationClick = async (notif) => {

  //   if (!notif.conversation_id) {
  //     console.error("Conversation ID is undefined!");
  //     return;
  //   }

  //   try {
  //     await markMessageAsRead(notif.id);

  //     const [conversationRes, messagesRes] = await Promise.all([
  //       fetch(
  //         `${
  //           process.env.REACT_APP_API_URL || `${baseApi}`
  //         }/api/conversations/${notif.conversation_id}`
  //       ),
  //       fetch(
  //         `${
  //           process.env.REACT_APP_API_URL || `${baseApi}`
  //         }/api/messages/${notif.conversation_id}`
  //       ),
  //     ]);

  //     const conversationData = await conversationRes.json();
  //     const messagesData = await messagesRes.json();

  //     const fullConversation = {
  //       ...conversationData,
  //       messages: messagesData,
  //       otherUser: notif.sender,
  //     };

  //     setActiveChat(fullConversation);
  //     toggleDropdown();
  //     navigate(`/messages/${notif.conversation_id}`);
  //   } catch (err) {
  //     console.error("Error handling notification click:", err);
  //   }
  // };
  const renderMessagePreview = (conv) => {
    if (!conv.latestMessage) return "No messages yet";

    if (conv.latestMessage.isProductCard) return "Shared a product";

    const messageText = conv.latestMessage.text || "";
    const isCurrentUserSender = conv.latestMessage.sender === String(userId); // Convert userId to string
    
    // Decrypt the message text for the preview
    const decryptedText = decryptMessage(messageText);

    return isCurrentUserSender ? `You: ${decryptedText}` : decryptedText;
  };
  return (
    <div className="message-menu-container" id="message-popup">
      <a
        className={`icon-wrapper ${isDarkTheme ? "dark" : "light"}`}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          toggleDropdown();
        }}
        data-count={unreadCount} /* Dynamically set the badge count */
      >
        <img
          src={icon || MessageIcon}
          alt="Message Icon"
          className="message-icon"
        />
      </a>

      {showDropdown && (
        <div className="message-menu">
          <div className="triangle"></div>
          <div className="menu-header">
            <h5>Inbox</h5>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read"
                  onClick={markAllMessagesAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--clr-primary)",
                    cursor: "pointer",
                    marginRight: "10px",
                    fontSize: "14px",
                  }}
                >
                  Mark all as read
                </button>
              )}
              <button
                className="close-btn"
                onClick={toggleDropdown}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "0 5px",
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div className="menu-content">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                // console.log("Rendering conversation:", conv); // Debugging log
                return (
                  <div
                    key={conv.id}
                    className={`message-item ${
                      conv.hasUnread ? "unread" : "read"
                    }`}
                    onClick={() => handleConversationClick(conv)}
                  >
                    <img src={UserIcon} alt="User" className="message-img" />
                    <div className="message-info">
                      <h6>{`${conv.otherUser.first_name} ${conv.otherUser.last_name}`}</h6>
                      <p>{renderMessagePreview(conv)}</p>
                      <span>
                        {conv.latestMessage &&
                          formatDistanceToNow(
                            new Date(conv.latestMessage.createdAt),
                            { addSuffix: true }
                          )}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p
                className="no-notifications"
                style={{ textAlign: "center", padding: "20px" }}
              >
                No new messages
              </p>
            )}
            {conversations.length > 0 && (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <a
                  href="/messages"
                  style={{
                    color: "var(--clr-primary)",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  View All
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
