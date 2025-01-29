import React, { useEffect, useState, useRef } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import { useAuth } from "../../../../context/AuthContext";
import { io } from "socket.io-client";
import { baseApi } from "../../../../App";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate, useParams  } from "react-router-dom";
import {useChat} from "../../../../context/ChatContext";

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

  const product = state?.product;
  const navigate = useNavigate();

  
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

      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conversation) => {
          if (conversation.id === message.conversationId) {
            return {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: new Date().toISOString(), // Update the timestamp
            };
          }
          return conversation;
        });

        // Sort updated conversations
        return updatedConversations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });

      if (activeChat && message.conversationId === activeChat.id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
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
        setConversations(data.conversations);

         // Sort conversations by the most recent activity
        const sortedConversations = data.conversations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setConversations(sortedConversations);

          // Automatically set the conversation with the owner as active
          if (state?.ownerId || state?.sellerId) {
            const targetConversation = data.conversations.find((conversation) =>
              conversation.members.includes(String(state.ownerId || state.sellerId))
            );
            setActiveChat(targetConversation || null);
          }

        setIsLoading(false);

      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [studentUser.userId, state?.ownerId, state?.sellerId]);
  
  
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
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
            price: product.price,
            image: product.image,
            title: product.title,
            status: product.status, // Include item status
          },
        };
        console.log("Sending product message payload:", productMessage);

        await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/conversations/${activeChat.id}/message`,
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
              recipient: recipientId,
              text: message,
              conversationId: activeChat.id,
              otherUser: { userId: recipientId },
              isProductCard: false, // Regular message
              productDetails: null, // No product details for a regular message
        };
  
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/conversations/${activeChat.id}/message`,
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
        }));
        socket.current.emit("sendMessageToUser", messageData);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  

  const handleConversationClick = (conversation) => {
    setActiveChat(conversation);
  };

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
            conversations.map((chat) => (
              <div
                key={chat.id}
                className="inbox-item"
                onClick={() => handleConversationClick(chat)}
              >
                <img src={UserIcon} alt="User Icon" className="user-icon" />
                <div className="message-info">
                  <h5>{chat.otherUser.first_name}</h5>
                  <p>{chat.preview}</p>
                </div>
                <span>{new Date(chat.updatedAt).toLocaleString()}</span>
              </div>
            ))
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
                <h6>You're inquiring about this item</h6>
                <div className="d-flex align-items-start">
                  <img 
                    src={message.productDetails?.image} 
                    alt={message.productDetails?.name} 
                    className="me-3" 
                    style={{ width: "60px", height: "60px" }} 
                  />
                  <div>
                    <p className="mb-1">
                      <strong>{message.productDetails?.title} {message.productDetails?.name}</strong>
                    </p>
                    
                    {/* Show Price if available, otherwise show Status */}
                    {message.productDetails?.price ? (
                      <p className="mb-0">Price: ₱{message.productDetails?.price}</p>
                    ) : (
                      <p className="mb-0">Status: {message.productDetails?.status}</p>
                    )}
                  </div>
                </div>
              </div>
                ) : (
                  <div
                    key={index}
                    className={`chat-message ${
                      message.sender === userId ? "sent" : "received"
                    } ${
                      highlightNewMessage &&
                      index === activeChat.messages.length - 1
                        ? "new-message"
                        : ""
                    }`}
                  >
                    <p>{message.text}</p>
                      <span>
                        {new Date(
                          index === activeChat.messages.length - 1
                            ? message.createdAt
                            : message.updatedAt
                        ).toLocaleString()}
                      </span>
                  </div>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
            {/* <ProductCard /> */}
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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