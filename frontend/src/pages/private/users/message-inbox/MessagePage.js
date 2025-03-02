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
import { Modal } from "react-bootstrap"

import { FiPaperclip, FiX } from "react-icons/fi"; 

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

  // modal state variables
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  
  // Image state variables
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);
  
  
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

      // Update the conversations list with the new message
      setConversations((prevConversations) => {
        // Find the conversation this message belongs to
        const existingConversation = prevConversations.find(
          (conversation) => conversation.id === message.conversationId
        );

        if (existingConversation) {
          // Create a new message object with proper timestamp
          const newMessage = {
            ...message,
            createdAt: message.createdAt || new Date().toISOString(),
            updatedAt: message.updatedAt || new Date().toISOString(),
            // Add this to ensure product card data is properly included
            isProductCard: message.isProductCard || false,
            productDetails: message.productDetails || null,
          };

          // Update the existing conversation
          const updatedConversations = prevConversations.map((conversation) => {
            if (conversation.id === message.conversationId) {
              return {
                ...conversation,
                messages: [...conversation.messages, newMessage],
                updatedAt: new Date().toISOString(),
                hasUnread: !activeChat || activeChat.id !== message.conversationId,
              };
            }
            return conversation;
          });

          // Sort conversations by most recent message
          return updatedConversations.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        }

        // If somehow the conversation doesn't exist, just return the current state
        // (This shouldn't happen in normal operation but prevents errors)
        return prevConversations;
      });

      // If this message belongs to the active chat, update the active chat state
      if (activeChat && message.conversationId === activeChat.id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              ...message,
              createdAt: message.createdAt || new Date().toISOString(),
              updatedAt: message.updatedAt || new Date().toISOString(),
               // Ensure product card data is properly included
              isProductCard: message.isProductCard || false,
              productDetails: message.productDetails || null,
            },
          ],
          updatedAt: new Date().toISOString(),
        }));
        
        // Highlight the new message
        setHighlightNewMessage(true);
        setTimeout(() => setHighlightNewMessage(false), 3000);
        
        // Play sound when receiving a message
        playSendSound();
      }
    });

    // Listen for offer acceptance updates
    socket.current.on("offerAccepted", (data) => {
      setAcceptedOffers((prev) => new Set([...prev, data.messageId]));
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId, activeChat, playSendSound]);

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
  }, [studentUser.userId, state?.ownerId, state?.sellerId, state?.renterId, state?.product]);

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
            inquiryPrice: product.title === "Offer" ? null : product.price, // Original item price for inquiries
            offerPrice: product.title === "Offer" ? product.price : null, // Offered price for offers
            image: product.image,
            title: product.title,
            status: product.status, // Include item status
            // productId: product.id || product.productId, // Store the product ID for navigation
          },
        };
        console.log("Sending product message payload:", productMessage);

         // Add the message to the active chat first
          setActiveChat((prev) => ({
            ...prev,
            messages: [...prev.messages, {
              ...productMessage,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
          }));

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

       // Emit the message via socket
        socket.current.emit("sendMessageToUser", {
          ...productMessage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Clear the product after sending it as a card
        navigate("/messages", { replace: true }); // Clear state
      }

       // Upload images if any
       let uploadedImageUrls = [];
       if (selectedFiles.length > 0) {
         uploadedImageUrls = await uploadImages();
       }

      // Send user's message
      if (message.trim() || uploadedImageUrls.length > 0 ) {
        const messageData = {
          sender: userId,
          text: message,
          images: uploadedImageUrls,
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
        setSelectedImages([]);
        setSelectedFiles([]);
        setUploadingImages(false);
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

    // New function to handle image click
    const handleImageClick = (imageUrl) => {
      setModalImage(imageUrl);
      setShowImageModal(true);
    };
  

   // Updated handleImageUpload function
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total count including previously selected files
    if (files.length + selectedFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('Only image files are allowed');
      return;
    }

    // Add new files to selectedFiles state
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs for display
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

   // Remove selected image
   const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

   // Upload images to server
   const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];
    
    setUploadingImages(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('message_images', file);
      });
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3001"}/api/messages/upload-message-images`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      const data = await response.json();
      return data.images; // Array of image URLs
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
      throw error; // Add this line to propagate the error
    } finally {
      setUploadingImages(false);
    }
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
                        ? latestMessage.images && latestMessage.images.length > 0
                          ? "Sent a Photo"
                          : latestMessage.isProductCard
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
                    <div key={index} className="product-card" >
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
                            style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent card click
                              handleImageClick(message.productDetails?.image);
                            }}
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
                      {message.text && <p>{message.text}</p>}
                        {message.images && message.images.length > 0 && (
                          <div className="image-grid">
                            {message.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Content ${idx}`}
                                className="img-fluid rounded"
                                onClick={() => handleImageClick(img)}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </div>
                        )}
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
            {selectedImages.length > 0 && (
              <div className="preview-container">
                {selectedImages.map((img, index) => (
                  <div key={index} className="position-relative" 
                       style={{width: '60px', height: '60px'}}>
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="img-thumbnail"
                      onClick={() => handleImageClick(img)}
                      style={{ cursor: 'pointer' }}
                    />
                    <button
                      className="position-absolute top-0 start-100 translate-middle p-0 border-0 bg-transparent"
                      onClick={() => removeImage(index)}
                      style={{
                        width: '20px',
                        height: '20px',
                        minWidth: '20px',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                     <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger"
                          style={{
                            width: '100%',
                            height: '100%',
                          }}>
                          <FiX size={12} color="white" />
                        </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="input-group">
              <button
                type="button"
                className="attach-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <FiPaperclip size={20} />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />

              <input
                type="text"
                className="form-control flex-grow-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(newMessage, activeChat.otherUser.user_id)}
                placeholder="Type a message..."
              />

              <button
                className="btn btn-primary"
                onClick={() => handleSendMessage(newMessage, activeChat.otherUser.user_id)}
              >
                Send
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

          {/* Image Modal */}
          <Modal 
            show={showImageModal} 
            onHide={() => setShowImageModal(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Image Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <img 
                src={modalImage} 
                alt="Full Preview" 
                style={{ maxWidth: '100%', maxHeight: '70vh' }} 
              />
            </Modal.Body>
          </Modal>
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
