import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";
import {
  resetFollowState,
  updateUserAction,
} from "../../redux/user/allUsersSlice";
import ShowAlert from "../../utils/ShowAlert";
import { Follow, FollowBack, Following } from "../../utils/consonants";

import "./userCardStyles.css";
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
      updateUserAction({
        loggedInUserId: loggedInUserId,
        otherUserId: user.id,
      })
    );
  };

  // 🔥 Move ShowAlert to useEffect to trigger AFTER Redux state updates
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
                    onClick={(e) => navigate("/profile")}
                  >
                    Go to profile
                  </button>
                  <button
                    className="btn btn-rectangle secondary"
                    onClick={(e) => navigate("/profile")}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Message button clicked");
                    }}
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
