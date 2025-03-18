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
import { FiPaperclip, FiX, FiSearch, FiMoreVertical } from "react-icons/fi"; 
import axios from "axios";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../utils/ShowAlert.js";
import ReportModal from "../../../../components/report/ReportModal";
import useHandleActionWithAuthCheck from "../../../../utils/useHandleActionWithAuthCheck.jsx";
import handleUnavailableDateError from "../../../../utils/handleUnavailableDateError.js";

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
  // Add state for expanded product cards
  const [expandedCards, setExpandedCards] = useState(new Set());
  // Add state for message filter
  const [messageFilter, setMessageFilter] = useState("All");
  // Add state for dropdown visibility
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  // Add state for active menu
  const [activeMenu, setActiveMenu] = useState(null);
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  // Add state for search results
  const [searchResults, setSearchResults] = useState([]);
  // Add state to track if we're in search mode
  const [isSearching, setIsSearching] = useState(false);
  // Add state to highlight matched messages
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  
  // Report functionality state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUser, setReportUser] = useState(null);
  const [hasReported, setHasReported] = useState({});
  const dispatch = useDispatch();
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();

  // Add refs for click outside handling
  const filterDropdownRef = useRef(null);
  const menuRefs = useRef({});

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

        // Once conversations are loaded, check if any users have been reported
        if (sortedConversations.length > 0) {
          console.log("Conversations loaded, checking reported users");
        }

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
            productId: product.productId || product.id, // Store the product ID for navigation
            type: product.type,
            // Include additional offer details if they exist
            deliveryMethod: product.deliveryMethod || null,
            paymentMethod: product.paymentMethod || null,
            itemCondition: product.itemCondition || null,
            terms: product.terms || null
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

    const handleProductCardClick = (productId, type) => {
      console.log("Navigating with:", { productId, type });
      if (productId && type) {
        navigate(`/${type}/${productId}`);
      } else {
        console.log("Cannot navigate: Missing required data", { productId, type });
      }
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
  
  // Add function to toggle card expansion
  const toggleCardExpansion = (messageId, e) => {
    e.stopPropagation(); // Prevent card click from navigating
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Add function to toggle filter dropdown
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Add function to select filter
  const selectFilter = (filter) => {
    setMessageFilter(filter);
    setShowFilterDropdown(false);
  };

  // Enhanced search function
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Search in conversations
    const results = [];
    
    if (conversations) {
      conversations.forEach(chat => {
        // Check user name
        const nameMatch = 
          chat.otherUser.first_name.toLowerCase().includes(query.toLowerCase()) || 
          (chat.otherUser.last_name && chat.otherUser.last_name.toLowerCase().includes(query.toLowerCase()));
        
        // Check messages content
        const messageMatches = [];
        if (chat.messages && chat.messages.length > 0) {
          chat.messages.forEach(msg => {
            // Check text content
            if (msg.text && msg.text.toLowerCase().includes(query.toLowerCase())) {
              messageMatches.push({
                messageId: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                messageText: msg.text,
                timestamp: msg.createdAt,
                index: chat.messages.indexOf(msg) // Store the index for scrolling
              });
            }
            
            // Check product details
            if (msg.isProductCard && msg.productDetails) {
              const productDetails = msg.productDetails;
              if (
                (productDetails.name && productDetails.name.toLowerCase().includes(query.toLowerCase())) ||
                (productDetails.status && productDetails.status.toLowerCase().includes(query.toLowerCase()))
              ) {
                messageMatches.push({
                  messageId: msg.id || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  messageText: `Product: ${productDetails.name}`,
                  timestamp: msg.createdAt,
                  isProduct: true,
                  index: chat.messages.indexOf(msg) // Store the index for scrolling
                });
              }
            }
          });
        }
        
        if (nameMatch || messageMatches.length > 0) {
          results.push({
            conversation: chat,
            nameMatch,
            messageMatches
          });
        }
      });
    }
    
    setSearchResults(results);
  };

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setHighlightedMessageId(null);
  };

  // Function to handle clicking on a search result
  const handleSearchResultClick = (conversation, messageId = null, messageIndex = null) => {
    setActiveChat(conversation);
    
    // Clear unread status
    setUnreadMessages((prev) => ({
      ...prev,
      [conversation.id]: false,
    }));
    
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, hasUnread: false } : conv
      )
    );
    
    // If a specific message was clicked, highlight it
    if (messageId) {
      setHighlightedMessageId(messageId);
      
      // Scroll to the message after the chat content is rendered
      setTimeout(() => {
        // Try to find by ID first
        let messageElement = document.getElementById(`message-${messageId}`);
        
        // If not found by ID, try to find by index
        if (!messageElement && messageIndex !== null) {
          const messageElements = document.querySelectorAll('.chat-message, .product-card');
          if (messageElements && messageElements.length > messageIndex) {
            messageElement = messageElements[messageIndex];
          }
        }
        
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add a temporary highlight class
          messageElement.classList.add('highlighted-message');
          
          // Remove highlight after a few seconds
          setTimeout(() => {
            setHighlightedMessageId(null);
            messageElement.classList.remove('highlighted-message');
          }, 3000);
        }
      }, 300); // Increased timeout to ensure chat is fully rendered
    }
    
    // Clear search if on mobile
    if (isMobile) {
      clearSearch();
    }
  };

  // Modified getFilteredConversations to work with search
  const getFilteredConversations = () => {
    if (!conversations) return [];
    
    // If in search mode and we have results, return conversations from search results
    if (isSearching && searchResults.length > 0) {
      return searchResults.map(result => result.conversation);
    }
    
    // Otherwise filter by read/unread status
    switch(messageFilter) {
      case "Read":
        return conversations.filter(chat => !chat.hasUnread);
      case "Unread":
        return conversations.filter(chat => chat.hasUnread);
      case "All":
      default:
        return conversations;
    }
  };

  // Add function to handle conversation menu actions
  const handleConversationAction = async (action, chat, e) => {
    e.stopPropagation(); // Prevent conversation click
    
    switch(action) {
      case 'viewProfile':
        // Navigate directly to user profile using the same path as in ListingDetail.js
        navigate(`/user/${chat.otherUser.user_id}`);
        break;
      case 'block':
        // Show confirmation dialog for blocking
        if (window.confirm(`Are you sure you want to block ${chat.otherUser.first_name}?`)) {
          // Implement block functionality here
          alert(`${chat.otherUser.first_name} has been blocked.`);
        }
        break;
      case 'report':
        // Check if user has already been reported
        if (hasReported[chat.otherUser.user_id]) {
          ShowAlert(dispatch, "info", "Already Reported", "You have already reported this user.");
          break;
        }
        
        console.log("Showing report modal for user:", chat.otherUser);
        
        // Set the user to be reported and show the report modal
        setReportUser({
          id: chat.otherUser.user_id,
          name: `${chat.otherUser.first_name} ${chat.otherUser.last_name || ''}`
        });
        setShowReportModal(true);
        break;
      case 'delete':
        // Show confirmation dialog for deleting
        if (window.confirm(`Are you sure you want to delete this conversation with ${chat.otherUser.first_name}?`)) {
          // Implement delete functionality here
          alert(`Conversation with ${chat.otherUser.first_name} has been deleted.`);
        }
        break;
      default:
        break;
    }
    
    // Close the menu
    setActiveMenu(null);
  };

  // Add function to toggle menu visibility
  const toggleMenu = (chatId, e) => {
    e.stopPropagation(); // Prevent conversation click
    setActiveMenu(activeMenu === chatId ? null : chatId);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close filter dropdown when clicking outside
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      
      // Close active menu when clicking outside
      if (activeMenu && menuRefs.current[activeMenu] && !menuRefs.current[activeMenu].contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]);

  // Check if a user has been reported
  const checkIfReported = async (userId) => {
    if (!studentUser.userId || !userId) return false;
    
    try {
      const response = await axios.get(
        `http://localhost:3001/api/reports/check`,
        {
          params: {
            reporter_id: studentUser.userId,
            reported_entity_id: userId,
          },
        }
      );
      return response.data.hasReported;
    } catch (error) {
      console.error("Error checking report:", error);
      return false;
    }
  };

  // Handle report submission
  const handleReportSubmit = async (reason) => {
    if (!reportUser) {
      console.error("No user to report");
      return;
    }
    
    console.log("Submitting report for user:", reportUser, "with reason:", reason);
    
    const reportData = {
      reporter_id: studentUser.userId,
      reported_entity_id: reportUser.id,
      entity_type: "user",
      reason: reason,
    };

    try {
      console.log("Sending report data:", reportData);
      const response = await axios.post(
        "http://localhost:3001/api/reports",
        reportData
      );
      console.log("Report submission response:", response.data);

      // Update hasReported state
      setHasReported(prev => ({
        ...prev,
        [reportUser.id]: true
      }));

      // Show success notification
      ShowAlert(
        dispatch,
        "success",
        "Report Submitted",
        "Your report has been submitted successfully."
      );
    } catch (error) {
      console.error("Error submitting report:", error);

      // Handle 403 error separately
      await handleUnavailableDateError(dispatch, error);

      // If it's not a 403 error, handle other errors
      if (error.response?.status !== 403) {
        ShowAlert(
          dispatch,
          "error",
          "Submission Failed",
          "Failed to submit the report. Please try again."
        );
      }
    }

    setShowReportModal(false); // Close the modal
    setReportUser(null); // Reset the user being reported
  };

  // Add useEffect to check if users have been reported when conversations load
  useEffect(() => {
    const checkReportedUsers = async () => {
      if (!studentUser || !studentUser.userId || conversations.length === 0) {
        console.log("Skipping report check - no user or conversations");
        return;
      }
      
      console.log("Checking reported users for", conversations.length, "conversations");
      
      const reported = {};
      for (const chat of conversations) {
        if (chat.otherUser && chat.otherUser.user_id) {
          const hasReported = await checkIfReported(chat.otherUser.user_id);
          if (hasReported) {
            reported[chat.otherUser.user_id] = true;
            console.log(`User ${chat.otherUser.user_id} has been reported`);
          }
        }
      }
      setHasReported(reported);
    };
    
    checkReportedUsers();
  }, [conversations]);

  return (
    <div className="container-content message-page">
      <div className="message-content">
        <div
          className={`inbox ${isMobile && activeChat !== null ? "d-none" : ""}`}
        >
          <div className="inbox-header">
            <h3>Messages</h3>
            <div className="filter-dropdown" ref={filterDropdownRef}>
              <div 
                className={`selected-filter ${showFilterDropdown ? "open" : ""}`} 
                onClick={toggleFilterDropdown}
              >
                {messageFilter} <span className="dropdown-arrow">▼</span>
              </div>
              {showFilterDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${messageFilter === "All" ? "active" : ""}`}
                    onClick={() => selectFilter("All")}
                  >
                    All
                  </div>
                  <div 
                    className={`filter-option ${messageFilter === "Read" ? "active" : ""}`}
                    onClick={() => selectFilter("Read")}
                  >
                    Read
                  </div>
                  <div 
                    className={`filter-option ${messageFilter === "Unread" ? "active" : ""}`}
                    onClick={() => selectFilter("Unread")}
                  >
                    Unread
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Search bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search in messages"
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={clearSearch}
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <p>Loading conversations...</p>
          ) : isSearching && searchResults.length === 0 ? (
            <p className="no-conversations">No results found for "{searchQuery}"</p>
          ) : getFilteredConversations().length > 0 ? (
            <div className="inbox-list">
              {isSearching ? (
                // Display search results with message previews
                searchResults.map(result => {
                  const chat = result.conversation;
                  const hasUnreadMessages = chat.hasUnread;
                  
                  return (
                    <div key={chat.id} className="search-result-group">
                      <div
                        className={`inbox-item ${hasUnreadMessages ? "unread" : ""} ${result.nameMatch ? "name-match" : ""}`}
                        onClick={() => handleSearchResultClick(chat)}
                      >
                        <img src={UserIcon} alt="User Icon" className="user-icon" />
                        <div className="message-info">
                          <h5>{chat.otherUser.first_name}</h5>
                          <p className="preview-message">
                            {result.nameMatch ? 
                              <span className="match-highlight">Name matches your search</span> : 
                              `${result.messageMatches.length} message${result.messageMatches.length > 1 ? 's' : ''} found`
                            }
                          </p>
                        </div>
                        <div className="message-meta">
                          <span className="timestamp">
                            {chat.messages && chat.messages.length > 0
                              ? new Date(chat.messages[chat.messages.length - 1].createdAt).toLocaleString()
                              : ""}
                          </span>
                          {hasUnreadMessages && (
                            <div className="unread-indicator"></div>
                          )}
                        </div>
                        <div 
                          className="conversation-menu" 
                          ref={el => menuRefs.current[chat.id] = el}
                        >
                          <button 
                            className="ellipsis-menu" 
                            onClick={(e) => toggleMenu(chat.id, e)}
                          >
                            <FiMoreVertical />
                          </button>
                          {activeMenu === chat.id && (
                            <div className="menu-options">
                              <div 
                                className="menu-option"
                                onClick={(e) => handleConversationAction('viewProfile', chat, e)}
                              >
                                View Profile
                              </div>
                              <div 
                                className="menu-option"
                                onClick={(e) => handleConversationAction('block', chat, e)}
                              >
                                Block
                              </div>
                              <div 
                                className="menu-option"
                                onClick={(e) => {
                                  console.log("Report button clicked", chat.otherUser);
                                  handleConversationAction('report', chat, e);
                                }}
                              >
                                Report
                              </div>
                              <div 
                                className="menu-option delete"
                                onClick={(e) => handleConversationAction('delete', chat, e)}
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Show message matches */}
                      {result.messageMatches.length > 0 && (
                        <div className="message-matches">
                          {result.messageMatches.map((match, idx) => (
                            <div 
                              key={idx} 
                              className="message-match-item"
                              onClick={() => handleSearchResultClick(chat, match.messageId, match.index)}
                            >
                              <div className="message-match-content">
                                <p className="message-match-text">
                                  {match.isProduct ? (
                                    <span className="product-match">{match.messageText}</span>
                                  ) : (
                                    match.messageText.length > 50 ? 
                                      `${match.messageText.substring(0, 50)}...` : 
                                      match.messageText
                                  )}
                                </p>
                                <span className="message-match-time">
                                  {new Date(match.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Regular conversation list
                getFilteredConversations().map((chat) => {
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
                      <img 
                        src={UserIcon} 
                        alt={`${chat.otherUser.first_name}'s profile`} 
                        className="user-icon" 
                      />
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
                      <div 
                        className="conversation-menu" 
                        ref={el => menuRefs.current[chat.id] = el}
                      >
                        <button 
                          className="ellipsis-menu" 
                          onClick={(e) => toggleMenu(chat.id, e)}
                        >
                          <FiMoreVertical />
                        </button>
                        {activeMenu === chat.id && (
                          <div className="menu-options">
                            <div 
                              className="menu-option"
                              onClick={(e) => handleConversationAction('viewProfile', chat, e)}
                            >
                              View Profile
                            </div>
                            <div 
                              className="menu-option"
                              onClick={(e) => handleConversationAction('block', chat, e)}
                            >
                              Block
                            </div>
                            <div 
                              className="menu-option"
                              onClick={(e) => {
                                console.log("Report button clicked", chat.otherUser);
                                handleConversationAction('report', chat, e);
                              }}
                            >
                              Report
                            </div>
                            <div 
                              className="menu-option delete"
                              onClick={(e) => handleConversationAction('delete', chat, e)}
                            >
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <p className="no-conversations">No conversations available.</p>
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
                    <div 
                      key={index}
                      id={`message-${message.id}`}
                      className={`product-card ${highlightedMessageId === message.id ? 'highlighted-message' : ''}`}
                      onClick={() => handleProductCardClick(
                        message.productDetails?.productId,
                        message.productDetails?.type
                      )}
                      style={{ cursor: message.productDetails?.productId ? 'pointer' : 'default' }}
                    >
                      <div className="product-card-header">
                        <h6>
                          {message.productDetails?.title === "Offer"
                            ? "Offer for this item"
                            : "Inquiring about this item"}
                        </h6>
                        <button 
                          className={`expand-toggle-btn ${expandedCards.has(message.id) ? 'expanded' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click from navigating
                            toggleCardExpansion(message.id, e);
                          }}
                        >
                          {expandedCards.has(message.id) ? '−' : '+'}
                        </button>
                      </div>
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
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        handleAcceptOffer(message);
                                      }}
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
                          
                          {/* Display additional offer details only when expanded */}
                          {expandedCards.has(message.id) && (
                            <div className="additional-details mt-3">
                              {message.productDetails?.deliveryMethod && (
                                <p className="mb-1">
                                  <strong>Delivery:</strong> {message.productDetails.deliveryMethod === "meetup" ? "Meet up" : "Pick up"}
                                </p>
                              )}
                              
                              {message.productDetails?.paymentMethod && (
                                <p className="mb-1">
                                  <strong>Payment:</strong> {message.productDetails.paymentMethod === "gcash" ? "Gcash" : "Pay upon meetup"}
                                </p>
                              )}
                              
                              {message.productDetails?.itemCondition && (
                                <p className="mb-1">
                                  <strong>Condition:</strong> {message.productDetails.itemCondition}
                                </p>
                              )}
                              
                              {/* Display terms if available */}
                              {message.productDetails?.terms && (
                                <div className="terms-details mt-2">
                                  <p className="mb-1"><strong>Terms & Conditions:</strong></p>
                                  <div style={{ fontSize: '0.85rem' }}>
                                    {message.productDetails.terms.lateCharges && (
                                      <p className="mb-0">• Late Charges: {message.productDetails.terms.lateCharges}</p>
                                    )}
                                    {message.productDetails.terms.securityDeposit && (
                                      <p className="mb-0">• Security Deposit: {message.productDetails.terms.securityDeposit}</p>
                                    )}
                                    {message.productDetails.terms.repairReplacement && (
                                      <p className="mb-0">• Repair/Replacement: {message.productDetails.terms.repairReplacement}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      id={`message-${message.id}`}
                      className={`chat-message ${
                        String(message.sender) === String(userId)
                          ? "sent"
                          : "received"
                      } ${
                        highlightNewMessage &&
                        index === activeChat.messages.length - 1
                          ? "new-message"
                          : ""
                      } ${
                        highlightedMessageId === message.id ? 'highlighted-message' : ''
                      }`}
                    >
                      {message.images && Array.isArray(message.images) && message.images.length > 0 && (
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
                      {message.text && <p>{message.text}</p>}
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
      
      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        handleClose={() => {
          console.log("Closing report modal");
          setShowReportModal(false);
          setReportUser(null);
        }}
        handleSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default MessagePage;
