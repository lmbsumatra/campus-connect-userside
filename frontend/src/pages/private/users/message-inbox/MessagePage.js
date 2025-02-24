import React, { useEffect, useState, useRef } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import { useAuth } from "../../../../context/AuthContext";
import { io } from "socket.io-client";
import { baseApi } from "../../../../App";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useChat } from "../../../../context/ChatContext";
import useSound from "use-sound";
import sendSound from "../../../../assets/audio/sent.mp3";

const MessagePage = () => {
  const { studentUser } = useAuth();
  const { state } = useLocation(); // Get ownerId from navigate state
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [highlightNewMessage, setHighlightNewMessage] = useState(false);
  const chatContentRef = useRef(null);
  const socket = useRef(null);
  const [acceptedOffers, setAcceptedOffers] = useState(new Set());

  const product = state?.product;
  const navigate = useNavigate();

  const [unreadMessages, setUnreadMessages] = useState({});
  const [playSendSound] = useSound(sendSound, { volume: 0.5 });

  const [lastOfferMessage, setLastOfferMessage] = useState(null);

  const { userId } = studentUser || {};
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket.current = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3001"
    );

    socket.current.on("connect", () => {
      console.log("Connected to WebSocket", socket.current.id);
      socket.current.emit("registerUser", userId);
    });

    socket.current.on("receiveMessage", (message) => {
      console.log("Received message:", message);

      // Mark conversation as having unread messages if it's not the active chat
      if (!activeChat || activeChat.id !== message.conversationId) {
        setUnreadMessages((prev) => ({
          ...prev,
          [message.conversationId]: true,
        }));
      }

      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conversation) => {
          if (conversation.id === message.conversationId) {
            // Create a new message object with proper timestamp
            const newMessage = {
              ...message,
              createdAt: new Date().toISOString(), // Ensure proper timestamp format
              updatedAt: new Date().toISOString(),
            };

            return {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              updatedAt: new Date().toISOString(), // Update conversation timestamp
              hasUnread:
                !activeChat || activeChat.id !== message.conversationId,
            };
          }
          return conversation;
        });

        // Sort conversations by most recent message
        return updatedConversations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });

      if (activeChat && message.conversationId === activeChat.id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              ...message,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        }));
        setHighlightNewMessage(true);
        setTimeout(() => setHighlightNewMessage(false), 3000);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userId, activeChat]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;

      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/conversations/${userId}`
        );
        const data = await res.json();

        // Sort conversations by the most recent activity
        const sortedConversations = data.conversations.sort((a, b) => {
          // Get the latest message timestamp for each conversation
          const aLastMessage =
            a.messages && a.messages.length > 0
              ? new Date(a.messages[a.messages.length - 1].createdAt)
              : new Date(a.updatedAt);

          const bLastMessage =
            b.messages && b.messages.length > 0
              ? new Date(b.messages[b.messages.length - 1].createdAt)
              : new Date(b.updatedAt);

          return bLastMessage - aLastMessage;
        });

        setConversations(sortedConversations);

        // Automatically set the conversation with the owner as active
        if (state?.ownerId || state?.sellerId || state?.renterId) {
          const targetConversation = data.conversations.find((conversation) =>
            conversation.members.includes(
              String(state.ownerId || state.sellerId || state.renterId)
            )
          );

          if (targetConversation) {
            setActiveChat(targetConversation || null);
            // If there's a product in state, send it automatically
            if (state?.product) {
              handleSendMessage("", targetConversation.otherUser.user_id);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [studentUser.userId, state?.ownerId, state?.sellerId, state?.renterId]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

    // Add this useEffect to track the last offer message
    useEffect(() => {
      if (activeChat?.messages) {
        // Find the last offer message in the chat
        const lastOffer = [...activeChat.messages]
          .reverse()
          .find(msg => msg.isProductCard && msg.productDetails?.title === "Offer");
        setLastOfferMessage(lastOffer);
      }
    }, [activeChat?.messages]);

  const handleSendMessage = async (message, recipientId) => {
    if (!activeChat) return;

    try {
      // Send product card as a message if it exists
      if (product) {
        const productMessage = {
          sender: userId,
          recipient: recipientId,
          conversationId: activeChat.id,
          text: "",
          isProductCard: true,
          productDetails: {
            name: product.name,
            inquiryPrice: product.title === "Offer" ? null : product.price, // Original item price for inquiries
            offerPrice: product.title === "Offer" ? product.price : null, // Offered price for offers
            image: product.image,
            title: product.title,
            status: product.status, // Include item status
          },
        };
        console.log("Sending product message payload:", productMessage);

        await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/conversations/${activeChat.id}/message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productMessage),
          }
        );

        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, productMessage],
        }));

        // Clear the product after sending it as a card
        navigate("/messages", { replace: true }); // Clear state
      }

      // Send user's message
      if (message.trim()) {
        const messageData = {
          sender: userId,
          text: message,
          conversationId: activeChat.id,
          isProductCard: false, // Regular message
          productDetails: null, // No product details for a regular message
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3001"
          }/api/conversations/${activeChat.id}/message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData),
          }
        );
        const savedMessage = await res.json();

        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, savedMessage],
          updatedAt: new Date().toISOString(),
        }));

        // Update conversations list to reflect new message
        setConversations((prevConversations) => {
          const updated = prevConversations.map((conv) =>
            conv.id === activeChat.id
              ? {
                  ...conv,
                  messages: [...conv.messages, savedMessage],
                  updatedAt: new Date().toISOString(),
                }
              : conv
          );

          // Sort by most recent message
          return updated.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        });

        socket.current.emit("sendMessageToUser", {
          ...messageData,
          recipient: recipientId, // Only needed for socket
        });
        playSendSound();
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleConversationClick = (conversation) => {
    setActiveChat(conversation);

    // Clear unread status for this conversation
    setUnreadMessages((prev) => ({
      ...prev,
      [conversation.id]: false,
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, hasUnread: false } : conv
      )
    );
  };

  const isRecipient = (message) => {
    const otherUserId = activeChat.otherUser.user_id;
    return (
      String(message.sender) === String(otherUserId) &&
      String(userId) !== String(message.sender)
    );
  };

  const handleAcceptOffer = async (message) => {
    try {
      // Add the message ID to accepted offers
      setAcceptedOffers((prev) => new Set([...prev, message.id]));

      // Emit socket event to notify other user
      socket.current.emit("offerAccepted", {
        messageId: message.id,
        conversationId: activeChat.id,
        recipient: message.sender,
      });
    } catch (error) {
      console.error("Error accepting offer:", error);
      // Optionally revert the UI state if the API call fails
      setAcceptedOffers((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(message.id);
        return newSet;
      });
    }
  };

  // Add socket listener for offer acceptance
  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("offerAccepted", (data) => {
      setAcceptedOffers((prev) => new Set([...prev, data.messageId]));
    });

    return () => {
      socket.current.off("offerAccepted");
    };
  }, []);

  

  return (
    <div className="container-content message-page">
      <div className="message-content">
        <div
          className={`inbox ${isMobile && activeChat !== null ? "d-none" : ""}`}
        >
          <h3>Messages</h3>
          {isLoading ? (
            <p>Loading conversations...</p>
          ) : conversations.length > 0 ? (
            conversations.map((chat) => {
              // Get the latest message
              const latestMessage =
                chat.messages && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1]
                  : null;

              // Check if there are unread messages (we'll implement this state later)
              const hasUnreadMessages = chat.hasUnread;

              return (
                <div
                  key={chat.id}
                  className={`inbox-item ${hasUnreadMessages ? "unread" : ""}`}
                  onClick={() => handleConversationClick(chat)}
                >
                  <img src={UserIcon} alt="User Icon" className="user-icon" />
                  <div className="message-info">
                    <h5>{chat.otherUser.first_name}</h5>
                    <p className="preview-message">
                      {latestMessage
                        ? latestMessage.isProductCard
                          ? "Shared a product"
                          : latestMessage.text && latestMessage.text.length > 30
                          ? `${latestMessage.text.substring(0, 30)}...`
                          : latestMessage.text
                        : "No messages yet"}
                    </p>
                  </div>
                  <div className="message-meta">
                    <span className="timestamp">
                      {latestMessage
                        ? new Date(latestMessage.createdAt).toLocaleString()
                        : ""}
                    </span>
                    {hasUnreadMessages && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No conversations available.</p>
          )}
        </div>

        {activeChat && (
          <div className="chat-box">
            <div className="chat-header">
              <button
                className="back-button"
                onClick={() => setActiveChat(null)}
              >
                Back
              </button>
              <h4>{activeChat.otherUser.first_name}</h4>
            </div>

            <div className="chat-content" ref={chatContentRef}>
              {activeChat.messages && activeChat.messages.length > 0 ? (
                activeChat.messages.map((message, index) =>
                  message.isProductCard ? (
                    <div key={index} className="product-card">
                      <h6>
                        {message.productDetails?.title === "Offer"
                          ? "Offer for this item"
                          : "Inquiring about this item"}
                      </h6>
                      <div className="d-flex align-items-start">
                        <img
                          src={message.productDetails?.image}
                          alt={message.productDetails?.name}
                          className="me-3"
                          style={{ width: "60px", height: "60px" }}
                        />
                        <div>
                          <p className="mb-1">
                            <strong>{message.productDetails?.name}</strong>
                          </p>

                           {/* Display price based on whether it's an offer or inquiry */}
                           {message.productDetails?.title === "Offer" ? (
                          <p className="mb-1">
                            Offered Price: ₱{message.productDetails?.offerPrice}
                          </p>
                        ) : (
                          message.productDetails?.inquiryPrice && (
                            <p className="mb-1">
                              Price: ₱{message.productDetails?.inquiryPrice}
                            </p>
                          )
                        )}

                        {/* Show Status (including offer details) */}
                        {message.productDetails?.status ? (
                          <>
                            <div className="d-flex justify-content-between">
                              <p
                                className="mb-0 offer-details"
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {message.productDetails?.status}
                              </p>
                              {/* Show either Accept Offer button or Accepted status */}
                              {isRecipient(message) ? (
                                  acceptedOffers.has(message.id) ? (
                                    <span 
                                      style={{
                                        color: '#4CAF50',
                                        fontWeight: 'bold',
                                        marginLeft: '100px'
                                      }}
                                    >
                                      Offer Accepted
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      style={{
                                        float: "right",
                                        marginLeft: "100px",
                                      }}
                                      className="btn btn-primary mt-2"
                                      onClick={() => handleAcceptOffer(message)}
                                    >
                                      Accept Offer
                                    </button>
                                  )
                                ) : (
                                  acceptedOffers.has(message.id) && (
                                    <span 
                                      style={{
                                        color: '#4CAF50',
                                        fontWeight: 'bold',
                                        marginLeft: '100px'
                                      }}
                                    >
                                      Offer Accepted
                                    </span>
                                  )
                                )}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className={`chat-message ${
                        String(message.sender) === String(userId)
                          ? "sent"
                          : "received"
                      } ${
                        highlightNewMessage &&
                        index === activeChat.messages.length - 1
                          ? "new-message"
                          : ""
                      }`}
                    >
                      <p>{message.text}</p>
                      <span>
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  )
                )
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
    
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(newMessage, activeChat.otherUser.user_id);
                  }
                }}
                placeholder="Type a message..."
              />
              <button
                onClick={(e) =>
                  handleSendMessage(newMessage, activeChat.otherUser.user_id)
                }
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;

// const { activeChat, setActiveChat } = useChat();

// const navigate = useNavigate();
// const { userId } = studentUser || {};
// const { conversationId } = useParams();

// useEffect(() => {
//   if (!userId) return;
//   socket.current = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:3001");
//   socket.current.on("connect", () => {
//     console.log("Connected to WebSocket", socket.current.id);
//     socket.current.emit("registerUser", userId);
//   });
//   socket.current.on("receiveMessage", (message) => {
//     console.log("Received message:", message);
//     setConversations((prevConversations) => {
//       const updatedConversations = prevConversations.map((conversation) => {
//         if (conversation.id === message.conversationId) {
//           return {
//             ...conversation,
//             messages: [...conversation.messages, message],
//             updatedAt: new Date().toISOString(), // Update the timestamp
//           };
//         }
//         return conversation;
//       });
//   // Sort updated conversations by most recent
//   return updatedConversations.sort(
//     (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
//   );
// });
// }, [userId, activeChat]);

// useEffect(() => {
//   loadConversationFromId();
// }, [conversationId, userId, activeChat?.id]);
// useEffect(() => {
//   const fetchConversations = async () => {
//     if (!userId) return;

//     try {
//       const res = await fetch(
//         `${
//           process.env.REACT_APP_API_URL || "http://localhost:3001"
//         }/api/conversations/${userId}`
//         `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/conversations/${userId}`
//       );
//       const data = await res.json();
//       setConversations(data.conversations);

//        // Sort conversations by the most recent activity
//       const sortedConversations = data.conversations.sort(
//         (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
//       );
//       setConversations(sortedConversations);

//         // Automatically set the conversation with the owner as active
//         if (state?.ownerId || state?.sellerId) {
//           const targetConversation = data.conversations.find((conversation) =>
//             conversation.members.includes(String(state.ownerId || state.sellerId))
//           );
//           setActiveChat(targetConversation || null);
//       // If we have a conversationId but no activeChat, set it from the sorted conversations
//       if (conversationId && !activeChat) {
//         const targetConversation = sortedConversations.find(
//           conv => conv.id === conversationId
//         );
//         if (targetConversation) {
//           setActiveChat(targetConversation);
//         }
//       }

//       setIsLoading(false);

//     } catch (err) {
//       console.error("Error fetching conversations:", err);
//     }
//   };

//   fetchConversations();
// }, [studentUser.userId, state?.ownerId, state?.sellerId]);

// const handleSendMessage = async (message, recipientId) => {
//   useEffect(() => {
//     if (chatContentRef.current) {
//       chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
//     }
//   }, [activeChat?.messages]);

//   const handleSendMessage = async (message, recipientId) => {
//     if (!newMessage.trim() || !activeChat) return;

//     const messageData = {
//       sender: userId,
//       recipient: recipientId,
//       recipient: recipientId,
//       text: message,
//       conversationId: activeChat.id,
//       otherUser: { userId: recipientId }
//     };

//     try {
//       // Send message
//       const res = await fetch(`${baseApi}/api/conversations/${activeChat.id}/message`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },

//   @@ -138,14 +151,13 @@ const MessagePage = () => {
//       });
//       const savedMessage = await res.json();

//       // Create notification
//       await fetch(`${baseApi}/api/notifications/message`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "message",
//           title: "New Message",
//           message: message,
//           message: newMessage,
//           timestamp: new Date(),
//           isRead: false,
//           user_id: recipientId,

//   @@ -162,11 +174,13 @@ const MessagePage = () => {
//       socket.current.emit("sendMessageToUser", messageData);
//       setNewMessage("");
//     } catch (err) {
//       console.error("Error:", err);
//       console.error("Error sending message:", err);
//     }
//   };

//     const handleConversationClick = (conversation) => {
//       setActiveChat(conversation);
//       setActiveChat(conversation);
//       navigate(`/messages/${conversation.id}`);
//     };

//-------------------------------------------------------------------------------

//ignore mo to
// const handleSendMessage = async (message, recipientId) => {
//   if (!newMessage.trim() || !activeChat) return;

//   const messageData = {
//     sender: userId,
//     recipient: recipientId,
//     text: message,
//     conversationId: activeChat.id,
//     otherUser: { userId: recipientId },
//   };

//   try {
//     const res = await fetch(
//       `${"http://localhost:3001"}/api/conversations/${activeChat.id}/message`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(messageData),
//       }
//     );
//     const savedMessage = await res.json();

//     setActiveChat((prev) => ({
//       ...prev,
//       messages: [...prev.messages, savedMessage],
//     }));

//     socket.current.emit("sendMessageToUser", messageData);
//     setNewMessage("");
//   } catch (err) {
//     console.error("Error sending message:", err);
//   }
// };
