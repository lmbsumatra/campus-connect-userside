import React, { useEffect, useState } from "react";
import "./inboxStyles.css";
import UserIcon from "../../../../assets/images/icons/user-icon.svg";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import ProductCard from "./ProductCard"; // Assuming this component is used for product display

const MessagePage = ({ currentUser }) => {
  console.log(currentUser)
  const [conversation, setConversation] = useState();
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newMessage, setNewMessage] = useState("");
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle window resize event
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data when the conversation changes
  // useEffect(() => {
  //   if (!conversation || conversation.length === 0 || !conversation[0].member) return;

  //   const friendId = conversation[0].member.find((m) => m !== currentUser.userId);

  //   if (!friendId) {
  //     console.log("Friend ID is missing");
  //     return;
  //   }

  //   const getUser = async () => {
  //     try {
  //       const res = await axios.get(`http://localhost:3001/user?userId=` + friendId);
  //       console.log("Fetched user data:", res.data);
  //       if (res.data && res.data.first_name) {
  //         setUser(res.data);
  //       } else {
  //         console.log("User data is incomplete or missing first_name");
  //       }
  //     } catch (err) {
  //       console.log("Error fetching user data:", err);
  //     }
  //   };

  //   getUser();
  // }, [conversation, currentUser]);
  // Fetch conversations on userId change
  useEffect(() => {
    if (!userId) {
      console.log("User ID is missing");
      return;
    }

    const getConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/conversations/` + userId
        );
        console.log("Fetched conversations: ", res.data);
        setConversation(res.data);
        console.log("this", conversation?.user?.user_id);
        setIsLoading(false);

        // if (Array.isArray(res.data)) {
        //   setConversation(res.data.conversations);
        // } else {
        //   console.error("Error: Response is not an array", res.data);
        // }
      } catch (err) {
        console.log("Error fetching conversations:", err);
      }
    };
    if (userId) {
      getConversations();
    }
  }, [userId]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const updatedMessages = [
        ...activeChat.messages,
        { sender: "User name 1", time: "7:45", content: newMessage },
      ];
      setActiveChat({ ...activeChat, messages: updatedMessages });
      setNewMessage("");
    }
  };

  const handleConversationClick = (conversation) => {
    setActiveChat(conversation);

    console.log(conversation);
  };

  return (
    <div className="container-content message-page">
      <div className="message-content">
        <div
          className={`inbox ${isMobile && activeChat !== null ? "d-none" : ""}`}
        >
          <h3>Messages</h3>
          {conversation ? (
            <>
              <div>
                Conversations Count: {conversation.conversations.length}
              </div>
              {conversation.conversations.length > 0 ? (
                conversation.conversations.map((chat) => {
                  // Determine the user's first name based on user_id in the conversation
                  const chatUserId = chat.user_id;
                  const isCurrentUser =
                    chatUserId === conversation.user.user_id; // check if the user in chat is the current user
                  const displayName = !isCurrentUser
                    ? "You"
                    : chat.otherUser.first_name; // You can customize this based on your logic

                  return (
                    <div
                      key={chat.id}
                      className="inbox-item"
                      onClick={() =>
                        handleConversationClick(chat)
                      }
                    >
                      <img
                        src={UserIcon}
                        alt="User Icon"
                        className="user-icon"
                      />
                      <div className="message-info">
                        <h5>{isLoading ? "Loading..." : displayName}</h5>
                        <p>{chat.preview}</p>
                      </div>
                      <span>{chat.date}</span>
                    </div>
                  );
                })
              ) : (
                <p>No conversations available.</p>
              )}
            </>
          ) : (
            <p>Loading conversations...</p>
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
              <h4>{user ? user.first_name : "Loading..."}</h4>
            </div>
            <div className="chat-content">
              {activeChat.messages && activeChat.messages.length > 0 ? (
                activeChat.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      message.sender === String(userId) // string kasi sa db eh
                        ? "sent"
                        : "received"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span>{message.createdAt}</span>
                  </div>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
