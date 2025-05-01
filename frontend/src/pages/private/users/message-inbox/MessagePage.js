import React, { useEffect, useState, useRef } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import { useAuth } from "../../../../context/AuthContext";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useChat } from "../../../../context/ChatContext";
import useSound from "use-sound";
import sendSound from "../../../../assets/audio/sent.mp3";
import { Modal, Button } from "react-bootstrap";
import { FiPaperclip, FiX, FiSearch, FiMoreVertical } from "react-icons/fi";
import axios from "axios";
import { useDispatch } from "react-redux";
import ShowAlert from "../../../../utils/ShowAlert.js";
import ReportModal from "../../../../components/report/ReportModal";
import useHandleActionWithAuthCheck from "../../../../utils/useHandleActionWithAuthCheck.jsx";
import handleUnavailableDateError from "../../../../utils/handleUnavailableDateError.js";
import Swal from "sweetalert2";
import { BsPersonCircle, BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineSearch, AiOutlineFilter } from "react-icons/ai";
import { RiCloseCircleLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { MdProductionQuantityLimits } from "react-icons/md";
import { baseApi } from "../../../../utils/consonants.js";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import { formatDate } from "../../../../utils/dateFormat";

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
  const [rejectedOffers, setRejectedOffers] = useState(new Set());
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

  // Block and delete functionality states
  const [isBlocked, setIsBlocked] = useState({});
  const [blockedBy, setBlockedBy] = useState({});
  const [showUnblockButton, setShowUnblockButton] = useState(false);

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

  // Add these state variables after other state variables
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket.current = io(process.env.REACT_APP_SOCKET_URL || `${baseApi}`);

    socket.current.on("connect", () => {
      // console.log("Connected to WebSocket", socket.current.id);
      socket.current.emit("registerUser", userId);
    });

    socket.current.on("disconnect", () => {
      // console.log("Disconnected from WebSocket");
    });

    socket.current.on("connect_error", (error) => {
      // console.error("Socket connection error:", error);
    });

    socket.current.on("receiveMessage", (message) => {
      // console.log("Received message:", message);

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
                hasUnread:
                  !activeChat || activeChat.id !== message.conversationId,
              };
            }
            return conversation;
          });

          // Sort conversations by most recent message
          return sortConversationsByLatestActivity(updatedConversations);
        } else {
          // Conversation doesn't exist in our state, possibly because it was deleted
          // Fetch this conversation from the API
          fetchDeletedConversation(message.conversationId);

          // Return current state for now, the fetch will update it
          return prevConversations;
        }
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

    socket.current.on("offerRejected", (data) => {
      setRejectedOffers((prev) => new Set([...prev, data.messageId]));
    });

    // Listen for block status updates
    socket.current.on("userBlocked", (data) => {
      if (data.blockedId === userId) {
        // Current user has been blocked
        setBlockedBy((prev) => ({
          ...prev,
          [data.blockerId]: true,
        }));

        // Update conversation in list if it exists
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.otherUser.user_id === data.blockerId
              ? { ...conv, blockedBy: true }
              : conv
          )
        );

        // Update active chat if needed
        if (activeChat && activeChat.otherUser.user_id === data.blockerId) {
          setActiveChat((prev) => ({
            ...prev,
            blockedBy: true,
          }));

          ShowAlert(
            dispatch,
            "info",
            "Blocked",
            "You have been blocked by this user."
          );
        }
      }
    });

    socket.current.on("userUnblocked", (data) => {
      if (data.unblockedId === userId) {
        // Current user has been unblocked
        setBlockedBy((prev) => {
          const updated = { ...prev };
          delete updated[data.unblockerId];
          return updated;
        });

        // Update conversation in list if it exists
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.otherUser.user_id === data.unblockerId
              ? { ...conv, blockedBy: false }
              : conv
          )
        );

        // Update active chat if needed
        if (activeChat && activeChat.otherUser.user_id === data.unblockerId) {
          setActiveChat((prev) => ({
            ...prev,
            blockedBy: false,
          }));

          ShowAlert(
            dispatch,
            "info",
            "Unblocked",
            "You have been unblocked by this user."
          );
        }
      }
    });

    return () => {
      if (socket.current) {
        socket.current.off("receiveMessage");
        socket.current.off("offerAccepted");
        socket.current.off("offerRejected");
        socket.current.off("userBlocked");
        socket.current.off("userUnblocked");
        socket.current.disconnect();
      }
    };
  }, [userId, activeChat, playSendSound]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const token = studentUser.token;
        const userId = studentUser.userId;

        // Fetch conversations
        const response = await fetch(`${baseApi}/api/conversations/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        // console.log("Fetched conversations:", data);

        // Update conversations state with sort (most recent first)
        const sortedConversations = sortConversationsByLatestActivity(
          data.conversations
        );
        setConversations(sortedConversations);

        // Set unread status for all conversations
        const unreadStatus = {};
        sortedConversations.forEach((conversation) => {
          unreadStatus[conversation.id] = conversation.hasUnread;
        });
        setUnreadMessages(unreadStatus);

        // Handle active conversation selection
        if (state?.activeConversationId) {
          // If activeConversationId is provided in state, use that
          const selectedConversation = sortedConversations.find(
            (conversation) => conversation.id === state.activeConversationId
          );

          if (selectedConversation) {
            setActiveChat(selectedConversation);
          }
        } else if (state?.ownerId || state?.sellerId || state?.renterId) {
          // Otherwise try to find by member ID
          const targetConversation = sortedConversations.find(
            (conversation) =>
              conversation.otherUser.user_id ===
              (state.ownerId || state.sellerId || state.renterId)
          );

          if (targetConversation) {
            setActiveChat(targetConversation || null);
            // If there's a product in state, send it automatically
            if (state?.product) {
              handleSendMessage("", targetConversation.otherUser.user_id);
            }
          }
        }

        // Initialize block status from the API response
        const newBlockedStatus = {};
        const newBlockedByStatus = {};

        // Set blocked status for each conversation
        sortedConversations.forEach((conversation) => {
          if (conversation.isBlocked) {
            newBlockedStatus[conversation.otherUser.user_id] = true;
          }

          if (conversation.blockedBy) {
            newBlockedByStatus[conversation.otherUser.user_id] = true;
          }
        });

        setIsBlocked(newBlockedStatus);
        setBlockedBy(newBlockedByStatus);

        // Once conversations are loaded, check if any users have been reported
        if (sortedConversations.length > 0) {
          // checkReportedUsers();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [
    studentUser.userId,
    state?.ownerId,
    state?.sellerId,
    state?.renterId,
    state?.product,
    state?.activeConversationId,
  ]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  const handleSendMessage = async (message, recipientId) => {
    if (!activeChat) return;

    try {
      // Check if this user is blocked
      if (isBlocked[recipientId]) {
        ShowAlert(
          dispatch,
          "error",
          "Blocked",
          "You cannot send messages to users you have blocked. Unblock this user to continue the conversation."
        );
        return;
      }

      if (blockedBy[recipientId]) {
        ShowAlert(
          dispatch,
          "error",
          "Blocked",
          "This user has blocked you. You cannot send messages to them."
        );
        return;
      }

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
            location: product.location || null,
            stock: product.stock || null, // Add stock for sale items
            terms: product.terms || null,
            // Include date and time IDs if they exist
            date_id: product.date_id || null,
            time_id: product.time_id || null,
          },
        };
        // console.log("Sending product message payload:", productMessage);

        // Add the message to the active chat first
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              ...productMessage,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }));

        const response = await fetch(
          `${process.env.REACT_APP_API_URL ?? baseApi}/api/conversations/${
            activeChat.id
          }/message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productMessage),
          }
        );

        // Check if the request was unsuccessful due to blocking
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 403) {
            if (errorData.isBlocked) {
              setIsBlocked((prev) => ({
                ...prev,
                [recipientId]: true,
              }));
              setShowUnblockButton(true);
              ShowAlert(
                dispatch,
                "error",
                "Blocked",
                "You have blocked this user. Unblock them to send messages."
              );
            } else if (errorData.blockedBy) {
              setBlockedBy((prev) => ({
                ...prev,
                [recipientId]: true,
              }));
              ShowAlert(
                dispatch,
                "error",
                "Blocked",
                "You cannot send messages to this user as they have blocked you."
              );
            } else {
              ShowAlert(
                dispatch,
                "error",
                "Error",
                errorData.error || "Failed to send message."
              );
            }
            return;
          }
        }

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
      if (message.trim() || uploadedImageUrls.length > 0) {
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
          `${process.env.REACT_APP_API_URL ?? baseApi}/api/conversations/${
            activeChat.id
          }/message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData),
          }
        );

        // Check if the request was unsuccessful due to blocking
        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 403) {
            if (errorData.isBlocked) {
              setIsBlocked((prev) => ({
                ...prev,
                [recipientId]: true,
              }));
              setShowUnblockButton(true);
              ShowAlert(
                dispatch,
                "error",
                "Blocked",
                "You have blocked this user. Unblock them to send messages."
              );
            } else if (errorData.blockedBy) {
              setBlockedBy((prev) => ({
                ...prev,
                [recipientId]: true,
              }));
              ShowAlert(
                dispatch,
                "error",
                "Blocked",
                "You cannot send messages to this user as they have blocked you."
              );
            } else {
              ShowAlert(
                dispatch,
                "error",
                "Error",
                errorData.error || "Failed to send message."
              );
            }
            return;
          }
        }

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
                  hasUnread: false, // Mark as read since we're in this conversation
                }
              : conv
          );

          // Sort using our enhanced sorting function
          return sortConversationsByLatestActivity(updated);
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
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Failed to send message. Please try again."
      );
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
    // Set the current offer and show confirmation modal
    setCurrentOffer(message);
    setShowConfirmModal(true);
  };

  const confirmAcceptOffer = async () => {
    if (!currentOffer) return;

    try {
      // Add the message ID to accepted offers
      setAcceptedOffers((prev) => new Set([...prev, currentOffer.id]));

      // Check if it's a rental or sale offer based on terms existence or offer title
      const isRentalOffer =
        (currentOffer.productDetails?.terms &&
        Object.values(currentOffer.productDetails.terms).some((term) => term)) ||
        currentOffer.productDetails?.title === "Rent Offer";

      // Emit socket event to notify other user
      socket.current.emit("offerAccepted", {
        messageId: currentOffer.id,
        conversationId: activeChat.id,
        recipient: currentOffer.sender,
        sender: userId, // Add sender ID for notification
        offerType: isRentalOffer ? "rental" : "sale", // Include type of offer
      });

      // Update the offer status in the backend
      await fetch(
        `${process.env.REACT_APP_API_URL ?? baseApi}/api/messages/${currentOffer.id}/offer-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "accepted",
            userId: userId,
            recipientId: currentOffer.sender,
          }),
        }
      );

      // Rest of the existing function code...
      
      // Create a transaction record in the database
      if (
        currentOffer.productDetails?.date_id &&
        currentOffer.productDetails?.time_id
      ) {
        // Define transaction details outside the try block so error handler can access it
        // Determine the correct item type and model based on the offer
        let itemType = "post"; // Default type
        let correctItemId = currentOffer.productDetails.productId;
        let detectedItemType = "";
        
        // First, check if it's a rental offer from a post
        if (isRentalOffer && 
            currentOffer.productDetails.type === "post" &&
            currentOffer.productDetails.terms) {
          // This is a rental offer that was created from a post
          itemType = "rental_from_post";
          detectedItemType = "RENTAL FROM POST";
        }
        // Check if type is explicitly provided
        else if (currentOffer.productDetails.type) {
          itemType = currentOffer.productDetails.type;
          detectedItemType = "FROM TYPE FIELD";
          
          // Handle special case for post type - might need to use different ID
          if (itemType === "post" && currentOffer.productDetails.originalItemId) {
            correctItemId = currentOffer.productDetails.originalItemId;
          }
        } 
        // Next check based on terms existence (rental) vs stock existence (sale)
        else if (isRentalOffer || 
                 (currentOffer.productDetails.terms && 
                  Object.values(currentOffer.productDetails.terms).some(term => term))) {
          itemType = "listing";
          detectedItemType = "FROM TERMS";
        } 
        else if (currentOffer.productDetails.stock || 
                 currentOffer.productDetails.title === "Sale Offer") {
          itemType = "item-for-sale";
          detectedItemType = "FROM STOCK/TITLE"; 
        }
        
        console.log("Detected item type:", itemType, "isRentalOffer:", isRentalOffer, "Detection method:", detectedItemType);
        
        // Add additional check to ensure we're using the correct item ID field based on transaction type
        if (isRentalOffer) {
          // For rental offers, the item is a listing
          if (currentOffer.productDetails.listingId) {
            correctItemId = currentOffer.productDetails.listingId;
          }
        } else {
          // For sale offers, the item is an item-for-sale
          if (currentOffer.productDetails.itemForSaleId) {
            correctItemId = currentOffer.productDetails.itemForSaleId;
          }
        }
        
        // Get necessary details from the offer
        const stock = currentOffer.productDetails.stock || 1;
        const quantity = stock > 0 ? stock : 1; // Ensure quantity is at least 1
        
        // Calculate the total amount based on offer type and quantity
        const offerPrice = currentOffer.productDetails.offerPrice || 0;
        let totalAmount = isRentalOffer ? offerPrice : offerPrice * quantity;
        
        // Extract timeFrom and timeTo from status field if available
        let timeFrom, timeTo;
        if (currentOffer.productDetails.status) {
          const durationText = currentOffer.productDetails.status.split("\n").find(line => line.includes("Duration:"));
          if (durationText) {
            const durationMatch = durationText.match(/Duration: ([\d:]+)\s*-\s*([\d:]+)/);
            if (durationMatch && durationMatch.length === 3) {
              timeFrom = durationMatch[1];
              timeTo = durationMatch[2];
            }
          }
        }
        
        // Include owner/seller contact information directly in the transaction details
        // This is a backup in case the backend can't find the related model
        let ownerInfo = {};
        
        // If we have sender info from the message, include it
        if (activeChat && activeChat.participants) {
          const sender = activeChat.participants.find(p => p.id === currentOffer.sender);
          if (sender) {
            ownerInfo = {
              owner_email: sender.email || "",
              owner_first_name: sender.fname || "",
              owner_last_name: sender.lname || "",
              // Use the same field names for seller
              seller_email: sender.email || "",
              seller_first_name: sender.fname || "",
              seller_last_name: sender.lname || ""
            };
          }
        }
        
        // For post-based offers, gather extended item information to help with lookup
        let extendedItemInfo = {};
        if (itemType === "post" || itemType === "rental_from_post") {
          // Get all available information from the product details
          extendedItemInfo = {
            // Basic identification
            post_id: correctItemId,
            // Include full item details to help with item lookup
            item_name: currentOffer.productDetails.name || "",
            item_description: currentOffer.productDetails.description || "",
            item_price: currentOffer.productDetails.offerPrice || currentOffer.productDetails.price || 0,
            item_image: currentOffer.productDetails.image || "",
            // For rental items, include rental-specific fields
            item_security_deposit: isRentalOffer && currentOffer.productDetails.terms 
              ? (currentOffer.productDetails.terms.securityDeposit || 0) 
              : 0,
            // Explicitly add the post information
            post_type: isRentalOffer ? "rental" : "sale",
            // Flag that helps backend identify this is a post transaction
            from_post: true,
            // Make extra sure transaction type is correct
            transaction_type: isRentalOffer ? "rental" : "sell"
          };
        }
        
        console.log(`Transaction type: ${isRentalOffer ? "rental" : "sell"}`);
        console.log("Using item_id:", correctItemId, "Original ID:", currentOffer.productDetails.productId);
        console.log("Owner info available:", Object.keys(ownerInfo).length > 0);
        console.log("Extended item info:", Object.keys(extendedItemInfo).length > 0);
        
        // For rental_from_post type, we need to set the proper transaction_type
        // This is critical to make sure the backend uses the correct item lookup logic
        const transactionType = isRentalOffer ? "rental" : "sell";
        
        // Create transaction details
          const transactionDetails = {
          // The person who sent the offer is ALWAYS the owner/seller (they created the post)
          owner_id: currentOffer.sender,
          // For sale transactions, explicitly set sender as seller
          seller_id: currentOffer.sender,
          // The current user (who is accepting the offer) is the buyer/renter
          renter_id: isRentalOffer ? userId : undefined,
          buyer_id: !isRentalOffer ? userId : undefined,
          
          item_id: correctItemId,
            delivery_method:
              currentOffer.productDetails.deliveryMethod || "meetup",
            date_id: currentOffer.productDetails.date_id,
            time_id: currentOffer.productDetails.time_id,
            payment_mode:
              currentOffer.productDetails.paymentMethod || "payUponMeetup",
          transaction_type: transactionType,
          amount: totalAmount,
          location: currentOffer.productDetails.location || "",
          quantity: quantity, // Ensure quantity is always provided
          isFromCart: false,
          // Add item_type to help backend identify the correct model
          item_type: itemType,
          // Add original type to help with debugging
          original_type: currentOffer.productDetails.type || "",
          // Include sender information to help with owner/seller lookup
          sender_name: currentOffer.senderName || "",
          message_id: currentOffer.id,
          // Include any owner info we could gather
          ...ownerInfo,
          // Include extended item info for post transactions
          ...extendedItemInfo
        };
        
        // CRITICAL FIX: For post-type offers, explicitly add post_id field
        // This helps backend identify the correct model relationship
        if (itemType === "post" || itemType === "rental_from_post") {
          transactionDetails.post_id = correctItemId;
          // Also include the original productId as a fallback
          transactionDetails.original_product_id = currentOffer.productDetails.productId;
        }

        // Add time information if we extracted it successfully
        if (timeFrom && timeTo) {
          transactionDetails.timeFrom = timeFrom;
          transactionDetails.timeTo = timeTo;
        }

        console.log("Sending transaction details:", JSON.stringify(transactionDetails, null, 2));

        try {
          // Call backend API to create transaction
          const response = await axios.post(
            `${baseApi}/rental-transaction/add`,
            transactionDetails
          );

          // If payment method is GCASH/online, redirect to payment page
          if (currentOffer.productDetails.paymentMethod === "gcash") {
            if (!response.data.clientSecret || !response.data.paymentIntentId) {
              ShowAlert(dispatch, "error", "Error", "Failed to setup payment.");
              return;
            }

            // Close modal and navigate to payment
            setShowConfirmModal(false);
            navigate("/payment", {
              state: {
                paymentIntentId: response.data.paymentIntentId,
                clientSecretFromState: response.data.clientSecret,
                rentalId: response.data.id,
                userId: userId,
              },
            });
          } else {
            // Close modal and show success
            setShowConfirmModal(false);
            ShowAlert(
              dispatch,
              "success",
              "Success",
              `${isRentalOffer ? "Rental" : "Purchase"} confirmed successfully!`
            );
            
            // Navigate to appropriate transactions page based on offer type
            const transactionPath = isRentalOffer ? 
              "/profile/transactions/renter/requests" : 
              "/profile/transactions/buyer/requests";
            navigate(transactionPath);
          }
        } catch (error) {
          console.error("Error creating transaction:", error.response?.data || error);
          
          // Extract error message from error response
          let errorMsg = "Failed to create transaction record.";
          let errorTitle = "Error";
          
          if (error.response?.data) {
            // Check for specific owner/seller lookup errors
            if (error.response.data.details && 
                (error.response.data.details.includes("reading 'seller'") || 
                 error.response.data.details.includes("reading 'owner'"))) {
              
              console.error("Owner/Seller lookup error detected - attempting fallback method");
              
              // If we encounter the owner/seller null error, try a direct approach
              try {
                console.log("Attempting direct transaction creation for post-based offer");
                
                // Create an enhanced transaction object with all necessary data
                // to ensure the backend can create the transaction without model relationships
                const enhancedTransaction = {
                  ...transactionDetails,
                  // Make sure all critical owner/seller fields are present
                  owner_id: Number(currentOffer.sender),
                  seller_id: Number(currentOffer.sender),
                  item_name: currentOffer.productDetails.name || "Unknown Item",
                  item_price: offerPrice,
                  
                  // CRITICAL: Fix the transaction type to match post_type
                  // This is the key to fixing the item lookup in the backend
                  transaction_type: isRentalOffer ? "rental" : "sell",
                  
                  // Clear flags for post-based transactions
                  post_type: isRentalOffer ? "rental" : "sale",
                  from_post: true,
                  
                  // Flag to indicate this needs special handling
                  is_direct_transaction: true
                };
                
                console.log("Attempting direct transaction creation with enhanced data:", 
                  JSON.stringify(enhancedTransaction, null, 2));
                
                // Try again with the enhanced data
                const directResponse = await axios.post(
                  `${baseApi}/rental-transaction/add`,
                  enhancedTransaction
                );
                
                // If successful, proceed normally
                setShowConfirmModal(false);
                ShowAlert(
                  dispatch,
                  "success",
                  "Success",
                  `${isRentalOffer ? "Rental" : "Purchase"} confirmed successfully!`
                );
                
                const transactionPath = isRentalOffer ? 
                  "/profile/transactions/renter/requests" : 
                  "/profile/transactions/buyer/requests";
                navigate(transactionPath);
                return;
              } catch (directError) {
                console.error("Direct approach also failed:", directError.response?.data || directError);
                
                // If both approaches fail, provide a clearer error message
                errorMsg = "This post-based transaction could not be processed. There might be an issue with how the offer was created.";
                errorTitle = "Transaction Processing Error";
              }
            } 
            // Otherwise extract general error message
            else if (error.response.data.error) {
              errorMsg = error.response.data.error;
            }
            else if (error.response.data.message) {
              errorMsg = error.response.data.message;
            }
            else if (error.response.data.details) {
              errorMsg = error.response.data.details;
            }
          }
          
          // Show error and close modal
          ShowAlert(
            dispatch,
            "error",
            errorTitle,
            errorMsg
          );
          
          setShowConfirmModal(false);
        }
      } else {
        console.warn("Missing date_id or time_id in offer details");
        setShowConfirmModal(false);
        ShowAlert(
          dispatch,
          "warning",
          "Missing Information",
          "The offer is missing date or time information required for transaction."
        );
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      // Revert the UI state if the API call fails
      setAcceptedOffers((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(currentOffer.id);
        return newSet;
      });
      setShowConfirmModal(false);
      
      // Show user-friendly error message
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Failed to accept offer. Please try again."
      );
    }
  };

  // Add socket listener for offer acceptance
  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("offerAccepted", (data) => {
      setAcceptedOffers((prev) => new Set([...prev, data.messageId]));
    });

    socket.current.on("offerRejected", (data) => {
      setRejectedOffers((prev) => new Set([...prev, data.messageId]));
    });

    return () => {
      socket.current.off("offerAccepted");
      socket.current.off("offerRejected");
    };
  }, []);

  // New function to handle image click
  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  const handleProductCardClick = (productId, type) => {
    // console.log("Navigating with:", { productId, type });
    if (productId && type) {
      if (type === "rental-transaction") {
        // Navigate to rental transaction page
        navigate(`/transaction-progress/${productId}`);
      } else {
        // Default navigation for product listings
        navigate(`/${type}/${productId}`);
      }
    } else {
      // console.log("Cannot navigate: Missing required data", { productId, type });
    }
  };

  // Updated handleImageUpload function
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check total count including previously selected files
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      alert("Only image files are allowed");
      return;
    }

    // Add new files to selectedFiles state
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create preview URLs for display
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove selected image
  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to server
  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setUploadingImages(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("message_images", file);
      });

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/messages/upload-message-images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const data = await response.json();
      return data.images; // Array of image URLs
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
      throw error; // Add this line to propagate the error
    } finally {
      setUploadingImages(false);
    }
  };

  // Add function to toggle card expansion
  const toggleCardExpansion = (messageId, e) => {
    e.stopPropagation(); // Prevent card click from navigating
    setExpandedCards((prev) => {
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
      conversations.forEach((chat) => {
        // Check user name
        const nameMatch =
          chat.otherUser.first_name
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (chat.otherUser.last_name &&
            chat.otherUser.last_name
              .toLowerCase()
              .includes(query.toLowerCase()));

        // Check messages content
        const messageMatches = [];
        if (chat.messages && chat.messages.length > 0) {
          chat.messages.forEach((msg) => {
            // Check text content
            if (
              msg.text &&
              msg.text.toLowerCase().includes(query.toLowerCase())
            ) {
              messageMatches.push({
                messageId:
                  msg.id ||
                  `msg-${Date.now()}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                messageText: msg.text,
                timestamp: msg.createdAt,
                index: chat.messages.indexOf(msg), // Store the index for scrolling
              });
            }

            // Check product details
            if (msg.isProductCard && msg.productDetails) {
              const productDetails = msg.productDetails;
              if (
                (productDetails.name &&
                  productDetails.name
                    .toLowerCase()
                    .includes(query.toLowerCase())) ||
                (productDetails.status &&
                  productDetails.status
                    .toLowerCase()
                    .includes(query.toLowerCase()))
              ) {
                messageMatches.push({
                  messageId:
                    msg.id ||
                    `product-${Date.now()}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`,
                  messageText: `Product: ${productDetails.name}`,
                  timestamp: msg.createdAt,
                  isProduct: true,
                  index: chat.messages.indexOf(msg), // Store the index for scrolling
                });
              }
            }
          });
        }

        if (nameMatch || messageMatches.length > 0) {
          results.push({
            conversation: chat,
            nameMatch,
            messageMatches,
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
  const handleSearchResultClick = (
    conversation,
    messageId = null,
    messageIndex = null
  ) => {
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
          const messageElements = document.querySelectorAll(
            ".chat-message, .product-card"
          );
          if (messageElements && messageElements.length > messageIndex) {
            messageElement = messageElements[messageIndex];
          }
        }

        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add a temporary highlight class
          messageElement.classList.add("highlighted-message");

          // Remove highlight after a few seconds
          setTimeout(() => {
            setHighlightedMessageId(null);
            messageElement.classList.remove("highlighted-message");
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
      return searchResults.map((result) => result.conversation);
    }

    // Otherwise filter by read/unread status
    switch (messageFilter) {
      case "Read":
        return conversations.filter((chat) => !chat.hasUnread);
      case "Unread":
        return conversations.filter((chat) => chat.hasUnread);
      case "All":
      default:
        return conversations;
    }
  };

  // Add function to handle conversation menu actions
  const handleConversationAction = async (action, chat, e) => {
    e.stopPropagation(); // Prevent conversation click

    switch (action) {
      case "viewProfile":
        // Navigate directly to user profile using the same path as in ListingDetail.js
        navigate(`/user/${chat.otherUser.user_id}`);
        break;
      case "block":
        // Show confirmation dialog for blocking
        if (
          window.confirm(
            `Are you sure you want to block ${chat.otherUser.first_name}?`
          )
        ) {
          try {
            const response = await fetch(
              `${
                process.env.REACT_APP_API_URL || `${baseApi}`
              }/api/conversations/block`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  blockerId: studentUser.userId,
                  blockedId: chat.otherUser.user_id,
                }),
              }
            );

            if (response.ok) {
              // Update UI to show user is blocked
              setIsBlocked((prev) => ({
                ...prev,
                [chat.otherUser.user_id]: true,
              }));

              // Update conversation in the list
              setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                  conv.otherUser.user_id === chat.otherUser.user_id
                    ? { ...conv, isBlocked: true }
                    : conv
                )
              );

              ShowAlert(
                dispatch,
                "success",
                "User Blocked",
                `${chat.otherUser.first_name} has been blocked.`
              );

              // If this is the active chat, show the unblock button
              if (activeChat && activeChat.id === chat.id) {
                setShowUnblockButton(true);
              }

              // Emit socket event to notify the other user
              socket.current.emit("blockUser", {
                blockerId: studentUser.userId,
                blockedId: chat.otherUser.user_id,
              });
            } else {
              const errorData = await response.json();
              ShowAlert(
                dispatch,
                "error",
                "Error",
                errorData.error || "Failed to block user."
              );
            }
          } catch (error) {
            console.error("Error blocking user:", error);
            ShowAlert(
              dispatch,
              "error",
              "Error",
              "An unexpected error occurred."
            );
          }
        }
        break;
      case "report":
        // Check if user has already been reported
        if (hasReported[chat.otherUser.user_id]) {
          ShowAlert(
            dispatch,
            "info",
            "Already Reported",
            "You have already reported this user."
          );
          break;
        }

        // console.log("Showing report modal for user:", chat.otherUser);

        // Set the user to be reported and show the report modal
        setReportUser({
          id: chat.otherUser.user_id,
          name: `${chat.otherUser.first_name} ${
            chat.otherUser.last_name || ""
          }`,
        });
        setShowReportModal(true);
        break;
      case "delete":
        // Show confirmation dialog for deleting
        if (
          window.confirm(
            `Are you sure you want to delete this conversation with ${chat.otherUser.first_name}?`
          )
        ) {
          try {
            const response = await fetch(
              `${
                process.env.REACT_APP_API_URL || `${baseApi}`
              }/api/conversations/delete`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  conversationId: chat.id,
                  userId: studentUser.userId,
                }),
              }
            );

            if (response.ok) {
              // Remove conversation from local state
              setConversations((prevConversations) =>
                prevConversations.filter((conv) => conv.id !== chat.id)
              );

              // If this was the active chat, clear it
              if (activeChat && activeChat.id === chat.id) {
                setActiveChat(null);
              }

              ShowAlert(
                dispatch,
                "success",
                "Conversation Deleted",
                `Conversation with ${chat.otherUser.first_name} has been deleted.`
              );
            } else {
              const errorData = await response.json();
              ShowAlert(
                dispatch,
                "error",
                "Error",
                errorData.error || "Failed to delete conversation."
              );
            }
          } catch (error) {
            console.error("Error deleting conversation:", error);
            ShowAlert(
              dispatch,
              "error",
              "Error",
              "An unexpected error occurred."
            );
          }
        }
        break;
      case "unblock":
        try {
          const response = await fetch(
            `${
              process.env.REACT_APP_API_URL || `${baseApi}`
            }/api/conversations/unblock`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                blockerId: studentUser.userId,
                blockedId: chat.otherUser.user_id,
              }),
            }
          );

          if (response.ok) {
            // Update local state to reflect unblock
            setIsBlocked((prev) => {
              const updated = { ...prev };
              delete updated[chat.otherUser.user_id];
              return updated;
            });
            ShowAlert(
              dispatch,
              "success",
              "User Unblocked",
              "This user has been unblocked successfully."
            );
            setShowUnblockButton(false);

            // Update any conversations with this user
            setConversations((prevConversations) =>
              prevConversations.map((conv) =>
                conv.otherUser.user_id === chat.otherUser.user_id
                  ? { ...conv, isBlocked: false }
                  : conv
              )
            );

            // Emit socket event to notify the other user
            socket.current.emit("unblockUser", {
              unblockerId: studentUser.userId,
              unblockedId: chat.otherUser.user_id,
            });

            return true;
          } else {
            const errorData = await response.json();
            ShowAlert(
              dispatch,
              "error",
              "Error",
              errorData.error || "Failed to unblock user."
            );
            return false;
          }
        } catch (err) {
          console.error("Error unblocking user:", err);
          ShowAlert(
            dispatch,
            "error",
            "Error",
            "An unexpected error occurred while unblocking the user."
          );
          return false;
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
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }

      // Close active menu when clicking outside
      if (
        activeMenu &&
        menuRefs.current[activeMenu] &&
        !menuRefs.current[activeMenu].contains(event.target)
      ) {
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
      const response = await axios.get(`${baseApi}/api/reports/check`, {
        params: {
          reporter_id: studentUser.userId,
          reported_entity_id: userId,
        },
      });
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

    // console.log("Submitting report for user:", reportUser, "with reason:", reason);

    const reportData = {
      reporter_id: studentUser.userId,
      reported_entity_id: reportUser.id,
      entity_type: "user",
      reason: reason,
    };

    try {
      // console.log("Sending report data:", reportData);
      const response = await axios.post(`${baseApi}/api/reports`, reportData);
      // console.log("Report submission response:", response.data);

      // Update hasReported state
      setHasReported((prev) => ({
        ...prev,
        [reportUser.id]: true,
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
        // console.log("Skipping report check - no user or conversations");
        return;
      }

      // console.log("Checking reported users for", conversations.length, "conversations");

      const reported = {};
      for (const chat of conversations) {
        if (chat.otherUser && chat.otherUser.user_id) {
          const hasReported = await checkIfReported(chat.otherUser.user_id);
          if (hasReported) {
            reported[chat.otherUser.user_id] = true;
            // console.log(`User ${chat.otherUser.user_id} has been reported`);
          }
        }
      }
      setHasReported(reported);
    };

    checkReportedUsers();
  }, [conversations]);

  // Handle blocking a user
  const handleBlockUser = async (userId) => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/block`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockerId: studentUser.userId,
            blockedId: userId,
          }),
        }
      );

      if (response.ok) {
        // Update local state to reflect block
        setIsBlocked((prev) => ({
          ...prev,
          [userId]: true,
        }));

        // Update any conversations with this user
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.otherUser.user_id === userId
              ? { ...conv, isBlocked: true }
              : conv
          )
        );

        ShowAlert(
          dispatch,
          "success",
          "User Blocked",
          "This user has been blocked successfully."
        );

        // Emit socket event to notify the other user
        socket.current.emit("blockUser", {
          blockerId: studentUser.userId,
          blockedId: userId,
        });

        return true;
      } else {
        const errorData = await response.json();
        ShowAlert(
          dispatch,
          "error",
          "Error",
          errorData.error || "Failed to block user."
        );
        return false;
      }
    } catch (err) {
      console.error("Error blocking user:", err);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "An unexpected error occurred while blocking the user."
      );
      return false;
    }
  };

  // Handle unblocking a user
  const handleUnblockUser = async (userId) => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/unblock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockerId: studentUser.userId,
            blockedId: userId,
          }),
        }
      );

      if (response.ok) {
        // Update local state to reflect unblock
        setIsBlocked((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
        ShowAlert(
          dispatch,
          "success",
          "User Unblocked",
          "This user has been unblocked successfully."
        );
        setShowUnblockButton(false);

        // Update any conversations with this user
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.otherUser.user_id === userId
              ? { ...conv, isBlocked: false }
              : conv
          )
        );

        // Emit socket event to notify the other user
        socket.current.emit("unblockUser", {
          unblockerId: studentUser.userId,
          unblockedId: userId,
        });

        return true;
      } else {
        const errorData = await response.json();
        ShowAlert(
          dispatch,
          "error",
          "Error",
          errorData.error || "Failed to unblock user."
        );
        return false;
      }
    } catch (err) {
      console.error("Error unblocking user:", err);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "An unexpected error occurred while unblocking the user."
      );
      return false;
    }
  };

  // Handle deleting a conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationId,
            userId: studentUser.userId,
          }),
        }
      );

      if (response.ok) {
        // Remove conversation from local state
        setConversations((prevConversations) =>
          prevConversations.filter((conv) => conv.id !== conversationId)
        );

        // If this was the active chat, clear it
        if (activeChat && activeChat.id === conversationId) {
          setActiveChat(null);
        }

        ShowAlert(
          dispatch,
          "success",
          "Conversation Deleted",
          "The conversation has been deleted successfully."
        );
        return true;
      } else {
        const errorData = await response.json();
        ShowAlert(
          dispatch,
          "error",
          "Error",
          errorData.error || "Failed to delete conversation."
        );
        return false;
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "An unexpected error occurred while deleting the conversation."
      );
      return false;
    }
  };

  // Helper function to fetch a conversation that was previously deleted
  const fetchDeletedConversation = async (conversationId) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || `${baseApi}`
        }/api/conversations/single/${conversationId}/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.conversation) {
          // Add the conversation to our state
          setConversations((prev) => {
            // Make sure we don't add duplicate conversations
            if (!prev.some((conv) => conv.id === data.conversation.id)) {
              const updatedConvs = [...prev, data.conversation];
              // Sort conversations by most recent activity
              return updatedConvs.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
              );
            }
            return prev;
          });

          // Set conversation as unread
          setUnreadMessages((prev) => ({
            ...prev,
            [conversationId]: true,
          }));

          // Set block status if needed
          if (data.conversation.isBlocked) {
            setIsBlocked((prev) => ({
              ...prev,
              [data.conversation.otherUser.user_id]: true,
            }));
          }

          if (data.conversation.blockedBy) {
            setBlockedBy((prev) => ({
              ...prev,
              [data.conversation.otherUser.user_id]: true,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching deleted conversation:", error);
    }
  };

  // Sort conversations helper - used to sort by recent activity
  const sortConversationsByLatestActivity = (conversations) => {
    return [...conversations].sort((a, b) => {
      // First, prioritize conversations with unread messages
      if (a.hasUnread && !b.hasUnread) return -1;
      if (!a.hasUnread && b.hasUnread) return 1;

      // Then check for latest messages in each conversation
      const aLatestMessageTime =
        a.messages && a.messages.length > 0
          ? new Date(a.messages[a.messages.length - 1].createdAt)
          : new Date(a.updatedAt);

      const bLatestMessageTime =
        b.messages && b.messages.length > 0
          ? new Date(b.messages[b.messages.length - 1].createdAt)
          : new Date(b.updatedAt);

      // Sort by most recent activity (message or conversation update)
      return bLatestMessageTime - aLatestMessageTime;
    });
  };

  // Add CSS for image preview positioning
  const messageInputStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    width: "100%",
  };

  const previewContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginBottom: "10px",
  };

  // Add this CSS for the accepted offer badge
  const acceptedOfferBadgeStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 12px",
    borderRadius: "4px",
    fontWeight: "bold",
    display: "inline-block",
    pointerEvents: "none",
  };

  // Add a new function to handle rejecting offers
  const handleRejectOffer = async (message) => {
    try {
      // Add the message ID to rejected offers
      setRejectedOffers((prev) => new Set([...prev, message.id]));

      // Emit socket event to notify other user
      socket.current.emit("offerRejected", {
        messageId: message.id,
        conversationId: activeChat.id,
        recipient: message.sender,
        sender: userId,
      });

      // Update the offer status in the backend
      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? baseApi}/api/messages/${message.id}/offer-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rejected",
            userId: userId,
            recipientId: message.sender,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update offer status");
      }

      ShowAlert(
        dispatch,
        "info",
        "Offer Rejected",
        "You have rejected this offer."
      );
    } catch (error) {
      console.error("Error rejecting offer:", error);
      // Revert the UI state if the API call fails
      setRejectedOffers((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(message.id);
        return newSet;
      });
      
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Failed to reject offer. Please try again."
      );
    }
  };

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
                className={`selected-filter ${
                  showFilterDropdown ? "open" : ""
                }`}
                onClick={toggleFilterDropdown}
              >
                {messageFilter} <span className="dropdown-arrow">▼</span>
              </div>
              {showFilterDropdown && (
                <div className="filter-options">
                  <div
                    className={`filter-option ${
                      messageFilter === "All" ? "active" : ""
                    }`}
                    onClick={() => selectFilter("All")}
                  >
                    All
                  </div>
                  <div
                    className={`filter-option ${
                      messageFilter === "Read" ? "active" : ""
                    }`}
                    onClick={() => selectFilter("Read")}
                  >
                    Read
                  </div>
                  <div
                    className={`filter-option ${
                      messageFilter === "Unread" ? "active" : ""
                    }`}
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
                <button className="clear-search" onClick={clearSearch}>
                  <FiX size={12} />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p>Loading conversations...</p>
          ) : isSearching && searchResults.length === 0 ? (
            <p className="no-conversations">
              No results found for "{searchQuery}"
            </p>
          ) : getFilteredConversations().length > 0 ? (
            <div className="inbox-list">
              {isSearching
                ? // Display search results with message previews
                  searchResults.map((result) => {
                    const chat = result.conversation;
                    const hasUnreadMessages = chat.hasUnread;

                    return (
                      <div key={chat.id} className="search-result-group">
                        <div
                          className={`inbox-item ${
                            hasUnreadMessages ? "unread" : ""
                          } ${result.nameMatch ? "name-match" : ""}`}
                          onClick={() => handleSearchResultClick(chat)}
                        >
                          {chat.otherUser.profile_pic ? (
                            <img
                              src={chat.otherUser.profile_pic}
                              alt={`${chat.otherUser.first_name}'s profile`}
                              className="user-icon"
                              onError={(e) => {
                                e.target.src = UserIcon;
                              }}
                            />
                          ) : (
                            <img
                              src={UserIcon}
                              alt={`${chat.otherUser.first_name}'s profile`}
                              className="user-icon"
                            />
                          )}
                          <div className="message-info">
                            <h5>{chat.otherUser.first_name}</h5>
                            <p className="preview-message">
                              {result.nameMatch ? (
                                <span className="match-highlight">
                                  Name matches your search
                                </span>
                              ) : (
                                `${result.messageMatches.length} message${
                                  result.messageMatches.length > 1 ? "s" : ""
                                } found`
                              )}
                            </p>
                          </div>
                          <div className="message-meta">
                            <span className="timestamp">
                              {chat.messages && chat.messages.length > 0
                                ? new Date(
                                    chat.messages[
                                      chat.messages.length - 1
                                    ].createdAt
                                  ).toLocaleString()
                                : ""}
                            </span>
                            {hasUnreadMessages && (
                              <div className="unread-indicator"></div>
                            )}
                          </div>
                          <div
                            className="conversation-menu"
                            ref={(el) => (menuRefs.current[chat.id] = el)}
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
                                  onClick={(e) =>
                                    handleConversationAction(
                                      "viewProfile",
                                      chat,
                                      e
                                    )
                                  }
                                >
                                  View Profile
                                </div>
                                <div
                                  className="menu-option"
                                  onClick={(e) =>
                                    handleConversationAction(
                                      isBlocked[chat.otherUser.user_id]
                                        ? "unblock"
                                        : "block",
                                      chat,
                                      e
                                    )
                                  }
                                >
                                  {isBlocked[chat.otherUser.user_id]
                                    ? "Unblock"
                                    : "Block"}
                                </div>
                                <div
                                  className="menu-option"
                                  onClick={(e) => {
                                    // console.log("Report button clicked", chat.otherUser);
                                    handleConversationAction("report", chat, e);
                                  }}
                                >
                                  Report
                                </div>
                                <div
                                  className="menu-option delete"
                                  onClick={(e) =>
                                    handleConversationAction("delete", chat, e)
                                  }
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
                                onClick={() =>
                                  handleSearchResultClick(
                                    chat,
                                    match.messageId,
                                    match.index
                                  )
                                }
                              >
                                <div className="message-match-content">
                                  <p className="message-match-text">
                                    {match.isProduct ? (
                                      <span className="product-match">
                                        {match.messageText}
                                      </span>
                                    ) : match.messageText.length > 50 ? (
                                      `${match.messageText.substring(0, 50)}...`
                                    ) : (
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
                : // Regular conversation list
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
                        className={`inbox-item ${
                          hasUnreadMessages ? "unread" : ""
                        }`}
                        onClick={() => handleConversationClick(chat)}
                      >
                        {chat.otherUser.profile_pic ? (
                          <img
                            src={chat.otherUser.profile_pic}
                            alt={`${chat.otherUser.first_name}'s profile`}
                            className="user-icon"
                            onError={(e) => {
                              e.target.src = UserIcon;
                            }}
                          />
                        ) : (
                          <img
                            src={UserIcon}
                            alt={`${chat.otherUser.first_name}'s profile`}
                            className="user-icon"
                          />
                        )}
                        <div className="message-info">
                          <h5>{chat.otherUser.first_name}</h5>
                          <p className="preview-message">
                            {latestMessage
                              ? latestMessage.images &&
                                latestMessage.images.length > 0
                                ? "Sent a Photo"
                                : latestMessage.isProductCard
                                ? "Shared a product"
                                : latestMessage.text &&
                                  latestMessage.text.length > 30
                                ? `${latestMessage.text.substring(0, 30)}...`
                                : latestMessage.text
                              : "No messages yet"}
                          </p>
                        </div>
                        <div className="message-meta">
                          <span className="timestamp">
                            {latestMessage
                              ? new Date(
                                  latestMessage.createdAt
                                ).toLocaleString()
                              : ""}
                          </span>
                          {hasUnreadMessages && (
                            <div className="unread-indicator"></div>
                          )}
                        </div>
                        <div
                          className="conversation-menu"
                          ref={(el) => (menuRefs.current[chat.id] = el)}
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
                                onClick={(e) =>
                                  handleConversationAction(
                                    "viewProfile",
                                    chat,
                                    e
                                  )
                                }
                              >
                                View Profile
                              </div>
                              <div
                                className="menu-option"
                                onClick={(e) =>
                                  handleConversationAction(
                                    isBlocked[chat.otherUser.user_id]
                                      ? "unblock"
                                      : "block",
                                    chat,
                                    e
                                  )
                                }
                              >
                                {isBlocked[chat.otherUser.user_id]
                                  ? "Unblock"
                                  : "Block"}
                              </div>
                              <div
                                className="menu-option"
                                onClick={(e) => {
                                  // console.log("Report button clicked", chat.otherUser);
                                  handleConversationAction("report", chat, e);
                                }}
                              >
                                Report
                              </div>
                              <div
                                className="menu-option delete"
                                onClick={(e) =>
                                  handleConversationAction("delete", chat, e)
                                }
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
              <div className="chat-user-info">
                {activeChat.otherUser.profile_pic ? (
                  <img
                    src={activeChat.otherUser.profile_pic}
                    alt={`${activeChat.otherUser.first_name}'s profile`}
                    className="user-icon"
                    onError={(e) => {
                      e.target.src = UserIcon;
                    }}
                  />
                ) : (
                  <img
                    src={UserIcon}
                    alt={`${activeChat.otherUser.first_name}'s profile`}
                    className="user-icon"
                  />
                )}
                <h4>{activeChat.otherUser.first_name}</h4>
              </div>
            </div>

            <div className="chat-content" ref={chatContentRef}>
              {activeChat.messages && activeChat.messages.length > 0 ? (
                activeChat.messages.map((message, index) =>
                  message.isProductCard ? (
                    <div
                      key={index}
                      id={`message-${message.id}`}
                      className={`product-card ${
                        highlightedMessageId === message.id
                          ? "highlighted-message"
                          : ""
                      }`}
                      onClick={() =>
                        handleProductCardClick(
                          message.productDetails?.productId,
                          message.productDetails?.type
                        )
                      }
                      style={{
                        cursor: message.productDetails?.productId
                          ? "pointer"
                          : "default",
                      }}
                    >
                      <div className="product-card-header">
                        <h6>
                          {message.productDetails?.title === "Offer"
                            ? "Offer for this item"
                            : "Inquiring about this item"}
                        </h6>
                        <button
                          className={`expand-toggle-btn ${
                            expandedCards.has(message.id) ? "expanded" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click from navigating
                            toggleCardExpansion(message.id, e);
                          }}
                        >
                          {expandedCards.has(message.id) ? "−" : "+"}
                        </button>
                      </div>
                      <div className="d-flex align-items-start">
                        <img
                          src={message.productDetails?.image}
                          alt={message.productDetails?.name}
                          className="me-3"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
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
                              Offered Price: ₱
                              {message.productDetails?.offerPrice}
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
                                {/* Show either Accept Offer button or Accepted status,
                                    BUT ONLY if this is an offer, not an inquiry */}
                                {message.productDetails?.title === "Offer" &&
                                  (isRecipient(message) ? (
                                    message.offerStatus === "accepted" || acceptedOffers.has(message.id) ? (
                                      <div className="accepted-offer-badge">
                                        Offer Accepted
                                      </div>
                                    ) : message.offerStatus === "rejected" || rejectedOffers.has(message.id) ? (
                                      <div className="rejected-offer-badge" style={{ backgroundColor: "#d9534f", color: "white", padding: "8px 12px", borderRadius: "4px", fontWeight: "bold", display: "inline-block" }}>
                                        Offer Rejected
                                      </div>
                                    ) : (
                                      <div className="offer-action-buttons" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                                        <button
                                          type="button"
                                          className="btn btn-danger"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            handleRejectOffer(message);
                                          }}
                                        >
                                          Reject Offer
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-primary"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            handleAcceptOffer(message);
                                          }}
                                        >
                                          Accept Offer
                                        </button>
                                      </div>
                                    )
                                  ) : (
                                    (message.offerStatus === "accepted" || acceptedOffers.has(message.id)) ? (
                                      <div className="accepted-offer-badge">
                                        Offer Accepted
                                      </div>
                                    ) : (message.offerStatus === "rejected" || rejectedOffers.has(message.id)) ? (
                                      <div className="rejected-offer-badge" style={{ backgroundColor: "#d9534f", color: "white", padding: "8px 12px", borderRadius: "4px", fontWeight: "bold", display: "inline-block" }}>
                                        Offer Rejected
                                      </div>
                                    ) : null
                                  ))}
                              </div>
                            </>
                          ) : null}

                          {/* Display additional offer details only when expanded */}
                          {expandedCards.has(message.id) && (
                            <div className="additional-details mt-3">
                              {message.productDetails?.deliveryMethod && (
                                <p className="mb-1">
                                  <strong>Delivery:</strong>{" "}
                                  {message.productDetails.deliveryMethod ===
                                  "meetup"
                                    ? "Meet up"
                                    : "Pick up"}
                                </p>
                              )}

                              {message.productDetails?.paymentMethod && (
                                <p className="mb-1">
                                  <strong>Payment:</strong>{" "}
                                  {message.productDetails.paymentMethod ===
                                  "gcash"
                                    ? "Online Payment"
                                    : "Pay upon meetup"}
                                </p>
                              )}

                              {message.productDetails?.itemCondition && (
                                <p className="mb-1">
                                  <strong>Condition:</strong>{" "}
                                  {message.productDetails.itemCondition}
                                </p>
                              )}

                              {message.productDetails?.location && (
                                <p className="mb-1">
                                  <strong>Location:</strong>{" "}
                                  {message.productDetails.location}
                                </p>
                              )}

                              {message.productDetails?.stock &&
                                !message.productDetails?.terms && (
                                  <p className="mb-1">
                                    <strong>Stock:</strong>{" "}
                                    {message.productDetails.stock}
                                  </p>
                                )}

                              {/* Display terms if available and if product is for rent */}
                              {message.productDetails?.terms &&
                                Object.values(
                                  message.productDetails.terms
                                ).some((term) => term) && (
                                  <div className="terms-details mt-2">
                                    <p className="mb-1">
                                      <strong>Terms & Conditions:</strong>
                                    </p>
                                    <div style={{ fontSize: "0.85rem" }}>
                                      {message.productDetails.terms
                                        .lateCharges && (
                                        <p className="mb-0">
                                          • Late Charges:{" "}
                                          {
                                            message.productDetails.terms
                                              .lateCharges
                                          }
                                        </p>
                                      )}
                                      {message.productDetails.terms
                                        .securityDeposit && (
                                        <p className="mb-0">
                                          • Security Deposit:{" "}
                                          {
                                            message.productDetails.terms
                                              .securityDeposit
                                          }
                                        </p>
                                      )}
                                      {message.productDetails.terms
                                        .repairReplacement && (
                                        <p className="mb-0">
                                          • Repair/Replacement:{" "}
                                          {
                                            message.productDetails.terms
                                              .repairReplacement
                                          }
                                        </p>
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
                        highlightedMessageId === message.id
                          ? "highlighted-message"
                          : ""
                      }`}
                    >
                      {message.images &&
                        Array.isArray(message.images) &&
                        message.images.length > 0 && (
                          <div className="image-grid">
                            {message.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Content ${idx}`}
                                className="img-fluid rounded"
                                onClick={() => handleImageClick(img)}
                                style={{ cursor: "pointer" }}
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
                <p className="no-messages">
                  No messages yet. Start a conversation!
                </p>
              )}
            </div>

            {/* Block status messages displayed where new messages would appear */}
            {isBlocked[activeChat.otherUser.user_id] && (
              <div className="block-status-message">
                <p>
                  You've blocked this user. You can't send or receive messages.
                </p>
                <button
                  className="unblock-button"
                  onClick={() =>
                    handleConversationAction("unblock", activeChat, {
                      stopPropagation: () => {},
                    })
                  }
                >
                  Unblock
                </button>
              </div>
            )}

            {blockedBy[activeChat.otherUser.user_id] && (
              <div className="block-status-message">
                <p>You can't message this user because they've blocked you.</p>
              </div>
            )}

            <div className="chat-input" style={messageInputStyle}>
              {selectedImages.length > 0 && (
                <div
                  className="preview-container"
                  style={previewContainerStyle}
                >
                  {selectedImages.map((img, index) => (
                    <div
                      key={index}
                      className="position-relative"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        className="img-thumbnail"
                        onClick={() => handleImageClick(img)}
                        style={{ cursor: "pointer" }}
                      />
                      <button
                        className="position-absolute top-0 start-100 translate-middle p-0 border-0 bg-transparent"
                        onClick={() => removeImage(index)}
                        style={{
                          width: "20px",
                          height: "20px",
                          minWidth: "20px",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-danger"
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <FiX size={12} color="white" />
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="input-group d-flex flex-row g-0 p-0 m-0">
                <button
                  className="btn btn-light attach-btn g-0 p-0 m-0"
                  onClick={() => fileInputRef.current.click()}
                  disabled={
                    isBlocked[activeChat.otherUser.user_id] ||
                    blockedBy[activeChat.otherUser.user_id]
                  }
                >
                  <FiPaperclip />
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                  />
                </button>

                <input
                  type="text"
                  className="form-control flex-grow-1 g-0 m-0 py-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleSendMessage(newMessage, activeChat.otherUser.user_id)
                  }
                  placeholder={
                    isBlocked[activeChat.otherUser.user_id]
                      ? "You've blocked this user"
                      : blockedBy[activeChat.otherUser.user_id]
                      ? "You've been blocked by this user"
                      : "Type a message..."
                  }
                  disabled={
                    isBlocked[activeChat.otherUser.user_id] ||
                    blockedBy[activeChat.otherUser.user_id]
                  }
                />

                <button
                  className="btn btn-primary g-0 p-0 m-0"
                  onClick={() =>
                    handleSendMessage(newMessage, activeChat.otherUser.user_id)
                  }
                  disabled={
                    isBlocked[activeChat.otherUser.user_id] ||
                    blockedBy[activeChat.otherUser.user_id]
                  }
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
            style={{ maxWidth: "100%", maxHeight: "70vh" }}
          />
        </Modal.Body>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        handleClose={() => {
          // console.log("Closing report modal");
          setShowReportModal(false);
          setReportUser(null);
        }}
        handleSubmit={handleReportSubmit}
      />

      {/* Offer Confirmation Modal */}
      {showConfirmModal && currentOffer && (
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {currentOffer.productDetails?.terms
                ? "Confirm Rental"
                : "Confirm Purchase"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="confirmation-modal">
              <div className="item-card">
                <div className="img-container">
                  <img
                    src={currentOffer.productDetails?.image}
                    style={{ height: "100px", width: "100px" }}
                    alt="Item image"
                  />
                </div>
                <div className="item-desc">
                  <span className="value">
                    {currentOffer.productDetails?.name}
                  </span>
                  <span className="value">
                    ₱{currentOffer.productDetails?.offerPrice}
                  </span>
                  {currentOffer.productDetails?.itemCondition && (
                    <span className="label">
                      Item Condition:{" "}
                      <span className="value">
                        {currentOffer.productDetails.itemCondition}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="rental-desc">
                {currentOffer.productDetails?.deliveryMethod && (
                  <span className="label">
                    Delivery Method:{" "}
                    <span className="value">
                      {currentOffer.productDetails.deliveryMethod === "meetup"
                        ? "Meet up"
                        : "Pick up"}
                    </span>
                  </span>
                )}
                {currentOffer.productDetails?.paymentMethod && (
                  <span className="label">
                    Payment Method:{" "}
                    <span className="value">
                      {currentOffer.productDetails.paymentMethod === "gcash"
                        ? "Online Payment"
                        : "Pay upon meetup"}
                    </span>
                  </span>
                )}
                {currentOffer.productDetails?.location && (
                  <span className="label">
                    Location:{" "}
                    <span className="value">
                      {currentOffer.productDetails.location}
                    </span>
                  </span>
                )}
                {currentOffer.productDetails?.stock &&
                  !currentOffer.productDetails?.terms && (
                    <span className="label">
                      Stock:{" "}
                      <span className="value">
                        {currentOffer.productDetails.stock}
                      </span>
                    </span>
                  )}
                {currentOffer.productDetails?.date_id && (
                  <span className="label">
                    Date:{" "}
                    <span className="value">
                      {currentOffer.productDetails.status &&
                        currentOffer.productDetails.status
                          .split("\n")[0]
                          .replace("Date: ", "")}
                    </span>
                  </span>
                )}
                {currentOffer.productDetails?.time_id && (
                  <span className="label">
                    Duration:{" "}
                    <span className="value">
                      {currentOffer.productDetails.status &&
                        currentOffer.productDetails.status
                          .split("\n")[1]
                          .replace("Duration: ", "")}
                    </span>
                  </span>
                )}
              </div>
              {currentOffer.productDetails?.terms &&
                Object.values(currentOffer.productDetails.terms).some(
                  (term) => term
                ) && (
                  <div className="terms-condition">
                    {currentOffer.productDetails.terms.lateCharges && (
                      <span className="label">
                        Late Charges:{" "}
                        <span className="value">
                          {currentOffer.productDetails.terms.lateCharges}
                        </span>
                      </span>
                    )}
                    {currentOffer.productDetails.terms.securityDeposit && (
                      <span className="label">
                        Security Deposit:{" "}
                        <span className="value">
                          {currentOffer.productDetails.terms.securityDeposit}
                        </span>
                      </span>
                    )}
                    {currentOffer.productDetails.terms.repairReplacement && (
                      <span className="label">
                        Repair and Replacement:{" "}
                        <span className="value">
                          {currentOffer.productDetails.terms.repairReplacement}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              <span>
                By confirming your{" "}
                {currentOffer.productDetails?.terms ? "rental" : "purchase"},
                you agree to the platform's Policies, Terms and Conditions, and
                the terms with the other party (as shown above).
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmAcceptOffer}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default MessagePage;
