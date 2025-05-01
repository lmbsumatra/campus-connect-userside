import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";
import {
  resetFollowState,
  updateUserAction,
} from "../../redux/user/allUsersSlice";
import ShowAlert from "../../utils/ShowAlert";
import { Follow, FollowBack, Following, baseApi } from "../../utils/consonants";

import "./userCardStyles.css";
import { updateUserActionById } from "../../redux/user/otherUserSlice";

const UserCard = ({ users }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const studentUser = useSelector(selectStudentUser);
  const loggedInUserId = studentUser?.userId || null;

  const { loadingFollow, successFollow, errorFollow } = useSelector(
    (state) => state.allUsers
  );

  // Local state to store the last action performed (Followed/Unfollowed)
  const [lastAction, setLastAction] = useState(null);
  const [lastUser, setLastUser] = useState(null); // Store the last user for the alert

  const handleFollowAction = (e, user) => {
    e.stopPropagation();

    let action = "";
    if (user.action === Follow) {
      action = "Followed";
    } else if (user.action === Following) {
      action = "Unfollowed";
    } else if (user.action === FollowBack) {
      action = "Followed";
    }

    setLastAction(action); // Save action for later alert
    setLastUser(user); // Save user for later alert

    dispatch(
      updateUserActionById({
        loggedInUserId: loggedInUserId,
        otherUserId: user.id,
      })
    );
  };

  // Show Alert to trigger AFTER Redux state updates
  useEffect(() => {
    if (successFollow && lastUser) {
      ShowAlert(dispatch, "success", `${lastAction} ${lastUser.fname}`);
      dispatch(resetFollowState());
    }
    if (errorFollow) {
      ShowAlert(dispatch, "error", `${errorFollow}`);
      dispatch(resetFollowState());
    }
  }, [successFollow, errorFollow, dispatch, lastAction, lastUser]);

  const handleMessageClick = async (e, user) => {
    e.stopPropagation(); // Prevent navigation to profile
    
    const otherUserId = user?.id;

    if (!loggedInUserId) {
      ShowAlert(
        dispatch,
        "error",
        "You need to be logged in to send messages"
      );
      return;
    }

    if (!otherUserId) {
      ShowAlert(
        dispatch,
        "error",
        "Recipient information not available"
      );
      return;
    }

    // Don't allow messaging yourself
    if (otherUserId === loggedInUserId) {
      ShowAlert(dispatch, "info", "You cannot message yourself");
      return;
    }

    try {
      // Create/get a conversation with the user
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || baseApi}/api/conversations/createConversation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: loggedInUserId,
            ownerId: otherUserId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create conversation");
      }

      const conversationData = await response.json();

      // Navigate to messages with the conversation already active
      navigate("/messages", {
        state: {
          activeConversationId: conversationData.id,
          recipientId: otherUserId,
          recipientName: `${user.fname} ${user.lname || ''}`.trim(),
          recipientProfilePic: user.profilePic,
        },
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      ShowAlert(
        dispatch,
        "error",
        error.message || "Failed to start conversation"
      );
    }
  };

  return (
    <div className="users-container">
      {Array.isArray(users) &&
        users.map((user, index) => (
          <div
            className="user-card"
            onClick={() =>
              navigate(
                loggedInUserId === user.id ? `/profile` : `/user/${user.id}`
              )
            }
            key={index}
          >
            <div className="user">
              <div className="user-img">
                <img src={user.profilePic} alt={`${user.fname} profile`} />
              </div>

              <div className="user-details">
                <span>
                  <strong>
                    {user.fname} {user?.mname} {user.lname}
                  </strong>
                </span>
                <span>
                  {user.college} | ⭐ {user.rating}
                </span>
                {user.mutualFriends?.length > 0 && (
                  <div className="mutuals-container">
                    <div className="mutual-user">
                      {user.mutualFriends.slice(0, 3).map((mutual, idx) => (
                        <div className="user-img" key={idx}>
                          <img src={mutual.profilePic} alt="Mutual friend" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="action-btns">
              {user.action && user.action === "You" ? (
                <>
                  <button
                    className="btn btn-rectangle primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/profile");
                    }}
                  >
                    Go to profile
                  </button>
                  <button
                    className="btn btn-rectangle secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/profile/edit-profile");
                    }}
                  >
                    Edit profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-rectangle primary"
                    onClick={(e) => {
                      handleFollowAction(e, user);
                    }}
                  >
                    {user.action}
                  </button>
                  <button
                    className="btn btn-rectangle secondary"
                    onClick={(e) => handleMessageClick(e, user)}
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default UserCard;